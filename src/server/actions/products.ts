"use server";

import { productDetailsSchema } from "@/schemas/products";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  createProduct as createProductDB,
  deleteProductDB,
} from "@/server/db/products";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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
