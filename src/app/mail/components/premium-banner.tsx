"use client";
import { motion } from "framer-motion";
import React from "react";
import { FREE_CREDITS_PER_DAY } from "~/app/constants";
// import StripeButton from './stripe-button'
import { api } from "~/trpc/react";
import StripeButton from "./stripe-button";
import { getSubscriptionStatus } from "~/lib/stripe-action";
import useThreads from "../use-threads";
// import { FREE_CREDITS_PER_DAY } from '@/app/constants'
// import { getSubscriptionStatus } from '@/lib/stripe-actions'

const PremiumBanner = () => {
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const { accountId } = useThreads();
  const { data } = api.mail.getChatbotInteraction.useQuery({
    accountId,
  });
  React.useEffect(() => {
    (async () => {
      const subscriptionStatus = await getSubscriptionStatus();
      setIsSubscribed(subscriptionStatus);
    })();
  }, []);

  // const { data: chatbotInteraction } = api.mail.getChatbotInteraction.useQuery()
  // const remainingCredits = chatbotInteraction?.remainingCredits || 0

  if (isSubscribed)
    return (
      <motion.div
        layout
        className="relative flex flex-col gap-4 overflow-hidden rounded-lg border bg-gray-900 p-4 dark:bg-zinc-900 md:flex-row"
      >
        <img
          src="/bot.webp"
          className="h-[180px] w-auto md:absolute md:-bottom-6 md:-right-10"
        />
        <div>
          <h1 className="text-xl font-semibold text-white">Premium Plan</h1>
          <div className="h-2"></div>
          <p className="text-sm text-gray-400 md:max-w-[calc(100%-70px)]">
            Ask as many questions as you want
          </p>
          <div className="h-4"></div>
          <StripeButton />
        </div>
      </motion.div>
    );

  return (
    <motion.div
      layout
      className="relative flex flex-col gap-4 overflow-hidden rounded-lg border bg-gray-900 p-4 dark:bg-zinc-900 md:flex-row"
    >
      <img
        src="/bot.webp"
        className="h-[180px] w-auto md:absolute md:-bottom-6 md:-right-10"
      />
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-white">Basic Plan</h1>
          <p className="text-sm text-gray-400 md:max-w-[calc(100%-0px)]">
            {data?.remainingCredits} / {FREE_CREDITS_PER_DAY} messages remaining
          </p>
        </div>
        <div className="h-4"></div>
        <p className="text-sm text-gray-400 md:max-w-[calc(100%-150px)]">
          Upgrade to pro to ask as many questions as you want
        </p>
        <div className="h-4"></div>
        <StripeButton />
      </div>
    </motion.div>
  );
};

export default PremiumBanner;
