import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageWithBackButton from "../../_components/page-with-back-button";
import { ProductDetailsForm } from "../../_components/forms/product-details-form";
import { HasPermission } from "@/components/has-permissions";
import { canCreateProduct } from "@/server/permissions";

export default function NewProductPage() {
  return (
    <PageWithBackButton
      pageTitle="New Products"
      backButtonHref="/dashboard/products"
    >
      <HasPermission
        permission={canCreateProduct}
        renderFallback
        fallbackText="You have created the maximum number of products. Try upgrading your account to create more.">
        <Card>
          <CardHeader>
            <CardTitle className="text-sl">Product details</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductDetailsForm />
          </CardContent>
        </Card>
      </HasPermission>
    </PageWithBackButton>
  );
}
