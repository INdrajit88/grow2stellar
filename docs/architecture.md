# Grow2Stellar Architecture

Grow2Stellar is a hybrid Web2 and Web3 growth platform. The backend owns fast-changing product state, while Stellar and Soroban provide transparent reward settlement.

## MVP Modules

- Wallet identity: users authenticate by proving control of a Stellar wallet.
- Campaigns: organizers create growth campaigns with rewards and quests.
- Ambassadors: users apply to campaigns and receive referral links after approval.
- Referrals: approved ambassadors get unique referral codes and off-chain click tracking.
- Quests and submissions: ambassadors submit proof links, text, and screenshots.
- Verification: organizers approve or reject submissions.
- Rewards: approved work is paid through Stellar testnet with Soroban in the MVP reward flow.
- Dashboards: organizers and ambassadors view earnings, clicks, submissions, and rankings.

## On-Chain Scope

The MVP includes Soroban, but only where it helps the product:

- A Soroban reward contract records campaign reward pools, approved reward claims, proof hashes, and payout events.
- Stellar testnet assets move through the contract-backed reward flow in the payment phase.
- The backend remains the MVP verifier/oracle: it writes approvals only after organizer review.

We will not put clicks, dashboards, full proof files, or analytics on-chain.

## Off-Chain Scope

The Express API and storage layer keep:

- Users and wallet sessions
- Campaigns and quests
- Ambassador applications and approval state
- Referral click events
- Submission proof URLs and review status
- Dashboard aggregates
- Payout records and Soroban transaction hashes

## Soroban MVP Contract Shape

The contract phase will stay intentionally small:

- `init(admin, token)`: configure the verifier/admin and reward token.
- `create_campaign(campaign_id, organizer)`: register an on-chain campaign record.
- `fund_campaign(campaign_id, amount)`: move reward budget into contract custody.
- `approve_reward(campaign_id, submission_hash, recipient, amount)`: record an approved payout.
- `claim_reward(campaign_id, submission_hash)`: send the approved reward to the recipient.

This gives the demo real smart-contract value without forcing every product workflow onto the chain.

## Current Phase

Step 2.3 implements referral link generation for approved ambassadors and off-chain click tracking. Quests, Soroban contracts, and payouts remain separate phases so the MVP grows in controlled slices.
