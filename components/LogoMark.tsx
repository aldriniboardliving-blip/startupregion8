import Image from "next/image";

interface LogoMarkProps {
  className?: string;
  imgClassName?: string;
  size?: number;
}

export default function LogoMark({
  className = "",
  imgClassName = "",
  size = 36,
}: LogoMarkProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ${className}`}
    >
      <Image
        src="/images/logo-mark.png"
        alt="Region 8 Startups logo"
        width={size}
        height={size}
        className={`h-full w-full object-cover ${imgClassName}`}
        priority
      />
    </span>
  );
}