import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export const createEmbeddings = async (text: string) => {
  try {
    const updatedText = text.replace(/\n/g, " ");
    const response = await genAI.getGenerativeModel({
      model: "text-embedding-004",
    });
    const result = await response.embedContent(updatedText);
    console.log(result.embedding.values);

    return result.embedding.values;
  } catch (error) {
    console.log("Error calling genAi embeddings", error);
    throw error;
  }
};

// console.log((await createEmbeddings("hello world")).length);
