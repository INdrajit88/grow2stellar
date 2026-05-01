//! G2S – Grow2Stellar Reward Token
//!
//! A minimal SEP-41 compatible fungible token used as a loyalty bonus.
//! The escrow contract is the sole minter; ambassadors receive G2S tokens
//! alongside their XLM payout as an on-chain loyalty reward.

#![allow(dead_code)]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, String, Symbol,
};

// ─────────────────────────────────────────────────────────────────────────────
// Storage keys
// ─────────────────────────────────────────────────────────────────────────────

#[contracttype]
pub enum TokenKey {
    Admin,
    Minter,
    Balance(Address),
    TotalSupply,
    Name,
    Symbol,
    Decimals,
}

// ─────────────────────────────────────────────────────────────────────────────
// Events
// ─────────────────────────────────────────────────────────────────────────────

const EVT_MINT: Symbol = symbol_short!("mint");
const EVT_TRANSFER: Symbol = symbol_short!("transfer");
const EVT_BURN: Symbol = symbol_short!("burn");

// ─────────────────────────────────────────────────────────────────────────────
// Contract
// ─────────────────────────────────────────────────────────────────────────────

#[contract]
pub struct G2SToken;

#[contractimpl]
impl G2SToken {
    // ── Initialisation ────────────────────────────────────────────────────────

    /// Deploy the G2S token.
    /// `minter` should be the escrow contract address so it can call `mint`.
    pub fn init(env: Env, admin: Address, minter: Address) {
        if env.storage().instance().has(&TokenKey::Admin) {
            panic!("already_initialized");
        }
        env.storage().instance().set(&TokenKey::Admin, &admin);
        env.storage().instance().set(&TokenKey::Minter, &minter);
        env.storage()
            .instance()
            .set(&TokenKey::Name, &String::from_str(&env, "Grow2Stellar Token"));
        env.storage()
            .instance()
            .set(&TokenKey::Symbol, &String::from_str(&env, "G2S"));
        env.storage().instance().set(&TokenKey::Decimals, &7_u32);
        env.storage().instance().set(&TokenKey::TotalSupply, &0_i128);
    }

    // ── Minting (minter only) ─────────────────────────────────────────────────

    /// Mint new G2S tokens to `to`. Only callable by the designated minter.
    pub fn mint(env: Env, to: Address, amount: i128) {
        let minter: Address = env.storage().instance().get(&TokenKey::Minter).unwrap();
        minter.require_auth();

        if amount <= 0 {
            panic!("amount_must_be_positive");
        }

        let prev: i128 = env
            .storage()
            .persistent()
            .get(&TokenKey::Balance(to.clone()))
            .unwrap_or(0);
        env.storage()
            .persistent()
            .set(&TokenKey::Balance(to.clone()), &(prev + amount));

        let supply: i128 = env
            .storage()
            .instance()
            .get(&TokenKey::TotalSupply)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&TokenKey::TotalSupply, &(supply + amount));

        env.events().publish((EVT_MINT, to), amount);
    }

    // ── Transfers ─────────────────────────────────────────────────────────────

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();

        if amount <= 0 {
            panic!("amount_must_be_positive");
        }

        let from_bal: i128 = env
            .storage()
            .persistent()
            .get(&TokenKey::Balance(from.clone()))
            .unwrap_or(0);

        if from_bal < amount {
            panic!("insufficient_balance");
        }

        env.storage()
            .persistent()
            .set(&TokenKey::Balance(from.clone()), &(from_bal - amount));

        let to_bal: i128 = env
            .storage()
            .persistent()
            .get(&TokenKey::Balance(to.clone()))
            .unwrap_or(0);
        env.storage()
            .persistent()
            .set(&TokenKey::Balance(to.clone()), &(to_bal + amount));

        env.events().publish((EVT_TRANSFER, from), (to, amount));
    }

    // ── Burn ──────────────────────────────────────────────────────────────────

    pub fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();

        let bal: i128 = env
            .storage()
            .persistent()
            .get(&TokenKey::Balance(from.clone()))
            .unwrap_or(0);

        if bal < amount {
            panic!("insufficient_balance");
        }

        env.storage()
            .persistent()
            .set(&TokenKey::Balance(from.clone()), &(bal - amount));

        let supply: i128 = env
            .storage()
            .instance()
            .get(&TokenKey::TotalSupply)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&TokenKey::TotalSupply, &(supply - amount));

        env.events().publish((EVT_BURN, from), amount);
    }

    // ── Read-only ─────────────────────────────────────────────────────────────

    pub fn balance(env: Env, account: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&TokenKey::Balance(account))
            .unwrap_or(0)
    }

    pub fn total_supply(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&TokenKey::TotalSupply)
            .unwrap_or(0)
    }

    pub fn name(env: Env) -> String {
        env.storage().instance().get(&TokenKey::Name).unwrap()
    }

    pub fn symbol(env: Env) -> String {
        env.storage().instance().get(&TokenKey::Symbol).unwrap()
    }

    pub fn decimals(env: Env) -> u32 {
        env.storage().instance().get(&TokenKey::Decimals).unwrap()
    }
}
