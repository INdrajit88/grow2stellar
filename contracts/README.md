# Grow2Stellar Soroban Contracts

Soroban is now part of the MVP, but the contract implementation belongs to Phase 6: Stellar payment integration.

Planned contract:

- `rewards`: campaign reward escrow, approved claim registry, proof hash anchoring, and payout events.

The backend will call this contract only after an organizer approves a submission. Off-chain data stays in the API/database; the contract keeps the payment-critical state.
