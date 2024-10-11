"use client";
import { File, Inbox, Send } from "lucide-react";
import React from "react";
import { useLocalStorage } from "usehooks-ts";
import { api } from "~/trpc/react";
import { Nav } from "./nav";

type SidebarProps = {
  isCollapsed: boolean;
};
const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const [tab] = useLocalStorage("normalhuman-tab", "inbox");
  const [accountId] = useLocalStorage("accountId", "");

  const refetchInterval = 5000;
  const { data: inboxThreads } = api.mail.getNumThreads.useQuery(
    {
      accountId,
      tab: "inbox",
    },
    { enabled: !!accountId && !!tab, refetchInterval },
  );

  const { data: draftsThreads } = api.mail.getNumThreads.useQuery(
    {
      accountId,
      tab: "drafts",
    },
    { enabled: !!accountId && !!tab, refetchInterval },
  );

  const { data: sentThreads } = api.mail.getNumThreads.useQuery(
    {
      accountId,
      tab: "sent",
    },
    { enabled: !!accountId && !!tab, refetchInterval },
  );
  return (
    <>
      <Nav
        isCollapsed={isCollapsed}
        links={[
          {
            title: "Inbox",
            label: inboxThreads?.toString() || "0",
            icon: Inbox,
            variant: tab === "inbox" ? "default" : "ghost",
          },
          {
            title: "Drafts",
            label: draftsThreads?.toString() || "0",
            icon: File,
            variant: tab === "drafts" ? "default" : "ghost",
          },
          {
            title: "Sent",
            label: sentThreads?.toString() || "0",
            icon: Send,
            variant: tab === "sent" ? "default" : "ghost",
          },
        ]}
      />
    </>
  );
};

export default Sidebar;
