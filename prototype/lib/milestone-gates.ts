export type GateType = "discovery" | "money" | "progress" | "streak" | "certificate";

export const NQ_MILESTONE_GATE_OPEN_EVENT = "nq-milestone-gate-open";

export type MilestoneGateOpenDetail = {
  gateType: GateType;
  achievementValue?: string;
};

export function hasGateFired(gateType: GateType): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`nq_gate_fired_${gateType}`) === "true";
}

export function markGateFired(gateType: GateType): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`nq_gate_fired_${gateType}`, "true");
}

export function shouldFireGate(gateType: GateType): boolean {
  return !hasGateFired(gateType);
}
