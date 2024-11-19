import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

export function ViewByCountryChart({ chartData }: {
    chartData: {
        countryCode: string;
        views: number;
        countryName: string;
    }[]
}) {
    const chartConfig = {
        views: {
            label: "Visitors",
            color: "hsl(var(--accent))",
        }
    } satisfies ChartConfig;
    if (chartData.length === 0)
        return (
            <p className="flex items-center justify-center text-muted-foreground min-h-[150px] max-h-[250px]">
                No data available
            </p>
        );
    return (
        <ChartContainer config={chartConfig} className="min-h-[150px] max-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <XAxis dataKey="countryCode" tickLine={false} tickMargin={10} />
                    <YAxis />
                    <Bar dataKey="views" fill={chartConfig.views.color} />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
