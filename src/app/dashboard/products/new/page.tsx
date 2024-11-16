import PageWithBackButton from "../../_components/page-with-back-button";

export default function NewProductPage() {
  return (
    <PageWithBackButton
      pageTitle="New Products"
      backButtonHref="/dashboard/products"
    >
      Inner
    </PageWithBackButton>
  );
}
