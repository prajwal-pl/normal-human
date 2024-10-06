import { SignUp } from "@clerk/nextjs";
import React from "react";

type Props = {};

const Signin = (props: Props) => {
  return (
    <div className="flex h-screen items-center justify-center">
      <SignUp />
    </div>
  );
};

export default Signin;
