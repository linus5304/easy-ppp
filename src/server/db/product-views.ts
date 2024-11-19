import { db } from "@/drizzle/db";
import {
  CountryGroupTable,
  CountryTable,
  ProductTable,
  ProductViewTable,
} from "@/drizzle/schema";
import {
  CACHE_TAGS,
  getGlobalTag,
  getIdTag,
  revalidateDBCache,
} from "@/lib/cache";

import { dbCache } from "@/lib/cache";

import { getUserTag } from "@/lib/cache";
import { startOfDay, subDays } from "date-fns";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { tz } from "@date-fns/tz";

export async function getProductViewCount(userId: string, startDate: Date) {
  const cacheFn = dbCache(getProductViewCountInternal, {
    tags: [getUserTag(userId, CACHE_TAGS.productViews)],
  });

  return cacheFn(userId, startDate);
}

export async function getViewsByCountryChartData({
  timezone,
  interval,
  productId,
  userId,
}: {
  timezone: string;
  interval: (typeof CHART_INTERVALS)[keyof typeof CHART_INTERVALS];
  productId?: string;
  userId: string;
}) {
  const cacheFn = dbCache(getViewsByCountryChartDataInternal, {
    tags: [
      getUserTag(userId, CACHE_TAGS.productViews),
      productId == null
        ? getUserTag(userId, CACHE_TAGS.products)
        : getIdTag(productId, CACHE_TAGS.products),
      getGlobalTag(CACHE_TAGS.countries),
    ],
  });

  return cacheFn({ timezone, interval, productId, userId });
}

export async function createProductView({
  productId,
  countryId,
  userId,
}: {
  productId: string;
  countryId?: string;
  userId: string;
}) {
  const [newRow] = await db
    .insert(ProductViewTable)
    .values({
      productId,
      visitedAt: new Date(),
      countryId: countryId,
    })
    .returning({
      id: ProductViewTable.id,
    });
  if (newRow != null) {
    revalidateDBCache({ tag: CACHE_TAGS.productViews, userId, id: productId });
  }
}

async function getProductViewCountInternal(userId: string, startDate: Date) {
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

async function getViewsByCountryChartDataInternal({
  timezone,
  interval,
  productId,
  userId,
}: {
  timezone: string;
  interval: (typeof CHART_INTERVALS)[keyof typeof CHART_INTERVALS];
  productId?: string;
  userId: string;
}) {
  const startDate = startOfDay(interval.startDate, { in: tz(timezone) });
  const productsSQ = getProductSubQuery(userId, productId);

  return db
    .with(productsSQ)
    .select({
      views: count(ProductViewTable.visitedAt),
      countryName: CountryTable.name,
      countryCode: CountryTable.code,
    })
    .from(ProductViewTable)
    .innerJoin(productsSQ, eq(productsSQ.id, ProductViewTable.productId))
    .innerJoin(CountryTable, eq(ProductViewTable.countryId, CountryTable.id))
    .where(
      gte(
        sql`${ProductViewTable.visitedAt} at TIME ZONE ${timezone}`.inlineParams(),
        startDate
      )
    )
    .groupBy(({ countryCode, countryName }) => [countryCode, countryName])
    .orderBy(({ views }) => desc(views))
    .limit(25);
}

function getProductSubQuery(userId: string, productId?: string) {
  return db.$with("products").as(
    db
      .select()
      .from(ProductTable)
      .where(
        and(
          eq(ProductTable.clerkUserId, userId),
          productId == null ? undefined : eq(ProductTable.id, productId)
        )
      )
  );
}

export const CHART_INTERVALS = {
  last7Days: {
    startDate: subDays(new Date(), 7),
    label: "Last 7 days",
  },
  last30Days: {
    startDate: subDays(new Date(), 30),
    label: "Last 30 days",
  },
  last365Days: {
    startDate: subDays(new Date(), 365),
    label: "Last 365 days",
  },
};
