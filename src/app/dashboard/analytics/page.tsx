import { HasPermission } from "@/components/has-permissions";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { CHART_INTERVALS, getViewsByCountryChartData } from "@/server/db/product-views";
import { canAccessAnalytics } from "@/server/permissions";
import { auth } from "@clerk/nextjs/server";
import { ViewByCountryChart } from "../_components/charts/view-by-country-chart";

export default async function AnalyticsPage({
    searchParams,
}: {
    searchParams: Promise<{
        interval?: string;
        timezone?: string;
        productId?: string;
    }>;
}) {
    const timezone = (await searchParams).timezone || "UTC";
    const productId = (await searchParams).productId;
    const searchInterval = (await searchParams).interval;
    const interval =
        CHART_INTERVALS[searchInterval as keyof typeof CHART_INTERVALS] ??
        CHART_INTERVALS.last7Days;

    const { userId, redirectToSignIn } = await auth();
    if (userId == null) return redirectToSignIn();

    return (
        <>
            <h1 className="text-3xl font-semibold">Analytics</h1>
            <HasPermission
                permission={canAccessAnalytics}
                renderFallback={true}
                fallbackText="You do not have permission to access analytics"
            >
                <div className="flex flex-col gap-8">
                    <ViewByDayCard />
                    <ViewByPPPCard
                    // interval={interval}
                    // timezone={timezone}
                    // userId={userId}
                    // productId={productId}
                    />
                    <ViewByCountryCard
                        interval={interval}
                        timezone={timezone}
                        userId={userId}
                        productId={productId}
                    />
                </div>
            </HasPermission>
        </>
    );
}

async function ViewByDayCard(
    // props: Parameters<typeof getViewsByDayChartData>[0]
) {
    // const chartData = await getViewsByDayChartData(props);
    return (
        <Card>
            <CardHeader>
                <CardTitle>Visitors per day</CardTitle>
            </CardHeader>
            <CardContent>
                {/* <ViewByDayChart chartData={chartData} /> */}
            </CardContent>
        </Card>
    );
}

async function ViewByPPPCard(
    // props: Parameters<typeof getViewsByPPCChartData>[0]
) {
    // const chartData = await getViewsByPPCChartData(props);
    return (
        <Card>
            <CardHeader>
                <CardTitle>Visitors per PPC</CardTitle>
            </CardHeader>
            <CardContent>
                {/* <ViewByPPCChart chartData={chartData} /> */}
            </CardContent>
        </Card>
    );
}

async function ViewByCountryCard(props: Parameters<typeof getViewsByCountryChartData>[0]) {
    const chartData = await getViewsByCountryChartData(props);
    return (
        <Card>
            <CardHeader>
                <CardTitle>Visitors per country</CardTitle>
            </CardHeader>
            <CardContent>
                <ViewByCountryChart chartData={chartData} />
            </CardContent>
        </Card>
    );
}
