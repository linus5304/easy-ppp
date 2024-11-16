import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageWithBackButton from "../../_components/page-with-back-button";
import { ProductDetailsForm } from "../../_components/forms/product-details-form";

export default function NewProductPage() {
  return (
    <PageWithBackButton
      pageTitle="New Products"
      backButtonHref="/dashboard/products"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-sl">Product details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductDetailsForm />
        </CardContent>
      </Card>
    </PageWithBackButton>
  );
}
