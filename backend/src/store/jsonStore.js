/**
 * In-memory store — works in both local dev and Vercel serverless.
 *
 * On local dev the process stays alive so state persists across requests.
 * On Vercel the function may be cold-started, so state resets — acceptable
 * for a testnet MVP demo. For production persistence, swap this for a
 * database (e.g. PlanetScale, Supabase, or Upstash Redis).
 */

const initialState = () => ({
  users: [],
  campaigns: [],
  ambassadors: [],
  referralClicks: [],
  quests: [],
  submissions: [],
});

// Module-level singleton — survives across requests in the same process
let _state = initialState();

export async function getState() {
  return structuredClone(_state);
}

export async function updateState(mutator) {
  // Clone so the mutator works on a draft
  const draft = structuredClone(_state);
  const result = await mutator(draft);
  // Commit the draft back
  _state = draft;
  return result;
}
