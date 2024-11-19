import { db } from "@/drizzle/db";
import { ProductTable, ProductViewTable } from "@/drizzle/schema";
import { CACHE_TAGS } from "@/lib/cache";

import { dbCache } from "@/lib/cache";

import { getUserTag } from "@/lib/cache";
import { and, count, eq, gte } from "drizzle-orm";

export async function getPricingViewCount(userId: string, startDate: Date) {
  const cacheFn = dbCache(getPricingViewCountInternal, {
    tags: [getUserTag(userId, CACHE_TAGS.productViews)],
  });

  return cacheFn(userId, startDate);
}

async function getPricingViewCountInternal(userId: string, startDate: Date) {
  const counts = await db
    .select({
      pricingViewCount: count(),
    })
    .from(ProductViewTable)
    .innerJoin(ProductTable, eq(ProductViewTable.productId, ProductTable.id))
    .where(
      and(
        eq(ProductTable.clerkUserId, userId),
        gte(ProductViewTable.visitedAt, startDate)
      )
    );

  return counts[0]?.pricingViewCount ?? 0;
}
