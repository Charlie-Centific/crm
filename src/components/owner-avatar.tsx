import { getMember, AVATAR_COLORS } from "@/lib/team";
import { cn } from "@/lib/utils";

interface OwnerAvatarProps {
  name: string | null | undefined;
  size?: "sm" | "md";
  showName?: boolean;
}

export function OwnerAvatar({ name, size = "sm", showName = false }: OwnerAvatarProps) {
  const member = getMember(name);
  const initials = member?.initials ?? (name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?");
  const colorClass = AVATAR_COLORS[member?.color ?? "gray"];

  const sizeClass = size === "md" ? "w-8 h-8 text-sm" : "w-6 h-6 text-xs";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "rounded-full ring-1 font-semibold flex items-center justify-center flex-shrink-0",
          sizeClass,
          colorClass
        )}
        title={name ?? "Unassigned"}
      >
        {initials}
      </span>
      {showName && name && (
        <span className="text-sm text-gray-700">{name}</span>
      )}
    </span>
  );
}
