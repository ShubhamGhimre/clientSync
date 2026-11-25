import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  size?: number;
  className?: string;
};

export function BrandMark({ size = 32, className }: BrandMarkProps) {
  return (
    <Image
      src="/favicon.svg"
      alt=""
      width={size}
      height={size}
      unoptimized
      className={cn("shrink-0", className)}
      style={{ width: size, height: size }}
    />
  );
}

type LogoProps = {
  showName?: boolean;
  className?: string;
  nameClassName?: string;
};

export function Logo({ showName = true, className, nameClassName }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label="ClientSync home">
      <BrandMark size={34} />
      {showName && (
        <span className={cn("hidden font-cursive text-2xl font-semibold leading-none tracking-tight lg:inline", nameClassName)}>
          ClientSync
        </span>
      )}
    </Link>
  );
}
