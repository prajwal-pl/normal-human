import {
  create,
  insert,
  search,
  save,
  load,
  type AnyOrama,
} from "@orama/orama";
import { persist, restore } from "@orama/plugin-data-persistence";
import { db } from "~/server/db";
import { createEmbeddings } from "./embedding";
import type { TypedDocument, Orama, Results, SearchParams } from "@orama/orama";
// import { getEmbeddings } from "@/lib/embeddings";

const searchSchema = {
  title: "string",
  body: "string",
  rawBody: "string",
  from: "string",
  to: "string[]",
  sentAt: "string",
  embeddings: "vector[768]",
  threadId: "string",
} as const;

type searchDocument = TypedDocument<Orama<typeof searchSchema>>;

export class OramaManager {
  // @ts-ignore
  private orama: AnyOrama;
  private accountId: string;

  constructor(accountId: string) {
    this.accountId = accountId;
  }

  async initialize() {
    try {
      const account = await db.account.findUnique({
        where: { id: this.accountId },
        select: { binaryIndex: true },
      });

      if (!account) throw new Error("Account not found");

      if (account.binaryIndex) {
        console.log("Restoring Orama instance from binary index:");
        try {
          this.orama = await restore("json", account.binaryIndex as any);
          console.log("Orama instance restored successfully");
        } catch (error) {
          console.error("Error restoring Orama instance:", error);
          throw error;
        }
      } else {
        console.log("Creating new Orama instance");
        this.orama = await create({
          schema: searchSchema,
        });
        await this.saveIndex();
        console.log("New Orama instance created successfully");
      }
    } catch (error) {
      console.error("Error during Orama initialization:", error);
      throw error;
    }
  }

  async insert(document: any) {
    await insert(this.orama, document);
    await this.saveIndex();
  }

  async vectorSearch({
    prompt,
    numResults = 10,
  }: {
    prompt: string;
    numResults?: number;
  }) {
    try {
      const embeddings = await createEmbeddings(prompt);

      if (!this.orama) throw new Error("Orama is not initialized");
      if (!embeddings) throw new Error("No embeddings found");

      const searchConfig: SearchParams<Orama<typeof searchSchema>> = {
        mode: "hybrid",
        term: prompt,
        vector: {
          value: embeddings,
          property: "embeddings",
        },
        similarity: 0.8,
        limit: numResults,
        hybridWeights: {
          text: 0.8,
          vector: 0.2,
        },
      };
      const results: Results<searchDocument> = await search(
        this.orama,
        searchConfig,
      );
      //   console.log(results.hits.map((hit) => hit.document));
      return results;
    } catch (error) {
      console.error("Error in vectorSearch:", error);
      throw error;
    }
  }
  async search({ term }: { term: string }) {
    try {
      const results = await search(this.orama, { term });
      return results;
    } catch (error) {
      console.error("Error searching:", error);
      throw error;
    }
  }

  async saveIndex() {
    if (!this.orama) {
      throw new Error("Orama is not initialized");
    }
    const index = await persist(this.orama, "json");
    await db.account
      .update({
        where: { id: this.accountId },
        data: { binaryIndex: index as Buffer },
      })
      .then(() => console.log("Saved index to database"));
  }
}

// Usage example:
async function main() {
  const oramaManager = new OramaManager("67358");
  await oramaManager.initialize();

  // Insert a document
  // const emails = await db.email.findMany({
  //     where: {
  //         thread: { accountId: '67358' }
  //     },
  //     select: {
  //         subject: true,
  //         bodySnippet: true,
  //         from: { select: { address: true, name: true } },
  //         to: { select: { address: true, name: true } },
  //         sentAt: true,
  //     },
  //     take: 100
  // })
  // await Promise.all(emails.map(async email => {
  //     // const bodyEmbedding = await getEmbeddings(email.bodySnippet || '');
  //     // console.log(bodyEmbedding)
  //     await oramaManager.insert({
  //         title: email.subject,
  //         body: email.bodySnippet,
  //         from: `${email.from.name} <${email.from.address}>`,
  //         to: email.to.map(t => `${t.name} <${t.address}>`),
  //         sentAt: email.sentAt.getTime(),
  //         // bodyEmbedding: bodyEmbedding,
  //     })
  // }))

  // Search
  const searchResults = await oramaManager.search({
    term: "cascading",
  });

  console.log(searchResults.hits.map((hit) => hit.document));
}

// main().catch(console.error);

// {"internalDocumentIDStore":{"internalIdToId":[]},"index":{"indexes":{"title":{"type":"Radix","node":{"w":"","s":"","e":false,"k":"","d":[],"c":[]},"isArray":false},"body":{"type":"Radix","node":{"w":"","s":"","e":false,"k":"","d":[],"c":[]},"isArray":false},"rawBody":{"type":"Radix","node":{"w":"","s":"","e":false,"k":"","d":[],"c":[]},"isArray":false},"from":{"type":"Radix","node":{"w":"","s":"","e":false,"k":"","d":[],"c":[]},"isArray":false},"to":{"type":"Radix","node":{"w":"","s":"","e":false,"k":"","d":[],"c":[]},"isArray":true},"sentAt":{"type":"Radix","node":{"w":"","s":"","e":false,"k":"","d":[],"c":[]},"isArray":false},"threadId":{"type":"Radix","node":{"w":"","s":"","e":false,"k":"","d":[],"c":[]},"isArray":false}},"vectorIndexes":{},"searchableProperties":["title","body","rawBody","from","to","sentAt","threadId"],"searchablePropertiesWithTypes":{"title":"string","body":"string","rawBody":"string","from":"string","to":"string[]","sentAt":"string","threadId":"string"},"frequencies":{"title":{},"body":{},"rawBody":{},"from":{},"to":{},"sentAt":{},"threadId":{}},"tokenOccurrences":{"title":{},"body":{},"rawBody":{},"from":{},"to":{},"sentAt":{},"threadId":{}},"avgFieldLength":{"title":0,"body":0,"rawBody":0,"from":0,"to":0,"sentAt":0,"threadId":0},"fieldLengths":{"title":{},"body":{},"rawBody":{},"from":{},"to":{},"sentAt":{},"threadId":{}}},"docs":{"docs":{},"count":0},"sorting":{"language":"english","sortableProperties":["title","body","rawBody","from","sentAt","threadId"],"sortablePropertiesWithTypes":{"title":"string","body":"string","rawBody":"string","from":"string","sentAt":"string","threadId":"string"},"sorts":{"title":{"docs":{},"orderedDocs":[],"type":"string"},"body":{"docs":{},"orderedDocs":[],"type":"string"},"rawBody":{"docs":{},"orderedDocs":[],"type":"string"},"from":{"docs":{},"orderedDocs":[],"type":"string"},"sentAt":{"docs":{},"orderedDocs":[],"type":"string"},"threadId":{"docs":{},"orderedDocs":[],"type":"string"}},"enabled":true,"isSorted":true},"language":"english"}
