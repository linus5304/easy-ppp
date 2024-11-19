"use server";

import { PaidTierNames, subscriptionTiers } from "@/data/subscriptionTiers";
import { auth, currentUser, User } from "@clerk/nextjs/server";
import { getUserSubscription } from "../db/subscriptions";
import { Stripe } from "stripe";
import { env as serverEnv } from "@/data/env/server";
import { env as clientEnv } from "@/data/env/client";
import { redirect } from "next/navigation";

const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY);

export async function createCancelSession() {
  const user = await currentUser();
  if (user == null) throw new Error();

  const subscription = await getUserSubscription(user.id);
  if (subscription == null) throw new Error();

  if (
    subscription.stripeCustomerId == null ||
    subscription.stripeSubscriptionId == null
  )
    throw new Error("Missing stripe customer or subscription id");

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${clientEnv.NEXT_PUBLIC_SERVER_URL}/dashboard/subscriptions`,
    flow_data: {
      type: "subscription_cancel",
      subscription_cancel: {
        subscription: subscription.stripeSubscriptionId,
      },
    },
  });

  redirect(portalSession.url);
}

export async function createCustomerPortalSession() {
  const { userId } = await auth();
  if (userId == null) throw new Error();

  const subscription = await getUserSubscription(userId);
  if (subscription?.stripeCustomerId == null) throw new Error();

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${clientEnv.NEXT_PUBLIC_SERVER_URL}/dashboard/subscriptions`,
  });
  redirect(portalSession.url);
}

export async function createCheckoutSession(tier: PaidTierNames) {
  const user = await currentUser();
  if (user == null) throw new Error();

  const subscription = await getUserSubscription(user.id);
  if (subscription == null) throw new Error();

  if (subscription.stripeCustomerId == null) {
    const url = await getCheckoutSession(tier, user);
    if (url == null) throw new Error();
    redirect(url);
  } else {
    const url = await getSubscriptionUpgradeSession(tier, subscription);
    if (url == null) throw new Error();
    redirect(url);
  }
}

async function getCheckoutSession(tier: PaidTierNames, user: User) {
  const session = await stripe.checkout.sessions.create({
    customer_email: user.primaryEmailAddress?.emailAddress,
    subscription_data: {
      metadata: {
        clerkUserId: user.id,
      },
    },
    line_items: [{ price: subscriptionTiers[tier].stripePriceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${clientEnv.NEXT_PUBLIC_SERVER_URL}/dashboard/subscriptions`,
    cancel_url: `${clientEnv.NEXT_PUBLIC_SERVER_URL}/dashboard/subscriptions`,
  });

  return session.url;
}

async function getSubscriptionUpgradeSession(
  tier: PaidTierNames,
  subscription: {
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    stripeSubscriptionItemId: string | null;
  }
) {
  if (
    subscription.stripeCustomerId == null ||
    subscription.stripeSubscriptionId == null ||
    subscription.stripeSubscriptionItemId == null
  ) {
    throw new Error();
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${clientEnv.NEXT_PUBLIC_SERVER_URL}/dashboard/subscriptions`,
    flow_data: {
      type: "subscription_update_confirm",
      subscription_update_confirm: {
        subscription: subscription.stripeSubscriptionId,
        items: [
          {
            id: subscription.stripeSubscriptionItemId,
            price: subscriptionTiers[tier].stripePriceId,
            quantity: 1,
          },
        ],
      },
    },
  });

  return portalSession.url;
}
