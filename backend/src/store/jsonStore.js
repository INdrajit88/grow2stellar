import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "../..");
const dataFilePath = path.resolve(backendRoot, env.dataFile);

const initialState = {
  users: [],
  campaigns: [],
  ambassadors: [],
  referralClicks: [],
  quests: [],
  submissions: [],
};

async function ensureDataDirectory() {
  await mkdir(path.dirname(dataFilePath), { recursive: true });
}

async function readState() {
  try {
    const raw = await readFile(dataFilePath, "utf8");
    return { ...initialState, ...JSON.parse(raw) };
  } catch (error) {
    if (error.code === "ENOENT") {
      return structuredClone(initialState);
    }
    throw error;
  }
}

async function writeState(state) {
  await ensureDataDirectory();
  const tempPath = `${dataFilePath}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(state, null, 2)}\n`);
  await rename(tempPath, dataFilePath);
}

export async function getState() {
  return readState();
}

export async function updateState(mutator) {
  const state = await readState();
  const result = await mutator(state);
  await writeState(state);
  return result;
}
