import { cn } from "@/lib/utils";
import { Eyebrow } from "./Eyebrow";
import { Heading } from "./Heading";
import { Text } from "./Text";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string | null;
  className?: string;
}

export function SectionHeader({ eyebrow, title, description, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-10 md:mb-14", className)}>
      <Eyebrow accent>{eyebrow}</Eyebrow>
      <Heading as="h2" size="h2">
        {title}
      </Heading>
      {description && (
        <Text variant="lead" muted className="mt-3 max-w-2xl">
          {description}
        </Text>
      )}
    </div>
  );
}
