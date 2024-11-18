"use server";

import {
  productCountryGroupDiscountSchema,
  productCustomizationSchema,
  productDetailsSchema,
} from "@/schemas/products";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  createProduct as createProductDB,
  deleteProductDB,
  updateCountryDiscountDB,
  updateProductCustomizationDB,
  updateProductDB,
} from "@/server/db/products";
import { redirect } from "next/navigation";
import { canCustomizeBanner } from "../permissions";

export async function createProduct(
  unsafeData: z.infer<typeof productDetailsSchema>
): Promise<{ error: boolean; message: string } | undefined> {
  const { userId } = await auth();
  const { success, data } = productDetailsSchema.safeParse(unsafeData);

  if (!success || userId == null) {
    return { error: true, message: "There was an error creating your product" };
  }

  const { id } = await createProductDB({ ...data, clerkUserId: userId });
  redirect(`/dashboard/products/${id}/edit?tab=countries`);
}
export async function updateProduct(
  id: string,
  unsafeData: z.infer<typeof productDetailsSchema>
): Promise<{ error: boolean; message: string } | undefined> {
  const errorMessage = "There was an error updating your product";
  const { userId } = await auth();
  const { success, data } = productDetailsSchema.safeParse(unsafeData);

  if (!success || userId == null) {
    return { error: true, message: errorMessage };
  }

  const isSuccess = await updateProductDB(data, { id, userId });
  return {
    error: !isSuccess,
    message: isSuccess ? "Successfully updated product" : errorMessage,
  };
}

export async function deleteProduct(
  id: string
): Promise<{ error: boolean; message: string } | undefined> {
  const { userId } = await auth();
  const errorMessage = "There was an error deleting your product";

  if (userId == null) {
    return { error: true, message: errorMessage };
  }

  const isSuccess = await deleteProductDB({ id, userId });

  return {
    error: !isSuccess,
    message: isSuccess ? "Successfully deleted product" : errorMessage,
  };
}

export async function updateCountryDiscount(
  productId: string,
  values: z.infer<typeof productCountryGroupDiscountSchema>
) {
  console.log(values);
  const { userId } = await auth();
  const { success, data } = productCountryGroupDiscountSchema.safeParse(values);

  if (!success || userId == null) {
    return {
      error: true,
      message: "There was an error updating your country discounts",
    };
  }

  const insert: {
    countryGroupId: string;
    productId: string;
    coupon: string;
    discountPercentage: number;
  }[] = [];

  const deleteIds: { countryGroupId: string }[] = [];

  data.groups.forEach((group) => {
    if (
      group.coupon != null &&
      group.coupon.length > 0 &&
      group.discountPercentage != null &&
      group.discountPercentage > 0
    ) {
      insert.push({
        countryGroupId: group.countryGroupId,
        coupon: group.coupon,
        discountPercentage: group.discountPercentage / 100,
        productId,
      });
    } else {
      deleteIds.push({ countryGroupId: group.countryGroupId });
    }
  });

  await updateCountryDiscountDB(deleteIds, insert, { productId, userId });

  return {
    error: false,
    message: "Successfully updated country discounts",
  };
}

export async function updateProductCustomization(
  productId: string,
  values: z.infer<typeof productCustomizationSchema>
) {
  const { userId } = await auth();
  const { success, data } = productCustomizationSchema.safeParse(values);
  const canCustomize = await canCustomizeBanner(userId);

  if (!success || userId == null || !canCustomize) {
    return {
      error: true,
      message: "There was an error updating your banner",
    };
  }

  await updateProductCustomizationDB(data, { productId, userId });

  return { error: false, message: "Successfully updated banner" };
}
