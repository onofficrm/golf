import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to check if API key is available
export const isGeminiConfigured = (): boolean => {
  return !!apiKey;
};

/**
 * Generates a creative title or content for a post using Gemini.
 */
export const generatePostHelp = async (context: string, type: 'join' | 'market' | 'community'): Promise<string> => {
  if (!apiKey) return "API 키 설정을 기다리고 있습니다.";

  try {
    const modelId = 'gemini-3-flash-preview';
    let prompt = "";

    if (type === 'join') {
      prompt = `골프 조인 모집글을 위한 짧고 매력적인 제목을 만들어주세요 (최대 10단어, 한국어). 
      상황: ${context}. 
      친근하고 초대하는 느낌으로 작성해주세요.`;
    } else if (type === 'market') {
      prompt = `이 골프 용품을 판매하기 위한 짧고 설득력 있는 한 문장 설명을 작성해주세요 (한국어): ${context}.`;
    } else {
      prompt = `골프 커뮤니티 토론을 위한 도움이 되는 답변이나 게시글 내용을 초안으로 작성해주세요 (한국어, 50단어 이내): ${context}.`;
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text?.trim() || "내용을 생성할 수 없습니다.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI가 잠시 휴식 중입니다. 나중에 다시 시도해주세요.";
  }
};

/**
 * Provides AI advice on golf rules or etiquette.
 */
export const askGolfCoach = async (question: string): Promise<string> => {
  if (!apiKey) return "코치에게 질문하려면 API 키를 설정해주세요.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `당신은 전문 골프 프로이자 지역 커뮤니티 매니저입니다. 
      사용자의 질문에 대해 짧고 도움이 되도록 한국어로 답변해주세요 (최대 3문장): "${question}"`,
    });
    return response.text?.trim() || "스윙을 제대로 보지 못했습니다. 다시 질문해주세요.";
  } catch (error) {
    console.error(error);
    return "코치가 지금 필드에 나가 있습니다.";
  }
};
