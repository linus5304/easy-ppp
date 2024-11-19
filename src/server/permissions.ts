import { startOfMonth } from "date-fns";
import { getProductsCount } from "./db/products";
import { getUserSubscriptionTier } from "./db/subscriptions";
import { getProductViewCount } from "./db/product-views";

export async function canRemoveBranding(userId: string | null) {
  if (userId == null) return false;

  const tier = await getUserSubscriptionTier(userId);
  return tier.canRemoveBranding;
}

export async function canCustomizeBanner(userId: string | null) {
  if (userId == null) return false;

  const tier = await getUserSubscriptionTier(userId);
  return tier.canCustomizeBanner;
}

export async function canAccessAnalytics(userId: string | null) {
  if (userId == null) return false;

  const tier = await getUserSubscriptionTier(userId);
  return tier.canAccessAnalytics;
}

export async function canCreateProduct(userId: string | null) {
  if (userId == null) return false;

  const tier = await getUserSubscriptionTier(userId);
  const productsCount = await getProductsCount(userId);
  return productsCount < tier.maxNumberOfProducts;
}

export async function canShowDiscountBanner(userId: string | null) {
  if (userId == null) return false;

  const tier = await getUserSubscriptionTier(userId);
  const productViews = await getProductViewCount(
    userId,
    startOfMonth(new Date())
  );
  return productViews < tier.maxNumberOfVisits;
}
