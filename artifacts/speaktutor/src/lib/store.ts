export const FREE_MESSAGES_LIMIT = 3;
export const SCENARIO_MESSAGES_LIMIT = 6;
export const PAID_MESSAGES_TOTAL = 60;

export type Level = "beginner" | "intermediate" | "advanced";
export type DenyReason = "free_limit" | "scenario_limit" | "paid_total_limit";

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key: string, val: string): void {
  try { localStorage.setItem(key, val); } catch {}
}

export function getLevel(): Level | null {
  const v = safeGet("st_level");
  return (v === "beginner" || v === "intermediate" || v === "advanced") ? v : null;
}
export function setLevel(level: Level): void {
  safeSet("st_level", level);
}

export function getFreeUsed(): number {
  return Math.max(0, parseInt(safeGet("st_free_used") ?? "0", 10) || 0);
}
export function incFreeUsed(): void {
  safeSet("st_free_used", String(getFreeUsed() + 1));
}

export function isPaid(): boolean {
  return safeGet("st_paid") === "true";
}
export function activatePaid(): void {
  safeSet("st_paid", "true");
  safeSet("st_paid_at", new Date().toISOString());
  safeSet("st_plan", "speaktutor_1500");
  safeSet("st_paid_msgs_limit", String(PAID_MESSAGES_TOTAL));
  if (!safeGet("st_paid_msgs_used")) safeSet("st_paid_msgs_used", "0");
}

export function getPaidMsgsUsed(): number {
  return Math.max(0, parseInt(safeGet("st_paid_msgs_used") ?? "0", 10) || 0);
}
export function incPaidMsgsUsed(): void {
  safeSet("st_paid_msgs_used", String(getPaidMsgsUsed() + 1));
}

export function getScenarioMsgsUsed(scenarioId: string): number {
  return Math.max(0, parseInt(safeGet(`st_scenario_${scenarioId}_msgs`) ?? "0", 10) || 0);
}
export function incScenarioMsgsUsed(scenarioId: string): void {
  safeSet(`st_scenario_${scenarioId}_msgs`, String(getScenarioMsgsUsed(scenarioId) + 1));
}

export function canSendMessage(scenarioId: string): { allowed: boolean; reason: DenyReason | null } {
  if (!isPaid()) {
    return getFreeUsed() >= FREE_MESSAGES_LIMIT
      ? { allowed: false, reason: "free_limit" }
      : { allowed: true, reason: null };
  }
  if (getScenarioMsgsUsed(scenarioId) >= SCENARIO_MESSAGES_LIMIT) {
    return { allowed: false, reason: "scenario_limit" };
  }
  if (getPaidMsgsUsed() >= PAID_MESSAGES_TOTAL) {
    return { allowed: false, reason: "paid_total_limit" };
  }
  return { allowed: true, reason: null };
}

export function recordMessageUsed(scenarioId: string): void {
  if (!isPaid()) {
    incFreeUsed();
  } else {
    incPaidMsgsUsed();
    incScenarioMsgsUsed(scenarioId);
  }
}

export function getPaidAt(): string | null {
  return safeGet("st_paid_at");
}
