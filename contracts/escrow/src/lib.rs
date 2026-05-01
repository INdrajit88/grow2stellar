#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, BytesN, Env, String, Symbol,
    token::Client as TokenClient,
};

// ─────────────────────────────────────────────────────────────────────────────
// Storage keys
// ─────────────────────────────────────────────────────────────────────────────

#[contracttype]
pub enum DataKey {
    Admin,
    Token,
    RewardToken,          // address of the custom G2S reward token contract
    Campaign(u64),        // per-campaign metadata
    CampaignBudget(u64),  // remaining budget for a campaign
    Proof(BytesN<32>),    // claimed proof hashes (prevents double-pay)
    TotalPaid,
    TotalCampaigns,
}

// ─────────────────────────────────────────────────────────────────────────────
// Value types
// ─────────────────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone)]
pub struct CampaignRecord {
    pub organizer: Address,
    pub title: String,
    pub budget: i128,
    pub paid_out: i128,
    pub active: bool,
}

// ─────────────────────────────────────────────────────────────────────────────
// Events (topic symbols)
// ─────────────────────────────────────────────────────────────────────────────

const EVT_CAMPAIGN_CREATED: Symbol = symbol_short!("camp_new");
const EVT_BUDGET_DEPOSITED: Symbol = symbol_short!("budg_dep");
const EVT_PAYOUT: Symbol = symbol_short!("payout");
const EVT_CAMPAIGN_CLOSED: Symbol = symbol_short!("camp_end");

// ─────────────────────────────────────────────────────────────────────────────
// Main escrow + reward contract
// ─────────────────────────────────────────────────────────────────────────────

#[contract]
pub struct Grow2StellarEscrow;

#[contractimpl]
impl Grow2StellarEscrow {
    // ── Initialisation ────────────────────────────────────────────────────────

