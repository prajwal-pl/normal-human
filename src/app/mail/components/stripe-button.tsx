"use client";

import React from "react";
import { Button } from "~/components/ui/button";
import { createCheckoutSession } from "~/lib/stripe-action";

const StripeButton = () => {
  const handleClick = async () => {
    await createCheckoutSession();
  };
  return (
    <Button variant={"outline"} onClick={handleClick}>
      StripeButton
    </Button>
  );
};

export default StripeButton;
