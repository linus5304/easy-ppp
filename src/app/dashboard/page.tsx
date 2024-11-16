import { getProducts } from "@/server/db/products";
import { auth } from "@clerk/nextjs/server";
import NoProducts from "./_components/no-products";
import Link from "next/link";
import { ArrowRightIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "./_components/product-grid";

export default async function DashboardPage() {
  const { userId, redirectToSignIn } = await auth();
  if (userId === null) return redirectToSignIn();

  const products = await getProducts(userId, { limit: 6 });
  if (products.length === 0) return <NoProducts />;
  return (
    <>
      <h2 className="text-3xl mb-6 font-semibold flex justify-between">
        <Link
          href="/dashboard/products"
          className="group flex gap-2 items-center hover:underline"
        >
          Products
          <ArrowRightIcon className="group-hover:translate-x-1 transition-transform" />
        </Link>
        <Button asChild>
          <Link href="/dashboard/products/new">
            <PlusIcon className="size-4 mr-2" />
            New product
          </Link>
        </Button>
      </h2>
      <ProductGrid products={products} />
    </>
  );
}
