import fs from "fs";
import path from "path";

export interface PlaybookMeta {
  slug: string;
  vertical: string;
  label: string;
  description: string;
  color: string;
}

export const PLAYBOOK_META: PlaybookMeta[] = [
  {
    slug: "smart-city",
    vertical: "smart_city",
    label: "Smart City",
    description:
      "City and campus intelligence — real-time monitoring, post-event investigation, automated accountability records.",
    color: "purple",
  },
  {
    slug: "transit",
    vertical: "transit",
    label: "Transit",
    description:
      "Rail, bus, subway, light rail — predictive maintenance, platform safety, revenue protection, dispatching optimization.",
    color: "blue",
  },
  {
    slug: "emergency",
    vertical: "emergency",
    label: "Emergency Services",
    description:
      "Law enforcement and District Attorneys — threat detection, digital forensics, automated reporting, evidence review.",
    color: "orange",
  },
];

export function getPlaybookContent(slug: string): string | null {
  const filePath = path.join(process.cwd(), "src", "content", "playbooks", `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}

export function getPlaybookByVertical(vertical: string): PlaybookMeta | null {
  return PLAYBOOK_META.find((p) => p.vertical === vertical) ?? null;
}