    /// Initialise the contract.
    /// `token`        – the settlement asset (e.g. XLM / USDC on testnet).
    /// `reward_token` – address of the custom G2S token contract (inter-contract call target).
    pub fn init(env: Env, admin: Address, token: Address, reward_token: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already_initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::RewardToken, &reward_token);
        env.storage().instance().set(&DataKey::TotalPaid, &0_i128);
        env.storage().instance().set(&DataKey::TotalCampaigns, &0_u64);
    }

    // ── Campaign management ───────────────────────────────────────────────────

    /// Register a new campaign on-chain and return its numeric id.
    pub fn create_campaign(env: Env, organizer: Address, title: String, budget: i128) -> u64 {
        organizer.require_auth();

        let mut count: u64 = env.storage().instance().get(&DataKey::TotalCampaigns).unwrap_or(0);
        count += 1;

        let record = CampaignRecord {
            organizer: organizer.clone(),
            title: title.clone(),
            budget,
            paid_out: 0,
            active: true,
        };

        env.storage().persistent().set(&DataKey::Campaign(count), &record);
        env.storage().persistent().set(&DataKey::CampaignBudget(count), &0_i128);
        env.storage().instance().set(&DataKey::TotalCampaigns, &count);

        env.events().publish(
            (EVT_CAMPAIGN_CREATED, organizer),
            (count, title, budget),
        );

        count
    }

    /// Deposit settlement tokens into a campaign's escrow bucket.
    pub fn deposit_budget(env: Env, from: Address, campaign_id: u64, amount: i128) {
        from.require_auth();

        let record: CampaignRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .expect("campaign_not_found");

        if from != record.organizer {
            panic!("only_organizer_can_deposit");
        }
        if !record.active {
            panic!("campaign_closed");
        }

        // ── Inter-contract call #1: transfer settlement token into escrow ──
        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = TokenClient::new(&env, &token);
        token_client.transfer(&from, &env.current_contract_address(), &amount);

        // Update tracked budget
        let prev: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::CampaignBudget(campaign_id))
            .unwrap_or(0);
        env.storage()
            .persistent()
            .set(&DataKey::CampaignBudget(campaign_id), &(prev + amount));

        env.events().publish(
            (EVT_BUDGET_DEPOSITED, from),
            (campaign_id, amount),
        );
    }

    // ── Reward payout ─────────────────────────────────────────────────────────

    /// Approve a proof hash and pay the ambassador.
    ///
    /// Two inter-contract calls happen here:
    ///   1. Transfer settlement token (XLM/USDC) to the ambassador.
    ///   2. Mint G2S reward tokens to the ambassador as a loyalty bonus
    ///      (inter-contract call to the custom token contract).
    pub fn approve_proof_and_pay(
        env: Env,
        campaign_id: u64,
        ambassador: Address,
        reward_amount: i128,
        bonus_g2s: i128,
        proof_hash: BytesN<32>,
    ) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        // Guard: proof must not have been used before
        let proof_key = DataKey::Proof(proof_hash.clone());
        if env.storage().persistent().has(&proof_key) {
            panic!("proof_already_claimed");
        }

        // Guard: campaign must be active and have enough budget
        let mut record: CampaignRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .expect("campaign_not_found");

        if !record.active {
            panic!("campaign_closed");
        }

        let budget: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::CampaignBudget(campaign_id))
            .unwrap_or(0);

        if budget < reward_amount {
            panic!("insufficient_budget");
        }

        // ── Inter-contract call #1: pay settlement token to ambassador ────
        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = TokenClient::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &ambassador, &reward_amount);

        // ── Inter-contract call #2: mint G2S loyalty tokens to ambassador ─
        if bonus_g2s > 0 {
            let reward_token: Address = env
                .storage()
                .instance()
                .get(&DataKey::RewardToken)
                .unwrap();
            let g2s_client = TokenClient::new(&env, &reward_token);
            // The escrow contract must be the minter/admin of the G2S token.
            g2s_client.transfer(&env.current_contract_address(), &ambassador, &bonus_g2s);
        }

        // Update state
        env.storage()
            .persistent()
            .set(&DataKey::CampaignBudget(campaign_id), &(budget - reward_amount));

        record.paid_out += reward_amount;
        env.storage()
            .persistent()
            .set(&DataKey::Campaign(campaign_id), &record);

        let mut total_paid: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalPaid)
            .unwrap_or(0);
        total_paid += reward_amount;
        env.storage().instance().set(&DataKey::TotalPaid, &total_paid);

        // Mark proof as claimed
        env.storage().persistent().set(&proof_key, &true);

        // Emit payout event (real-time stream hook)
        env.events().publish(
            (EVT_PAYOUT, ambassador.clone()),
            (campaign_id, reward_amount, bonus_g2s, proof_hash),
        );
    }

    // ── Campaign lifecycle ────────────────────────────────────────────────────

    /// Close a campaign and return any remaining budget to the organizer.
    pub fn close_campaign(env: Env, campaign_id: u64) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let mut record: CampaignRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .expect("campaign_not_found");

        if !record.active {
            panic!("already_closed");
        }

        let remaining: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::CampaignBudget(campaign_id))
            .unwrap_or(0);

        // Return remaining funds to organizer via inter-contract call
        if remaining > 0 {
            let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
            let token_client = TokenClient::new(&env, &token);
            token_client.transfer(
                &env.current_contract_address(),
                &record.organizer,
                &remaining,
            );
            env.storage()
                .persistent()
                .set(&DataKey::CampaignBudget(campaign_id), &0_i128);
        }

        record.active = false;
        env.storage()
            .persistent()
            .set(&DataKey::Campaign(campaign_id), &record);

        env.events().publish(
            (EVT_CAMPAIGN_CLOSED, record.organizer),
            (campaign_id, remaining),
        );
    }

    // ── Read-only helpers ─────────────────────────────────────────────────────

    pub fn get_campaign(env: Env, campaign_id: u64) -> CampaignRecord {
        env.storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .expect("campaign_not_found")
    }

    pub fn get_campaign_budget(env: Env, campaign_id: u64) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::CampaignBudget(campaign_id))
            .unwrap_or(0)
    }

    pub fn get_total_paid(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalPaid).unwrap_or(0)
    }

    pub fn get_total_campaigns(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::TotalCampaigns).unwrap_or(0)
    }

    pub fn is_proof_claimed(env: Env, proof_hash: BytesN<32>) -> bool {
        env.storage()
            .persistent()
            .has(&DataKey::Proof(proof_hash))
    }
}
