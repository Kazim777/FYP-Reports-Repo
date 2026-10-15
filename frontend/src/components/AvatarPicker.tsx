"use client";

import Image from "next/image";
import clsx from "clsx";
import { Check } from "lucide-react";
import { AVATARS, avatarSrc } from "@/lib/options";

export default function AvatarPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (avatar: string | null) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2.5">
      {AVATARS.map((avatar) => {
        const selected = value === avatar;
        return (
          <button
            key={avatar}
            type="button"
            onClick={() => onChange(selected ? null : avatar)}
            aria-label={`Choose ${avatar}`}
            aria-pressed={selected}
            className={clsx(
              "relative mx-auto rounded-full p-0.5 transition",
              selected ? "ring-2 ring-brand-600 ring-offset-2" : "opacity-80 hover:opacity-100 hover:ring-2 hover:ring-slate-200"
            )}
          >
            <Image src={avatarSrc(avatar)} alt="" width={48} height={48} className="rounded-full bg-slate-100" />
            {selected && (
              <span className="absolute -bottom-0.5 -right-0.5 grid size-5 place-items-center rounded-full bg-brand-600 text-white ring-2 ring-white">
                <Check className="size-3" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
