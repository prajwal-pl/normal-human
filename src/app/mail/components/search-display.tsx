"use client";
import DOMPurify from "dompurify";
import { useAtom } from "jotai";
import React from "react";
import { isSearchingAtom, searchValueAtom } from "./search-bar";
import { api } from "~/trpc/react";
import { useDebounceValue, useLocalStorage } from "usehooks-ts";
import useThreads from "../use-threads";
import { useThread } from "../use-thread";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const SearchDisplay = () => {
  const [searchValue, setSearchValue] = useAtom(searchValueAtom);
  const [isSearching, setIsSearching] = useAtom(isSearchingAtom);
  const [_, setThreadId] = useThread();
  const search = api.search.search.useMutation();

  const [debouncedSearch] = useDebounceValue(searchValue, 500);
  const [accountId, setAccountId] = useLocalStorage("accountId", "");

  React.useEffect(() => {
    if (!debouncedSearch || !accountId) return;
    console.log({ accountId, debouncedSearch });
    search.mutate({ accountId, query: debouncedSearch });
  }, [debouncedSearch, accountId]);

  console.log(search);

  return (
    <div className="max-h-[calc(100vh-50px)] overflow-y-scroll p-4">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-sm text-gray-600 dark:text-gray-400">
          Your search for "{searchValue}" came back with...
        </h2>
        {search.isPending && (
          <Loader2 className="size-4 animate-spin text-gray-400" />
        )}
      </div>
      {search.data?.hits.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {search.data?.hits.map((hit) => (
            <li
              onClick={() => {
                if (!hit.document.threadId) {
                  toast.error("This message is not part of a thread");
                  return;
                }
                setIsSearching(false);
                setThreadId(hit.document.threadId);
              }}
              key={hit.id}
              className="cursor-pointer rounded-md border p-4 transition-all hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              <h3 className="text-base font-medium">{hit.document.title}</h3>
              <p className="text-sm text-gray-500">From: {hit.document.from}</p>
              <p className="text-sm text-gray-500">
                To: {hit.document.to.join(", ")}
              </p>
              <p
                className="mt-2 text-sm"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(hit.document.rawBody, {
                    USE_PROFILES: { html: true },
                  }),
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchDisplay;
