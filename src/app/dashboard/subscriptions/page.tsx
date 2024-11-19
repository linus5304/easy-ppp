import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardContent, CardHeader, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { subscriptionTiers, subscriptionTiersInOrder, TierNames } from "@/data/subscriptionTiers";
import { formatCompactNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { createCancelSession, createCheckoutSession, createCustomerPortalSession } from "@/server/actions/stripe";
import { getProductViewCount } from "@/server/db/product-views";
import { getProductsCount } from "@/server/db/products";
import { getUserSubscriptionTier } from "@/server/db/subscriptions";
import { auth } from "@clerk/nextjs/server";
import { startOfMonth } from "date-fns";
import { CheckIcon } from "lucide-react";

export default async function SubscriptionsPage() {
    const { userId, redirectToSignIn } = await auth();
    if (userId == null) return redirectToSignIn();

    const tier = await getUserSubscriptionTier(userId);
    const productsCount = await getProductsCount(userId);
    const pricingViewCount = await getProductViewCount(userId, startOfMonth(new Date()));

    return (
        <>
            <h1 className="mb-6 text-3xl font-semibold">Your Subscription</h1>
            <div className="flex flex-col gap-8 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Monthly usage</CardTitle>
                            <CardDescription>
                                {formatCompactNumber(pricingViewCount)} / {formatCompactNumber(tier.maxNumberOfVisits)} pricing page visits this month
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Progress value={(pricingViewCount / tier.maxNumberOfVisits) * 100} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Number of products</CardTitle>
                            <CardDescription>
                                {formatCompactNumber(productsCount)} / {formatCompactNumber(tier.maxNumberOfProducts)} products created
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Progress value={(productsCount / tier.maxNumberOfProducts) * 100} />
                        </CardContent>
                    </Card>
                </div>
                {tier !== subscriptionTiers.Free && (
                    <Card>
                        <CardHeader>
                            <CardTitle>You are currently on the {tier.name} plan</CardTitle>
                            <CardDescription>
                                If you would like to upgrade, cancel, or change your payment method use the button below.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={createCustomerPortalSession}>
                                <Button type="submit" variant="accent" className="text-lg rounded-lg size-lg">Manage subscription</Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
            <div className="grid-cols-2 lg:grid-cols-4 grid gap-4 max-w-screen-xl mx-auto">
                {subscriptionTiersInOrder.map(t => (
                    <PricingCard key={t.name} currentTierName={tier.name} {...t} />
                ))}
            </div>
        </>
    );
}

function PricingCard({
    name,
    priceInCents,
    maxNumberOfProducts,
    maxNumberOfVisits,
    canAccessAnalytics,
    canCustomizeBanner,
    canRemoveBranding,
    currentTierName
}: (typeof subscriptionTiers)[keyof typeof subscriptionTiers] & { currentTierName: TierNames }) {
    const isCurrent = name === currentTierName;
    return (
        <Card className="shadow-none rounded-3xl overflow-hidden">
            <CardHeader>
                <div className="text-accent font-semibold mb-8">{name}</div>
                <CardTitle className="text-xl font-bold">${priceInCents / 100} /mo</CardTitle>
                <CardDescription>
                    {formatCompactNumber(maxNumberOfVisits)} pricing page visits
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={name === "Free" ? createCancelSession : createCheckoutSession.bind(null, name)}>
                    <Button disabled={isCurrent} size="lg" className="text-lg w-full rounded-lg">{isCurrent ? "Current" : "Swap"}</Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 items-start">
                <Feature className="font-bold">
                    {maxNumberOfProducts}
                    {maxNumberOfProducts === 1 ? " product" : " products"}
                </Feature>
                <Feature>
                    PPP discounts
                </Feature>
                {canCustomizeBanner && <Feature>Customize banner</Feature>}
                {canRemoveBranding && <Feature>Remove Easy PPP branding</Feature>}
                {canAccessAnalytics && <Feature>Advanced analytics</Feature>}
            </CardFooter>
        </Card>
    );
}

function Feature({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={cn("flex items-center gap-2", className)}>
        <CheckIcon className="size-4 stroke-accent bg-accent/25 rounded-full p-0.5" />
        <span>{children}</span>
    </div>;
}