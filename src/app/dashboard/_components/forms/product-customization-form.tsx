"use client";

import { useForm } from "react-hook-form";

import { productCustomizationSchema } from "@/schemas/products";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import RequiredLabelIcon from "@/components/reuired-label-icon";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import Banner from "@/components/banner";
import { updateProductCustomization } from "@/server/actions/products";
import { useToast } from "@/hooks/use-toast";
import { NoPermissionCard } from "@/components/no-permission-card";

export default function ProductCustomizationForm({
    canRemoveBranding,
    canCustomizeBanner,
    customization,
}: {
    canRemoveBranding: boolean;
    canCustomizeBanner: boolean;
    customization: {
        productId: string;
        locationMessage: string;
        backgroundColor: string;
        textColor: string;
        fontSize: string;
        isSticky: boolean;
        bannerContainer: string;
        classPrefix?: string;
    }
}) {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof productCustomizationSchema>>({
        resolver: zodResolver(productCustomizationSchema),
        defaultValues: {
            ...customization,
            classPrefix: customization.classPrefix ?? "",
        },
    });

    async function onSubmit(values: z.infer<typeof productCustomizationSchema>) {
        const data = await updateProductCustomization(customization.productId, values);
        if (data.message) {
            toast({
                title: data.error ? "Error" : "Success",
                description: data.message,
                variant: data.error ? "destructive" : "default",
            });
        }
    }

    const formValues = form.watch();

    return (
        <>
            <div>
                <Banner
                    message={formValues.locationMessage}
                    mappings={{
                        country: "US",
                        coupon: "HALF-OFF",
                        discount: "50",
                    }}
                    customization={formValues}
                    canRemoveBranding={canRemoveBranding}
                />
            </div>
            {!canCustomizeBanner && (
                <div className="mt-8">
                    <NoPermissionCard>
                        You do not have permission to customize the banner.
                    </NoPermissionCard>
                </div>
            )}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-6 mt-8 flex-col">
                    <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="locationMessage"
                            render={({ field }) => <FormItem
                                {...field}
                            >
                                <FormLabel>PPP Discount Message
                                    <RequiredLabelIcon />
                                </FormLabel>
                                <FormControl>
                                    <Textarea disabled={!canCustomizeBanner} className="min-h-20 resize-none" {...field} />
                                </FormControl>
                                <FormDescription>
                                    {"Data parameters: {country}, {coupon}, {discount}"}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="backgroundColor"
                                render={({ field }) => <FormItem {...field}>
                                    <FormLabel>Background Color
                                        <RequiredLabelIcon />
                                    </FormLabel>
                                    <FormControl>
                                        <Input disabled={!canCustomizeBanner} {...field} />
                                    </FormControl>
                                </FormItem>}
                            />
                            <FormField
                                control={form.control}
                                name="textColor"
                                render={({ field }) => <FormItem {...field}>
                                    <FormLabel>Text Color
                                        <RequiredLabelIcon />
                                    </FormLabel>
                                    <FormControl>
                                        <Input disabled={!canCustomizeBanner} {...field} />
                                    </FormControl>
                                </FormItem>}
                            />
                            <FormField
                                control={form.control}
                                name="fontSize"
                                render={({ field }) => <FormItem {...field}>
                                    <FormLabel>Font Size
                                        <RequiredLabelIcon />
                                    </FormLabel>
                                    <FormControl>
                                        <Input disabled={!canCustomizeBanner} {...field} />
                                    </FormControl>
                                </FormItem>}
                            />
                            <FormField
                                control={form.control}
                                name="isSticky"
                                render={({ field }) => <FormItem {...field}>
                                    <FormLabel>Sticky?</FormLabel>
                                    <FormControl>
                                        <Switch
                                            className="block"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={!canCustomizeBanner}
                                        />
                                    </FormControl>
                                </FormItem>}
                            />
                            <FormField
                                control={form.control}
                                name="bannerContainer"
                                render={({ field }) => <FormItem {...field}>
                                    <FormLabel>Banner Container
                                        <RequiredLabelIcon />
                                    </FormLabel>
                                    <FormControl>
                                        <Input disabled={!canCustomizeBanner} {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        HTML container selector where you want to place the banner. Ex: #container, .container, body, etc.
                                    </FormDescription>
                                </FormItem>}
                            />
                            <FormField
                                control={form.control}
                                name="classPrefix"
                                render={({ field }) => <FormItem {...field}>
                                    <FormLabel>Class Prefix</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={!canCustomizeBanner} />
                                    </FormControl>
                                    <FormDescription>
                                        An optional prefix added to all CSS classes to avoid conflicts.
                                    </FormDescription>
                                </FormItem>}
                            />
                        </div>
                    </div>
                    {canCustomizeBanner && (
                        <div className="self-end">
                            <Button disabled={form.formState.isSubmitting} type="submit">
                                Save
                            </Button>
                        </div>
                    )}
                </form>
            </Form>
        </>
    )
}
