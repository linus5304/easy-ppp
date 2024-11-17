import { db } from "@/drizzle/db";
import { UserSubscriptionTable } from "@/drizzle/schema";
import { revalidateDBCache } from "@/lib/cache";
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
