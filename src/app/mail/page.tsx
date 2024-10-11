import dynamic from "next/dynamic";
import { Mail } from "./mail";
import React from "react";
// const Mail = dynamic(()=>{
//   return import("./mail")
// }, {
//   ssr: false
// })
const Page = () => {
  return (
    <div>
      <Mail
        defaultLayout={[20, 32, 48]}
        navCollapsedSize={4}
        defaultCollapsed={false}
      />
    </div>
  );
};

export default Page;
