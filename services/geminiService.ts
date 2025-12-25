
import { GoogleGenAI, Type } from "@google/genai";
import { SpellInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateSpell = async (prompt: string): Promise<SpellInfo> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a mystical Doctor Strange style spell for: ${prompt}`,
    config: {
      systemInstruction: "You are an ancient librarian of the Mystic Arts. Generate unique spells including a name, a short description, a fake Latin/Sanskrit-style incantation, and a hex color code that fits the spell's theme.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          incantation: { type: Type.STRING },
          color: { type: Type.STRING }
        },
        required: ["name", "description", "incantation", "color"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return {
      name: "Eldritch Shield",
      description: "A standard defensive barrier of pure energy.",
      incantation: "Protego Maximus",
      color: "#fb923c"
    };
  }
};

export const getMysticAdvice = async (history: { role: 'user' | 'model', content: string }[]) => {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are Wong, the librarian of Kamar-Taj. You are helpful, slightly dry, and knowledgeable about the Mystic Arts. Keep responses concise and thematic."
    }
  });

  // We only send the last message for simplicity in this demo environment
  const lastMsg = history[history.length - 1].content;
  const result = await chat.sendMessage({ message: lastMsg });
  return result.text;
};
