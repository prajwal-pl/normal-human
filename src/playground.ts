// // import { create, insert, search } from "@orama/orama";
// // import { OramaManager } from "./lib/orama";
// // import { db } from "./server/db";
// // import { turndown } from "./lib/turndown";
// // import { createEmbeddings } from "./lib/embedding";

// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { OramaManager } from "./lib/orama";

// // // async function main() {
// // //   const oramaManager = new OramaManager("71075");
// // //   await oramaManager.initialize();

// // //   // Insert a document
// // //   const emails = await db.email.findMany({
// // //     select: {
// // //       subject: true,
// // //       bodySnippet: true,
// // //       from: { select: { address: true, name: true } },
// // //       to: { select: { address: true, name: true } },
// // //       sentAt: true,
// // //     },
// // //     take: 100,
// // //   });
// // //   await Promise.all(
// // //     // @ts-ignore
// // //     emails.map(async (email: { email: any }) => {
// // //       // const bodyEmbedding = await getEmbeddings(email.bodySnippet || '');
// // //       // console.log(bodyEmbedding)
// // //       await oramaManager.insert({
// // //         // @ts-ignore
// // //         title: email.subject,
// // //         // @ts-ignore
// // //         body: email.bodySnippet,
// // //         // @ts-ignore
// // //         from: `${email.from.name} <${email.from.address}>`,
// // //         // @ts-ignore
// // //         to: email.to.map((t) => `${t.name} <${t.address}>`),
// // //         // @ts-ignore
// // //         sentAt: email.sentAt.getTime(),
// // //         // bodyEmbedding: bodyEmbedding,
// // //       });
// // //     }),
// // //   );

// // //   // Search
// // //   const searchResults = await oramaManager.search({
// // //     term: "cascading",
// // //   });

// // //   console.log(searchResults.hits.map((hit) => hit.document));
// // // }

// // const orama = await create({
// //   schema: {
// //     subject: "string",
// //     body: "string",
// //     rawBody: "string",
// //     from: "string",
// //     to: "string[]",
// //     sentAt: "string",
// //     embeddings: "vector[768]",
// //     threadId: "string",
// //   },
// // });

// // const emails = await db.email.findMany({
// //   select: {
// //     subject: true,
// //     body: true,
// //     bodySnippet: true,
// //     from: { select: { address: true, name: true } },
// //     to: { select: { address: true, name: true } },
// //     sentAt: true,
// //     threadId: true,
// //   },
// //   take: 50,
// // });

// // for (const email of emails) {
// //   const body = turndown.turndown(email.body || email.bodySnippet || "");
// //   const embedding = await createEmbeddings(body);
// //   console.log(embedding.length);
// //   //@ts-ignore
// //   await insert(orama, {
// //     subject: email.subject,
// //     body: body,
// //     rawBody: email.bodySnippet,
// //     from: `${email.from.name} <${email.from.address}>`,
// //     to: email.to.map((t) => `${t.name} <${t.address}>`),
// //     sentAt: email.sentAt.toLocaleString(),
// //     threadId: email.threadId,
// //     embeddings: embedding,
// //   });
// //   // console.log(email.subject);
// // }

// // async function vectorSearch({
// //   prompt,
// //   numResults = 10,
// // }: {
// //   prompt: string;
// //   numResults?: number;
// // }) {
// //   const embeddings = await createEmbeddings(prompt);
// //   const results = await search(orama, {
// //     mode: "hybrid",
// //     term: prompt,
// //     vector: {
// //       value: embeddings,
// //       property: "embeddings",
// //     },
// //     similarity: 0.8,
// //     limit: numResults,
// //     // hybridWeights: {
// //     //     text: 0.8,
// //     //     vector: 0.2,
// //     // }
// //   });
// //   // console.log(results.hits.map(hit => hit.document))
// //   return results;
// // }

// // const searchResults = await vectorSearch({
// //   prompt: "google",
// // });

// // console.log(searchResults);

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
// async function getChatResponse(text: string) {
//   // const orama = new OramaManager("71075");
//   const model = await genAI.getGenerativeModel({
//     model: "gemini-1.5-pro-latest",
//   });

//   // const context = await orama.vectorSearch({
//   //   prompt: lastMessage.content,
//   // });

//   const prompt = {
//     role: "user",
//     content: `You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by answering questions, providing suggestions, and offering relevant information based on the context of their previous emails.
//         THE TIME NOW IS ${new Date().toLocaleString()}

//   START CONTEXT BLOCK
//   ${text}
//   END OF CONTEXT BLOCK

//   When responding, please keep in mind:
//   - Be helpful, clever, and articulate.
//   - Rely on the provided email context to inform your responses.
//   - If the context does not contain enough information to answer a question, politely say you don't have enough information.
//   - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
//   - Do not invent or speculate about anything that is not directly supported by the email context.
//   - Keep your responses concise and relevant to the user's questions or the email being composed.`,
//   };

//   const response = await model.generateContent({
//     contents: [
//       {
//         role: "user",
//         parts: [
//           {
//             text: prompt.content,
//           },
//         ],
//       },
//     ],
//   });

//   console.log(response?.response?.candidates[0]?.content?.parts[0]?.text);
// }

// getChatResponse("how many post impressions did I get on LInkedIn?");
