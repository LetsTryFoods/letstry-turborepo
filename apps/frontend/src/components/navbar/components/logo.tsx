import Link from "next/link";
import Image from "next/image";

interface LogoProps {
    className?: string;
    width?: number;
    height?: number;
}

export const Logo = ({ className, width = 64, height = 64 }: LogoProps) => {
    return (
        <Link href="/" className="flex items-center gap-2">
            <Image
                src="/logo.webp"
                alt="Let's Try"
                width={width}
                height={height}
                className={className}
                priority
            />
        </Link>
    );
};
