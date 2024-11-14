import { BrandLogo } from "@/components/brand-logo";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
    return <header className="flex py-4 shadow bg-background/50 backdrop-blur-sm">
        <nav className="container flex items-center gap-10">
            <Link href="/dashboard" className="mr-auto">
                <BrandLogo />
            </Link>
            <Link href="/dashboard/products">Products</Link>
            <Link href="/dashboard/analytics">Analytics</Link>
            <Link href="/dashboard/subscriptions">Subscriptions</Link>
            <UserButton />
        </nav>
    </header>
}