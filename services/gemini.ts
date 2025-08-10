import { GoogleGenAI, Type } from "@google/genai";
import { QuizItem } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const quizItemSchema = {
  type: Type.OBJECT,
  properties: {
    question: {
      type: Type.STRING,
      description: "生成された問題文",
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "4つの選択肢の配列",
    },
    answer: {
      type: Type.STRING,
      description: "正解の選択肢。options配列の中のいずれかの値と完全に一致する必要があります。",
    },
  },
  required: ["question", "options", "answer"],
};

const quizSchema = {
  type: Type.ARRAY,
  items: quizItemSchema,
};

/**
 * Generates a quiz from a given text using the Gemini API.
 * @param text The source text to generate the quiz from.
 * @param count The number of questions to generate.
 * @returns A promise that resolves with an array of quiz items.
 */
export async function generateQuizFromText(text: string, count: number): Promise<QuizItem[]> {
  const prompt = `
あなたは教育の専門家で、クイズ作成の達人です。
以下のテキストに基づいて、重要な概念の理解度をテストするための多肢選択式の質問を${count}個生成してください。
各質問には、4つの選択肢を用意し、正解を明確に示してください。
「answer」の値は、必ず「options」配列に含まれる文字列の1つと完全に一致させてください。
提供されたスキーマに厳密に従ったJSONオブジェクトとして結果を返してください。

--- テキスト ---
${text.substring(0, 20000)}
---
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        temperature: 0.5,
      },
    });
    
    const responseText = response.text.trim();
    if (!responseText) {
        throw new Error("AIからの応答が空です。テキストの内容や長さを変えて再度お試しください。");
    }

    const quizData = JSON.parse(responseText);
    
    // Basic validation
    if (!Array.isArray(quizData) || quizData.length === 0) {
      throw new Error("AIが有効なクイズ形式を生成できませんでした。");
    }

    return quizData as QuizItem[];
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("AIによるクイズ生成中にエラーが発生しました。");
  }
}