import { cn, initialsOf } from "@/lib/utils";
import Image from "next/image";

export function Avatar({
  url,
  firstName,
  lastName,
  size = 40,
  className
}: {
  url?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  size?: number;
  className?: string;
}) {
  const initials = initialsOf(firstName, lastName);
  if (url) {
    return (
      <Image
        src={url}
        alt={`${firstName || ""} ${lastName || ""}`}
        width={size}
        height={size}
        className={cn("rounded-full object-cover border-2 border-white shadow-sm", className)}
      />
    );
  }
  return (
    <div
      data-testid="avatar-initials"
      style={{ width: size, height: size, fontSize: size / 2.5 }}
      className={cn(
        "rounded-full bg-brand-50 text-brand-700 font-semibold flex items-center justify-center border-2 border-white shadow-sm",
        className
      )}
    >
      {initials}
    </div>
  );
}
