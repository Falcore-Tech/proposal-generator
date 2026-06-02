import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string | null;
  showWordmark?: boolean;
  size?: number;
  className?: string;
  imageClassName?: string;
  wordmarkClassName?: string;
  priority?: boolean;
};

export function Logo({
  href = "/",
  showWordmark = true,
  size = 48,
  className,
  imageClassName,
  wordmarkClassName,
  priority = false,
}: LogoProps) {
  const content = (
    <>
      <Image
        src="/logo-transparent.webp"
        alt="Falcore"
        width={size}
        height={size}
        priority={priority}
        className={cn("shrink-0", imageClassName)}
      />
      {showWordmark && (
        <span
          className={cn(
            "text-2xl font-[family-name:var(--font-oxanium)] font-bold tracking-tighter text-foreground",
            wordmarkClassName,
          )}
        >
          FALCORE
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn("flex items-center gap-0", className)}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cn("flex items-center gap-0", className)}>{content}</div>
  );
}
