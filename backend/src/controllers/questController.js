import {
  createQuest as createQuestRecord,
  listQuests as listQuestRecords,
  createSubmission as createSubmissionRecord,
  listSubmissions as listSubmissionRecords,
  approveSubmission as approveSubmissionRecord,
  rejectSubmission as rejectSubmissionRecord,
} from "../services/questService.js";

export async function listQuests(req, res) {
  const quests = await listQuestRecords(req.params.campaignId);
  res.json({ quests });
}

export async function createQuest(req, res) {
  const quest = await createQuestRecord(req.params.campaignId, req.auth.userId, req.body);
  res.status(201).json({ quest });
}

export async function listSubmissions(req, res) {
  const submissions = await listSubmissionRecords(req.params.questId);
  res.json({ submissions });
}

export async function createSubmission(req, res) {
  const submission = await createSubmissionRecord(req.params.questId, req.auth.userId, req.body);
  res.status(201).json({ submission });
}

export async function approveSubmission(req, res) {
  const submission = await approveSubmissionRecord(req.params.questId, req.params.submissionId, req.auth.userId);
  res.json({ submission });
}

export async function rejectSubmission(req, res) {
  const submission = await rejectSubmissionRecord(req.params.questId, req.params.submissionId, req.auth.userId);
  res.json({ submission });
}
