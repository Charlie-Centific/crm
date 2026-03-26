import Image from "next/image";
import { getMember, avatarUrl, AVATAR_COLORS } from "@/lib/team";
import { cn } from "@/lib/utils";

interface OwnerAvatarProps {
  name: string | null | undefined;
  /** sm = 24px, md = 32px, lg = 64px */
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

const SIZE_MAP = {
  sm: { px: 24, imgPx: 32  as const, ring: "ring-1", text: "text-xs" },
  md: { px: 32, imgPx: 64  as const, ring: "ring-1", text: "text-sm" },
  lg: { px: 64, imgPx: 128 as const, ring: "ring-2", text: "text-base" },
};

export function OwnerAvatar({ name, size = "sm", showName = false }: OwnerAvatarProps) {
  const member = getMember(name);
  const { px, imgPx, ring, text } = SIZE_MAP[size];

  const initials = member?.initials
    ?? (name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?");
  const colorClass = AVATAR_COLORS[member?.color ?? "gray"];

  return (
    <span className="inline-flex items-center gap-1.5 flex-shrink-0">
      <span
        className={cn(
          "rounded-full overflow-hidden flex items-center justify-center flex-shrink-0",
          ring,
          !member && colorClass   // fallback background only when no photo
        )}
        style={{ width: px, height: px }}
        title={name ?? "Unassigned"}
      >
        {member ? (
          <Image
            src={avatarUrl(member, imgPx)}
            alt={name ?? ""}
            width={imgPx}
            height={imgPx}
            className="object-cover w-full h-full"
            style={{ borderRadius: "50%" }}
          />
        ) : (
          <span className={cn("font-semibold", text)}>{initials}</span>
        )}
      </span>
      {showName && name && (
        <span className={cn("text-gray-700", text)}>{name}</span>
      )}
    </span>
  );
}
