"use client";

import React from "react";
import { Button } from "~/components/ui/button";
import {
  createBillingPortalSession,
  createCheckoutSession,
  getSubscriptionStatus,
} from "~/lib/stripe-action";

const StripeButton = () => {
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  React.useEffect(() => {
    (async () => {
      const subscriptionStatus = await getSubscriptionStatus();
      setIsSubscribed(subscriptionStatus);
    })();
  }, []);
  const handleClick = async () => {
    if (isSubscribed) {
      await createBillingPortalSession();
    } else {
      await createCheckoutSession();
    }
  };
  return (
    <Button variant={"outline"} onClick={handleClick}>
      {isSubscribed ? "Manage Subscription" : "Upgrade Plan"}
    </Button>
  );
};

export default StripeButton;
