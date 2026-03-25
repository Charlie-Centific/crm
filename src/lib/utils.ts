import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function daysInStage(stageChangedAt: Date | string | null): number {
  if (!stageChangedAt) return 0;
  return differenceInDays(new Date(), new Date(stageChangedAt));
}

export function relativeTime(date: Date | string | null): string {
  if (!date) return "never";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatCurrency(value: string | number | null): string {
  if (value == null) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

export const VERTICAL_LABELS: Record<string, string> = {
  transit: "Transit",
  utilities: "Utilities",
  emergency: "Emergency Services",
  smart_city: "Smart City",
  other: "Other",
};

export const STAGE_LABELS: Record<string, string> = {
  lead: "Lead",
  discovery: "Discovery",
  demo: "Demo",
  workshop: "Workshop",
  pilot_start: "Pilot Start",
  pilot_close: "Pilot Close",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

export const SOURCE_LABELS: Record<string, string> = {
  conference: "Conference",
  partner: "Partner",
  direct: "Direct",
  inbound: "Inbound",
};
