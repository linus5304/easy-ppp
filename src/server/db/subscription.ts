import { subscriptionTiers } from "@/data/subscriptionTiers";
import { db } from "@/drizzle/db";
import { UserSubscriptionTable } from "@/drizzle/schema";
import { getIdTag, dbCache, revalidateDBCache } from "@/lib/cache";
import { CACHE_TAGS } from "@/lib/cache";

export async function createUserSubscription(
  data: typeof UserSubscriptionTable.$inferInsert
) {
  const [newSubscription] = await db
    .insert(UserSubscriptionTable)
    .values(data)
    .onConflictDoNothing({
      target: UserSubscriptionTable.clerkUserId,
    })
    .returning({
      id: UserSubscriptionTable.id,
      userId: UserSubscriptionTable.clerkUserId,
    });

  if (newSubscription != null) {
    revalidateDBCache({
      tag: CACHE_TAGS.subscriptions,
      userId: newSubscription.userId,
      id: newSubscription.id,
    });
  }

  return newSubscription;
}

export async function getUserSubscription(userId: string) {
  const cacheFn = dbCache(getUserSubscriptionInternal, {
    tags: [getIdTag(userId, CACHE_TAGS.subscriptions)],
  });

  return cacheFn(userId);
}

export async function getUserSubscriptionTier(userId: string) {
  const subscription = await getUserSubscription(userId);
  if (subscription == null) throw new Error("User has no subscription");

  return subscriptionTiers[subscription.tier];
}

// Internal functions

export async function getUserSubscriptionInternal(userId: string) {
  const data = await db.query.UserSubscriptionTable.findFirst({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
  });

  return data;
}
