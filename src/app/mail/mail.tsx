"use client";

import * as React from "react";

import { cn } from "~/lib/utils";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { TooltipProvider } from "~/components/ui/tooltip";
import { AccountSwitcher } from "~/app/mail/components/account-switcher";
import { ThreadDisplay } from "./thread-display";
import { ThreadList } from "./thread-list";
import { useLocalStorage } from "usehooks-ts";
import SideBar from "./sidebar";
import { useAtom } from "jotai";

import AskAI from "./ask-ai";
import SearchBar from "./components/search-bar";
import dynamic from "next/dynamic";

interface MailProps {
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

const Mail = ({
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize,
}: MailProps) => {
  const [done, setDone] = useLocalStorage("normalhuman-done", false);
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [sizes, setSizes] = React.useState([20, 32, 48]);

  React.useEffect(() => {
    document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(sizes)}`;
  }, [sizes]);

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(newSizes: number[]) => setSizes(newSizes)}
        className="h-full min-h-screen items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={40}
          onCollapse={() => {
            setIsCollapsed(true);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              true,
            )}`;
          }}
          onResize={() => {
            setIsCollapsed(false);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              false,
            )}`;
          }}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out",
          )}
        >
          <div className="flex h-full flex-1 flex-col">
            <div
              className={cn(
                "flex h-[52px] items-center justify-center",
                isCollapsed ? "h-[52px]" : "px-2",
              )}
            >
              <AccountSwitcher isCollapsed={isCollapsed} />
            </div>
            <Separator />
            <SideBar isCollapsed={isCollapsed} />
            <div className="flex-1"></div>
            <AskAI isCollapsed={isCollapsed} />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs
            defaultValue="inbox"
            value={done ? "done" : "inbox"}
            onValueChange={(tab) => {
              if (tab === "done") {
                setDone(true);
              } else {
                setDone(false);
              }
            }}
          >
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">Inbox</h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="inbox"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Inbox
                </TabsTrigger>
                <TabsTrigger
                  value="done"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Done
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <SearchBar />
            <TabsContent value="inbox" className="m-0">
              <ThreadList />
            </TabsContent>
            <TabsContent value="done" className="m-0">
              <ThreadList />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          <ThreadDisplay />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
};

export default dynamic(() => Promise.resolve(Mail), { ssr: false });
