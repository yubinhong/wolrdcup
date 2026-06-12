"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lang } from "@/lib/site";

type Props = {
  current: Lang;
};

export function LanguageSwitcher({ current }: Props) {
  const pathname = usePathname();

  const siblingPath = (target: Lang) => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) {
      return `/${target}`;
    }

    parts[0] = target;
    return `/${parts.join("/")}`;
  };

  return (
    <div className="nav">
      <Link href={siblingPath("en")} aria-current={current === "en" ? "page" : undefined}>
        EN
      </Link>
      <Link href={siblingPath("zh")} aria-current={current === "zh" ? "page" : undefined}>
        中文
      </Link>
    </div>
  );
}
