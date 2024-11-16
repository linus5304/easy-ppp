import { db } from "@/drizzle/db";
import { UserSubscriptionTable } from "@/drizzle/schema";

export async function createUserSubscription(
  data: typeof UserSubscriptionTable.$inferInsert
) {
  await db.insert(UserSubscriptionTable).values(data).onConflictDoNothing({
    target: UserSubscriptionTable.clerkUserId,
  });
}
