import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";

import { Message, GoogleGenerativeAIStream, StreamingTextResponse } from "ai";
import { OramaManager } from "~/lib/orama";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export const POST = async (req: Request) => {
  try {
    const { accountId, messages } = await req.json();
    const userId = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const orama = new OramaManager(accountId);
    orama.initialize();

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

    // const parts: (string | Part)[] = [
    //   {

    //     text: prompt.content,
    //   },
    // ];

    // interface Content {
    //   role: string;
    //   content: string;
    //   parts: Part[];
    // }

    // const streamMessages: Content[] = [
    //   {
    //     role: "system",
    //     parts: [prompt.content],
    //   },
    //   ...messages
    //     .filter((message: Message) => message.role === "user")
    //     .map((message: Message) => ({
    //       role: message.role,
    //       parts: [message.content],
    //     })),
    // ];

    const response = await model.generateContent({
      systemInstruction: prompt.content,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: lastMessage.content,
            },
          ],
        },
      ],
    });
    // const stream = GoogleGenerativeAIStream(response, {
    //   onStart: () => {
    //     console.log("started");
    //   },
    //   onCompletion: () => {
    //     console.log("Completed");
    //   },
    // });
    console.log(
      //@ts-ignore
      response.response.candidates[0]?.content?.parts[0]?.text,
    );
    // return new StreamingTextResponse(stream);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Error", { status: 500 });
  }
};
