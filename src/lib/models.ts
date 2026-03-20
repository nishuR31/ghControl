import mongoose, { Schema, model, models } from "mongoose";

// ── WebhookEvent ───────────────────────────────────────────────────────────
const WebhookEventSchema = new Schema(
  {
    delivery: { type: String, required: true, unique: true },
    event: { type: String, required: true },
    repository: { type: String },
    sender: { type: String },
    action: { type: String },
    payload: { type: Schema.Types.Mixed },
    receivedAt: { type: Date, default: Date.now },
    processed: { type: Boolean, default: false },
    processedAt: { type: Date },
  },
  { timestamps: true },
);
WebhookEventSchema.index({ event: 1, receivedAt: -1 });
WebhookEventSchema.index({ repository: 1 });

export const WebhookEvent =
  models.WebhookEvent || model("WebhookEvent", WebhookEventSchema);

// ── JobLog ─────────────────────────────────────────────────────────────────
const JobLogSchema = new Schema(
  {
    jobId: { type: String, required: true },
    queue: { type: String, required: true },
    type: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "failed"],
      default: "pending",
    },
    data: { type: Schema.Types.Mixed },
    result: { type: Schema.Types.Mixed },
    error: { type: String },
    startedAt: { type: Date },
    finishedAt: { type: Date },
  },
  { timestamps: true },
);
JobLogSchema.index({ queue: 1, status: 1 });
JobLogSchema.index({ createdAt: -1 });

export const JobLog = models.JobLog || model("JobLog", JobLogSchema);

// ── ActionLog (compact app-initiated audit trail) ────────────────────────
const ActionLogSchema = new Schema(
  {
    source: { type: String, enum: ["app", "external"], default: "app" },
    type: { type: String, required: true },
    action: { type: String, required: true },
    status: {
      type: String,
      enum: ["queued", "success", "failed"],
      default: "success",
    },
    repo: { type: String },
    actor: { type: String },
    payloadGz: { type: String },
    rawBytes: { type: Number, default: 0 },
    compressedBytes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
ActionLogSchema.index({ source: 1, createdAt: -1 });
ActionLogSchema.index({ type: 1, createdAt: -1 });

export const ActionLog =
  models.ActionLog || model("ActionLog", ActionLogSchema);

// ── RepoNote (user notes on repos) ────────────────────────────────────────
const RepoNoteSchema = new Schema(
  {
    fullName: { type: String, required: true },
    userLogin: { type: String, required: true },
    note: { type: String },
    tags: [{ type: String }],
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true },
);
RepoNoteSchema.index({ fullName: 1, userLogin: 1 }, { unique: true });

export const RepoNote = models.RepoNote || model("RepoNote", RepoNoteSchema);

// ── SavedSearch ────────────────────────────────────────────────────────────
const SavedSearchSchema = new Schema(
  {
    userLogin: { type: String, required: true },
    name: { type: String, required: true },
    query: { type: String, required: true },
    type: {
      type: String,
      enum: ["repos", "issues", "code", "users"],
      default: "repos",
    },
  },
  { timestamps: true },
);

export const SavedSearch =
  models.SavedSearch || model("SavedSearch", SavedSearchSchema);

// ── AutomationRule ─────────────────────────────────────────────────────────
const AutomationRuleSchema = new Schema(
  {
    userLogin: { type: String, required: true },
    name: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    trigger: { event: String, conditions: Schema.Types.Mixed },
    action: { type: String, params: Schema.Types.Mixed },
    lastFired: { type: Date },
    fireCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const AutomationRule =
  models.AutomationRule || model("AutomationRule", AutomationRuleSchema);
