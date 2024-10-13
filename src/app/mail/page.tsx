import dynamic from "next/dynamic";
import { Mail } from "./mail";
import React from "react";
import { ModeToggle } from "~/components/theme-toggle";
import { UserButton } from "@clerk/nextjs";
import ComposeButton from "./components/compose-button";
// const Mail = dynamic(()=>{
//   return import("./mail")
// }, {
//   ssr: false
// })
const Page = () => {
  return (
    <>
      <div className="absolute bottom-4 left-4">
        <div className="z-10 mr-2 flex items-center gap-2">
          <UserButton />
          <ModeToggle />
          <ComposeButton />
        </div>
      </div>
      <Mail
        defaultLayout={[20, 32, 48]}
        navCollapsedSize={4}
        defaultCollapsed={false}
      />
    </>
  );
};

export default Page;
