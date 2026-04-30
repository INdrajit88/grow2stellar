#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, Symbol};
use soroban_sdk::token::Client as TokenClient;

#[contracttype]
pub enum DataKey {
    Admin,
    Token,
    Proof(BytesN<32>), // Registry to store claimed proof hashes
}

#[contract]
pub struct Grow2StellarEscrow;

#[contractimpl]
impl Grow2StellarEscrow {
    /// Initialize the contract with the organizer's address and the reward token contract.
    pub fn init(env: Env, admin: Address, token: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Token, &token);
    }

    /// The organizer deposits funds into the escrow contract.
    pub fn deposit_budget(env: Env, from: Address, amount: i128) {
        from.require_auth();
        
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if from != admin {
            panic!("Only the organizer can deposit");
        }
        
        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = TokenClient::new(&env, &token);
        
        // Transfer funds from `from` to this contract's address
        token_client.transfer(&from, &env.current_contract_address(), &amount);
    }

    /// The organizer approves a proof hash and auto-pays the ambassador.
    pub fn approve_proof_and_pay(
        env: Env,
        ambassador: Address,
        reward_amount: i128,
        proof_hash: BytesN<32>,
    ) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth(); // Only the organizer can trigger a payout

        // Ensure proof_hash was not already used
        let proof_key = DataKey::Proof(proof_hash.clone());
        if env.storage().persistent().has(&proof_key) {
            panic!("Proof has already been claimed");
        }

        // Send payment to the ambassador
        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = TokenClient::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &ambassador, &reward_amount);

        // Record the proof_hash as claimed
        env.storage().persistent().set(&proof_key, &true);

        // Emit an event for analytics
        env.events().publish((Symbol::new(&env, "payout"), ambassador), reward_amount);
    }
}
