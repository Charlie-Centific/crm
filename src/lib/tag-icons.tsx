/**
 * Canonical icon + label definitions for workflow vertical tags and threat types.
 * Import and use anywhere in the app for consistent iconography.
 *
 * Usage:
 *   import { VERTICAL_TAGS, THREAT_TAGS, TagIcon } from "@/lib/tag-icons";
 *   <TagIcon tag="transit" size={20} />
 */

import {
  Shield,
  ShieldAlert,
  Bus,
  Building2,
  Car,
  Package,
  ShoppingBag,
  Heart,
  Briefcase,
  Factory,
  Leaf,
  Anchor,
  Calendar,
  Lock,
  Zap,
  HardHat,
  AlertTriangle,
  ClipboardCheck,
  Droplets,
  Activity,
  Key,
  Clock,
  Users,
  Cog,
  CloudLightning,
  type LucideIcon,
} from "lucide-react";

// ── Industry Vertical definitions ─────────────────────────────────────────────

export interface TagDef {
  id: string;
  label: string;
  Icon: LucideIcon;
  description: string;
}

export const VERTICAL_TAGS: TagDef[] = [
  { id: "law-enforcement",  label: "Law Enforcement",  Icon: Shield,        description: "Police, sheriff, federal agencies" },
  { id: "public-safety",    label: "Public Safety",    Icon: ShieldAlert,   description: "Emergency services, fire, EMS" },
  { id: "transit",          label: "Transit",          Icon: Bus,           description: "Bus, rail, ferry, airport operations" },
  { id: "smart-city",       label: "Smart City",       Icon: Building2,     description: "Municipal and city operations" },
  { id: "transportation",   label: "Transportation",   Icon: Car,           description: "Road, highway, traffic management" },
  { id: "logistics",        label: "Logistics",        Icon: Package,       description: "Warehousing, fulfillment, supply chain" },
  { id: "retail",           label: "Retail",           Icon: ShoppingBag,   description: "Stores, malls, shopping centers" },
  { id: "healthcare",       label: "Healthcare",       Icon: Heart,         description: "Hospitals, care facilities" },
  { id: "enterprise",       label: "Enterprise",       Icon: Briefcase,     description: "Corporate campuses, office parks" },
  { id: "industrial",       label: "Industrial",       Icon: Factory,       description: "Manufacturing, energy, utilities" },
  { id: "environment",      label: "Environment",      Icon: Leaf,          description: "Environmental enforcement, waste management" },
  { id: "maritime",         label: "Maritime",         Icon: Anchor,        description: "Ports, ferry terminals, waterways" },
  { id: "events",           label: "Events",           Icon: Calendar,      description: "Stadiums, venues, large gatherings" },
];

// ── Threat Type definitions ───────────────────────────────────────────────────

export const THREAT_TAGS: TagDef[] = [
  { id: "physical-security", label: "Physical Security", Icon: Lock,          description: "Unauthorized access, intrusion, perimeter breach" },
  { id: "violent-threat",    label: "Violent Threat",    Icon: Zap,           description: "Weapons, assault, aggression" },
  { id: "safety-hazard",     label: "Safety Hazard",     Icon: HardHat,       description: "Falls, accidents, workplace incidents" },
  { id: "traffic-incident",  label: "Traffic Incident",  Icon: AlertTriangle, description: "Accidents, congestion, road hazards" },
  { id: "compliance",        label: "Compliance",        Icon: ClipboardCheck,description: "Permit, regulatory, and policy violations" },
  { id: "environmental",     label: "Environmental",     Icon: Droplets,      description: "Illegal dumping, pollution, waste" },
  { id: "medical-emergency", label: "Medical Emergency", Icon: Activity,      description: "Person down, health-related incidents" },
  { id: "theft",             label: "Theft",             Icon: Key,           description: "Stolen vehicles, assets, or property" },
  { id: "abandonment",       label: "Abandonment",       Icon: Clock,         description: "Unattended objects, vehicles, or luggage" },
  { id: "crowd-risk",        label: "Crowd Risk",        Icon: Users,         description: "Overcrowding, mass gathering risks" },
  { id: "operational",       label: "Operational",       Icon: Cog,           description: "Workflow efficiency, reporting, communications" },
  { id: "weather-risk",      label: "Weather Risk",      Icon: CloudLightning,description: "Storm, flood, environmental conditions" },
];

// ── Combined lookup ───────────────────────────────────────────────────────────

const ALL_TAGS = new Map<string, TagDef>(
  [...VERTICAL_TAGS, ...THREAT_TAGS].map((t) => [t.id, t])
);

export function getTagDef(id: string): TagDef | undefined {
  return ALL_TAGS.get(id);
}

// ── Inline icon component ─────────────────────────────────────────────────────

export function TagIcon({
  tag,
  size = 16,
  className,
}: {
  tag: string;
  size?: number;
  className?: string;
}) {
  const def = ALL_TAGS.get(tag);
  if (!def) return null;
  const { Icon } = def;
  return <Icon size={size} className={className} />;
}
