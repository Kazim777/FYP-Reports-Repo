import Image from "next/image";
import clsx from "clsx";
import { avatarSrc } from "@/lib/options";

export default function UserAvatar({
  name,
  avatar,
  size = 36,
  className,
}: {
  name: string;
  avatar?: string | null;
  size?: number;
  className?: string;
}) {
  if (avatar) {
    return (
      <Image
        src={avatarSrc(avatar)}
        alt={name}
        width={size}
        height={size}
        className={clsx("shrink-0 rounded-full bg-slate-100 object-cover", className)}
      />
    );
  }

  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className={clsx(
        "grid shrink-0 place-items-center rounded-full bg-brand-100 font-semibold text-brand-700",
        className
      )}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
