import { auth } from "@clerk/nextjs/server";
import { NoPermissionCard } from "./no-permission-card";
import { AwaitedReactNode } from "react";

export async function HasPermission({
    permission,
    renderFallback,
    fallbackText,
    children
}: {
    permission: (userId: string | null) => Promise<boolean>;
    renderFallback: boolean;
    fallbackText: string;
    children: AwaitedReactNode;
}) {
    const { userId } = await auth();
    const hasPermission = await permission(userId);
    if (hasPermission) return children;
    if (renderFallback) return <NoPermissionCard>{fallbackText}</NoPermissionCard>;
    return null;
}
