import { create, insert, search } from "@orama/orama";
import { OramaManager } from "./lib/orama";
import { db } from "./server/db";

// async function main() {
//   const oramaManager = new OramaManager("71075");
//   await oramaManager.initialize();

//   // Insert a document
//   const emails = await db.email.findMany({
//     select: {
//       subject: true,
//       bodySnippet: true,
//       from: { select: { address: true, name: true } },
//       to: { select: { address: true, name: true } },
//       sentAt: true,
//     },
//     take: 100,
//   });
//   await Promise.all(
//     // @ts-ignore
//     emails.map(async (email: { email: any }) => {
//       // const bodyEmbedding = await getEmbeddings(email.bodySnippet || '');
//       // console.log(bodyEmbedding)
//       await oramaManager.insert({
//         // @ts-ignore
//         title: email.subject,
//         // @ts-ignore
//         body: email.bodySnippet,
//         // @ts-ignore
//         from: `${email.from.name} <${email.from.address}>`,
//         // @ts-ignore
//         to: email.to.map((t) => `${t.name} <${t.address}>`),
//         // @ts-ignore
//         sentAt: email.sentAt.getTime(),
//         // bodyEmbedding: bodyEmbedding,
//       });
//     }),
//   );

//   // Search
//   const searchResults = await oramaManager.search({
//     term: "cascading",
//   });

//   console.log(searchResults.hits.map((hit) => hit.document));
// }

const orama = await create({
  schema: {
    subject: "string",
    body: "string",
    rawBody: "string",
    from: "string",
    to: "string[]",
    sentAt: "string",
    // embeddings: "vector[1536]",
    threadId: "string",
  },
});

const emails = await db.email.findMany({
  select: {
    subject: true,
    body: true,
    bodySnippet: true,
    from: { select: { address: true, name: true } },
    to: { select: { address: true, name: true } },
    sentAt: true,
    threadId: true,
  },
  take: 100,
});

for (const email of emails) {
  //@ts-ignore
  await insert(orama, {
    subject: email.subject,
    body: email.body,
    rawBody: email.bodySnippet,
    from: `${email.from.name} <${email.from.address}>`,
    to: email.to.map((t) => `${t.name} <${t.address}>`),
    sentAt: email.sentAt.toLocaleString(),
    threadId: email.threadId,
  });
  // console.log(email.subject);
}

const searchResults = await search(orama, {
  term: "google",
});

console.log(searchResults);
