"use server";

import { auth } from "@clerk/nextjs/server";
import { stripe } from "./stripe";
import { redirect } from "next/navigation";
import { db } from "~/server/db";

export const createCheckoutSession = async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorised");
  const accountDetails = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      firstName: true,
      emailAddress: true,
    },
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: "price_1QAursSGWiTDQev9OkLtxfLs",
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_URL}/mail`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/mail`,
    client_reference_id: userId,
    shipping_address_collection: {
      allowed_countries: ["US", "IN"],
    },
    // shipping_options: [
    //   {
    //     shipping_rate_data: {
    //       type: "fixed_amount",
    //       fixed_amount: {
    //         amount: 0,
    //         currency: "usd",
    //       },
    //       display_name: "Free shipping",
    //       delivery_estimate: {
    //         minimum: {
    //           unit: "business_day",
    //           value: 5,
    //         },
    //         maximum: {
    //           unit: "business_day",
    //           value: 7,
    //         },
    //       },
    //     },
    //   },
    // ],
    metadata: {
      customer_name: accountDetails?.firstName || "",
      cusomer_address: "Just an address, 123",
    },
  });
  redirect(session.url!);
};

export async function createBillingPortalSession() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorised");
  const subscription = await db.stripeSubscription.findUnique({
    where: {
      userId,
    },
  });
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription?.customerId!,
    return_url: `${process.env.NEXT_PUBLIC_URL}/mail`,
  });
  redirect(session.url!);
}

export async function getSubscriptionStatus() {
  const { userId } = await auth();
  if (!userId) return false;
  const subscription = await db.stripeSubscription.findUnique({
    where: {
      userId,
    },
  });
  if (!subscription) return false;
  return subscription.currentPeriodEnd > new Date();
}
