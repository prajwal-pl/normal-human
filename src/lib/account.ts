import type {
  EmailHeader,
  EmailMessage,
  SyncResponse,
  SyncUpdatedResponse,
} from "../lib/types";
import { db } from "~/server/db";
import axios from "axios";
import { syncEmailsToDatabase } from "./sync-to-db";

const API_BASE_URL = "https://api.aurinko.io/v1";

export class Account {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async startSync(daysWithin: number): Promise<SyncResponse> {
    const response = await axios.post<SyncResponse>(
      `${API_BASE_URL}/email/sync`,
      {},
      {
        headers: { Authorization: `Bearer ${this.token}` },
        params: {
          daysWithin,
          bodyType: "html",
        },
      },
    );
    return response.data;
  }

  async syncEmails() {
    const account = await db.account.findUnique({
      where: {
        token: this.token,
      },
    });
    if (!account) throw new Error("Invalid token");
    if (!account.nextDeltaToken) throw new Error("No delta token");
    let response = await this.getUpdatedEmails({
      deltaToken: account.nextDeltaToken,
    });
    let allEmails: EmailMessage[] = response.records;
    let storedDeltaToken = account.nextDeltaToken;
    if (response.nextDeltaToken) {
      storedDeltaToken = response.nextDeltaToken;
    }
    while (response.nextPageToken) {
      response = await this.getUpdatedEmails({
        pageToken: response.nextPageToken,
      });
      allEmails = allEmails.concat(response.records);
      if (response.nextDeltaToken) {
        storedDeltaToken = response.nextDeltaToken;
      }
    }

    if (!response) throw new Error("Failed to sync emails");

    try {
      await syncEmailsToDatabase(allEmails, account.id);
    } catch (error) {
      console.log("error", error);
    }

    // console.log('syncEmails', response)
    await db.account.update({
      where: {
        id: account.id,
      },
      data: {
        nextDeltaToken: storedDeltaToken,
      },
    });
  }

  async getUpdatedEmails({
    deltaToken,
    pageToken,
  }: {
    deltaToken?: string;
    pageToken?: string;
  }): Promise<SyncUpdatedResponse> {
    // console.log('getUpdatedEmails', { deltaToken, pageToken });
    let params: Record<string, string> = {};
    if (deltaToken) {
      params.deltaToken = deltaToken;
    }
    if (pageToken) {
      params.pageToken = pageToken;
    }
    const response = await axios.get<SyncUpdatedResponse>(
      `${API_BASE_URL}/email/sync/updated`,
      {
        params,
        headers: { Authorization: `Bearer ${this.token}` },
      },
    );
    return response.data;
  }

  async performInitialSync() {
    try {
      // Start the sync process
      const daysWithin = 2;
      let syncResponse = await this.startSync(daysWithin); // Sync emails from the last 7 days

      // Wait until the sync is ready
      while (!syncResponse.ready) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
        syncResponse = await this.startSync(daysWithin);
      }

      // console.log('Sync is ready. Tokens:', syncResponse);

      // Perform initial sync of updated emails
      let storedDeltaToken: string = syncResponse.syncUpdatedToken;
      let updatedResponse = await this.getUpdatedEmails({
        deltaToken: syncResponse.syncUpdatedToken,
      });
      // console.log('updatedResponse', updatedResponse)
      if (updatedResponse.nextDeltaToken) {
        storedDeltaToken = updatedResponse.nextDeltaToken;
      }
      let allEmails: EmailMessage[] = updatedResponse.records;

      // Fetch all pages if there are more
      while (updatedResponse.nextPageToken) {
        updatedResponse = await this.getUpdatedEmails({
          pageToken: updatedResponse.nextPageToken,
        });
        allEmails = allEmails.concat(updatedResponse.records);
        if (updatedResponse.nextDeltaToken) {
          storedDeltaToken = updatedResponse.nextDeltaToken;
        }
      }

      // console.log('Initial sync complete. Total emails:', allEmails.length);

      // Store the nextDeltaToken for future incremental syncs

      // Example of using the stored delta token for an incremental sync
      // await this.performIncrementalSync(storedDeltaToken);
      return {
        emails: allEmails,
        deltaToken: storedDeltaToken,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error during sync:",
          JSON.stringify(error.response?.data, null, 2),
        );
      } else {
        console.error("Error during sync:", error);
      }
    }
  }
}
