import Link from "next/link";

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3" aria-label="MealMate home">
      <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground shadow-glow">
        M
      </span>
      <span className="text-lg font-semibold tracking-normal">MealMate</span>
    </Link>
  );
}
