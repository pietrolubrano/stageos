import type { CrewSlot, Production, SlotStatus } from "@/lib/types";

export function departmentSummary(slots: CrewSlot[]) {
  const departments = Array.from(new Set(slots.map((slot) => slot.department)));

  return departments.map((department) => {
    const group = slots.filter((slot) => slot.department === department);
    const confirmed = group.filter((slot) => slot.status === "confirmed").length;
    const pending = group.filter((slot) => slot.status === "pending").length;
    const missing = group.filter((slot) => slot.status === "missing" || slot.status === "declined").length;

    return {
      department,
      confirmed,
      pending,
      missing,
      total: group.length,
      complete: confirmed === group.length
    };
  });
}

export function productionIssues(production: Production) {
  return production.slots.filter((slot) => slot.status === "missing" || slot.status === "declined").length;
}

export function invitationCount(production: Production, status: SlotStatus) {
  return production.slots.filter((slot) => slot.status === status).length;
}
