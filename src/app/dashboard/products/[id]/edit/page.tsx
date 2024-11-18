import { CountryDiscountsForm } from "@/app/dashboard/_components/forms/country-discounts-form";
import ProductCustomizationForm from "@/app/dashboard/_components/forms/product-customization-form";
import { ProductDetailsForm } from "@/app/dashboard/_components/forms/product-details-form";
import PageWithBackButton from "@/app/dashboard/_components/page-with-back-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { clearFullCache } from "@/lib/cache";
import { getProduct, getProductCountryGroups, getProductCustomization, getProducts } from "@/server/db/products";
import { canCustomizeBanner, canRemoveBranding } from "@/server/permissions";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ tab?: string; }>;

export default async function EditProductPage({
    params,
    searchParams,
}: {
    params: Params;
    searchParams: SearchParams;
}) {
    const { id } = await params;
    const { tab } = await searchParams;
    const { userId, redirectToSignIn } = await auth();
    if (userId == null) {
        return redirectToSignIn();
    }

    const product = await getProduct({ id, userId });
    if (product == null) {
        return notFound();
    }

    return (<PageWithBackButton pageTitle={product.name} backButtonHref={`/dashboard/products`}>
        <Tabs defaultValue={tab}>
            <TabsList className="bg-background/60">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="country">Countries</TabsTrigger>
                <TabsTrigger value="customization">Customization</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
                <DetailsTab product={product} />
            </TabsContent>
            <TabsContent value="country">
                <CountriesTab productId={product.id} userId={userId} />
            </TabsContent>
            <TabsContent value="customization">
                <CustomizationTab productId={product.id} userId={userId} />
            </TabsContent>
        </Tabs>
    </PageWithBackButton>)

}


function DetailsTab({ product }: {
    product: {
        id: string;
        name: string;
        url: string;
        description: string | null;
    }
}) {
    return <Card>
        <CardHeader>
            <CardTitle className="text-xl">Product Details</CardTitle>
        </CardHeader>
        <CardContent>
            <ProductDetailsForm product={product} />
        </CardContent>
    </Card>
}

async function CountriesTab({ productId, userId }: {
    productId: string;
    userId: string;
}) {
    const countryGroups = await getProductCountryGroups({ productId, userId });

    // clearFullCache()
    return <Card>
        <CardHeader>
            <CardTitle className="text-xl">Country Discounts</CardTitle>
            <CardDescription>Leave the discound field blank if you do not want to display deals for any specific parity group</CardDescription>
        </CardHeader>
        <CardContent>
            <CountryDiscountsForm productId={productId} countryGroups={countryGroups} />
        </CardContent>
    </Card>
}

async function CustomizationTab({ productId, userId }: { productId: string, userId: string }) {
    const customization = await getProductCustomization({ productId, userId });
    if (customization == null) return notFound();

    return <Card>
        <CardHeader>
            <CardTitle className="text-xl">Banner Customization</CardTitle>
        </CardHeader>
        <CardContent>
            <ProductCustomizationForm
                canRemoveBranding={await canRemoveBranding(userId)}
                canCustomizeBanner={await canCustomizeBanner(userId)}
                customization={customization}
            />
        </CardContent>
    </Card>
}