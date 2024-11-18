"use client";

import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { productCountryGroupDiscountSchema } from "@/schemas/products";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateCountryDiscount } from "@/server/actions/products";


export function CountryDiscountsForm({
    productId,
    countryGroups,
}: {
    productId: string;
    countryGroups: {
        id: string;
        name: string;
        recommendedDiscountPercentage: number | null;
        countries: {
            code: string;
            name: string;
        }[];
        discounts?: {
            coupon: string | null;
            discountPercentage: number;
        };
    }[];
}) {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof productCountryGroupDiscountSchema>>({
        resolver: zodResolver(productCountryGroupDiscountSchema),
        defaultValues: {
            groups: countryGroups.map(group => {
                const discount = group.discounts?.discountPercentage ?? group.recommendedDiscountPercentage;
                return {
                    countryGroupId: group.id,
                    coupon: group.discounts?.coupon ?? "",
                    discountPercentage: discount != null ? discount * 100 : undefined,
                }
            })
        }

    })

    async function onSubmit(values: z.infer<typeof productCountryGroupDiscountSchema>) {
        const data = await updateCountryDiscount(productId, values);
        if (data.message) {
            toast({
                title: data.error ? "Error" : "Success",
                description: data.message,
                variant: data.error ? "destructive" : "default",
            })
        }
    }

    return <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-6 flex-col">
            {countryGroups.map((group, index) => (
                <Card key={group.id}>
                    <CardContent className="pt-6 flex gap-16 items-center">
                        <div className="w-1/2">
                            <h2 className="text-sm text-muted-foreground mb-2 font-semibold">{group.name}</h2>
                            <div className="flex gap-2 flex-wrap">
                                {group.countries.map(country => (
                                    <Image key={country.code} height={24} width={24} src={`https://catamphetamine.gitlab.io/country-flag-icons/3x2/${country.code.toUpperCase()}.svg`} alt={country.name} className="border" />
                                ))}
                            </div>
                        </div>
                        <Input type="hidden" {...form.register(`groups.${index}.countryGroupId`)} />
                        <div className="ml-auto flex-shrink-0 flex gap-2 flex-col w-min">
                            <div className="flex gap-4 ">
                                <FormField control={form.control} name={`groups.${index}.discountPercentage`} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discount %</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={e => {
                                                    const value = e.target.valueAsNumber;
                                                    field.onChange(isNaN(value) ? "" : value);
                                                }}
                                                min={0} max={100}
                                                className="w-24"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name={`groups.${index}.coupon`} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Coupon</FormLabel>
                                        <FormControl>
                                            <Input className="w-48" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>
                            <FormMessage>
                                {form.formState.errors.groups?.[index]?.root?.message}
                            </FormMessage>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <div className="self-end">
                <Button type="submit">Save</Button>
            </div>
        </form>
    </Form>;
}
