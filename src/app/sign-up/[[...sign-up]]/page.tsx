import { SignUp } from "@clerk/nextjs";
import React from "react";

const Signin = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <SignUp />
    </div>
  );
};

export default Signin;
