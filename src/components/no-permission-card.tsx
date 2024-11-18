import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import Link from "next/link";

export function NoPermissionCard({ children }: { children: React.ReactNode }) {
    return <Card>
        <CardHeader>
            <CardTitle>Permission Denied</CardTitle>
        </CardHeader>
        <CardContent>
            <CardDescription>{children}</CardDescription>
        </CardContent>
        <CardFooter>
            <Button asChild>
                <Link href="/dashboard/subscriptions">Upgrade Account</Link>
            </Button>
        </CardFooter>
    </Card>
}

