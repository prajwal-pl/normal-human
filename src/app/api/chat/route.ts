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
import { FREE_CREDITS_PER_DAY } from "~/app/constants";
import { OramaManager } from "~/lib/orama";
import { getSubscriptionStatus } from "~/lib/stripe-action";
import { db } from "~/server/db";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
const today = new Date().toDateString();

export const POST = async (req: Request) => {
  try {
    const { accountId, messages } = await req.json();
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const isSubscribed = await getSubscriptionStatus();
    if (!isSubscribed) {
      const chatbotInteraction = await db.chatbotInteraction.findUnique({
        where: {
          day: today,
          userId,
        },
      });
      if (!chatbotInteraction) {
        await db.chatbotInteraction.create({
          data: {
            day: today,
            userId,
            count: 1,
          },
        });
      } else if (chatbotInteraction.count >= FREE_CREDITS_PER_DAY) {
        return new Response("Maximum number of credits reached for today", {
          status: 429,
        });
      }
    }

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

    const data = new StreamData();

    const result = await streamText({
      model: google("gemini-1.5-flash"),
      system: "Hi I'm Normal Human AI",
      messages: [
        {
          role: "system",
          content: prompt.content,
        },
        {
          role: "user",
          content: [
            ...messages.map((message: Message) => message.content),
          ].join("\n"),
        },
      ],
      onFinish: async () => {
        data.close();
        await db.chatbotInteraction.update({
          where: {
            day: today,
            userId,
          },
          data: {
            count: {
              increment: 1,
            },
          },
        });
      },
    });

    // example: use textStream as an async iterable
    for await (const textPart of result.textStream) {
      console.log(textPart);
    }

    console.log(data);
    return result.toDataStreamResponse({ data });
  } catch (error: any) {
    console.log(error);
    return new Response(error.message, { status: 500 });
  }
};
