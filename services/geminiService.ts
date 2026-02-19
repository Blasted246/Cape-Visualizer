
import { GoogleGenAI, Type } from "@google/genai";
import { CapeSuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Fetches an image from a URL and converts it to a base64 Data URL string.
 */
const imageUrlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const analyzeSkinAndSuggestCape = async (skinData: string): Promise<CapeSuggestion> => {
  try {
    let base64Image = skinData;

    // If it's a remote URL, we must convert it to base64 for the Gemini API
    if (skinData.startsWith('http')) {
      base64Image = await imageUrlToBase64(skinData);
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Image.split(',')[1] || base64Image
              }
            },
            {
              text: "Analyze this Minecraft skin and suggest a creative cape design that would match its style. Provide the response in JSON format including name, description, colorPalette (hex codes), and theme."
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            colorPalette: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            theme: { type: Type.STRING }
          },
          required: ["name", "description", "colorPalette", "theme"]
        }
      }
    });

    return JSON.parse(response.text || '{}') as CapeSuggestion;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
      name: "Classic Complement",
      description: "A simple, elegant cape that matches your skin's primary colors.",
      colorPalette: ["#333333", "#ffffff"],
      theme: "Minimalist"
    };
  }
};
