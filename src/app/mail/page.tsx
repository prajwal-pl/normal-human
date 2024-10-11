import dynamic from "next/dynamic";
import { Mail } from "./mail";
import React from "react";
import { ModeToggle } from "~/components/theme-toggle";
// const Mail = dynamic(()=>{
//   return import("./mail")
// }, {
//   ssr: false
// })
const Page = () => {
  return (
    <>
      <div className="absolute bottom-4 left-0">
        <ModeToggle />
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
