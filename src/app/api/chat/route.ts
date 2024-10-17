import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

import {
  Message,
  GoogleGenerativeAIStream,
  StreamingTextResponse,
  streamText,
  LanguageModelV1,
  StreamData,
} from "ai";
import { OramaManager } from "~/lib/orama";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export const POST = async (req: Request) => {
  try {
    const { accountId, messages } = await req.json();
    const userId = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const orama = new OramaManager(accountId);
    await orama.initialize();

    const lastMessage = messages[messages.length - 1];
    console.log("lastMessage: ", lastMessage);

    const context = await orama.vectorSearch({
      prompt: lastMessage.content,
    });
    console.log(context.hits.length + " hits found!");

    const prompt = {
      role: "system",
      content: `You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by answering questions, providing suggestions, and offering relevant information based on the context of their previous emails.
        THE TIME NOW IS ${new Date().toLocaleString()}
  
  START CONTEXT BLOCK
  ${context.hits.map((hit) => JSON.stringify(hit.document)).join("\n")}
  END OF CONTEXT BLOCK
  
  When responding, please keep in mind:
  - Be helpful, clever, and articulate.
  - Rely on the provided email context to inform your responses.
  - If the context does not contain enough information to answer a question, politely say you don't have enough information.
  - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
  - Do not invent or speculate about anything that is not directly supported by the email context.
  - Keep your responses concise and relevant to the user's questions or the email being composed.`,
    };

    const model = await genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await streamText({
      model: google("gemini-1.5-flash"),
      messages: [
        {
          role: "system",
          content: prompt.content,
        },
        {
          role: "user",
          content: lastMessage.content,
        },
      ],
    });

    // example: use textStream as an async iterable
    for await (const textPart of result.textStream) {
      console.log(textPart);
    }

    const data = new StreamData();
    console.log(data);
    return result.toDataStreamResponse({ data });
  } catch (error) {
    console.log(error);
    return new Response("Error", { status: 500 });
  }
};
