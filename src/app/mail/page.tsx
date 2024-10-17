// import { Mail } from "./mail";
import React from "react";
import { ModeToggle } from "~/components/theme-toggle";
import { UserButton } from "@clerk/nextjs";
import ComposeButton from "./components/compose-button";
import dynamic from "next/dynamic";

const Mail = dynamic(() => import("./mail"), { ssr: false });

const Page = () => {
  return (
    <>
      <div className="absolute bottom-4 left-4 z-10 mr-2 flex items-center gap-2">
        <UserButton />
        <ModeToggle />
        <ComposeButton />
      </div>
      <Mail
        defaultLayout={[25, 32, 48]}
        navCollapsedSize={4}
        defaultCollapsed={false}
      />
    </>
  );
};

export default Page;
