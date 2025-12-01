
import { GoogleGenAI, GenerateContentResponse, Modality, LiveServerMessage, Type } from "@google/genai";

const apiKey = typeof process !== 'undefined' ? process.env.API_KEY || '' : '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION_CODE = `
You are an expert Frontend Engineer and UI/UX Designer specialized in Tailwind CSS.
Your goal is to generate single-file HTML snippets containing modern, Apple-style (iOS/macOS aesthetic) UI code based on user prompts.

RULES:
1. Output ONLY valid HTML code with Tailwind CSS classes. 
2. Do NOT output Markdown code blocks (no \`\`\`html). Just the raw code.
3. Use 'Inter' font.
4. If the user provides an image (sketch or annotation), interpret the red lines as "changes requested" or "layout structure".
5. The code should be a complete <div> or <section> that can be rendered inside a container.
6. Use FontAwesome (via CDN) or assume standard SVGs are available if needed, but prefer simple Tailwind shapes or text.
7. Make the design responsive, mobile-first.
`;

const SYSTEM_INSTRUCTION_CHAT = `
You are 'Architect', a helpful AI assistant for an app building platform. 
You help users plan their apps, find design inspiration, and answer technical questions.
You have access to Google Search to find the latest design trends and libraries.
You are concise, professional, and helpful.
`;

// --- Code Generation (Complex Task -> Gemini 3 Pro) ---
export const generateUIUpdate = async (
  currentCode: string,
  prompt: string,
  imageBase64?: string
): Promise<string> => {
  const modelId = imageBase64 ? 'gemini-3-pro-image-preview' : 'gemini-3-pro-preview';

  const userContentParts: any[] = [];
  let fullPrompt = `Current Code:\n${currentCode}\n\nUser Request: ${prompt}`;

  if (imageBase64) {
    userContentParts.push({
      inlineData: {
        data: imageBase64,
        mimeType: 'image/png'
      }
    });
    fullPrompt += "\n\n(Refer to the attached image/sketch for layout or visual feedback. Red lines indicate specific changes or focus areas.)";
  }

  userContentParts.push({ text: fullPrompt });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: {
        role: 'user',
        parts: userContentParts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_CODE,
        temperature: 0.4,
        thinkingConfig: { thinkingBudget: 1024 } // Mild thinking for code structure
      }
    });

    let text = response.text || '';
    text = text.replace(/^```html/, '').replace(/^```/, '').replace(/```$/, '');
    return text.trim();
  } catch (error) {
    console.error("Gemini API Error (Code):", error);
    throw new Error("Failed to generate UI.");
  }
};

// --- General Chat + Search + Thinking (Complex -> Gemini 3 Pro) ---
export const askArchitect = async (
  history: { role: string; text: string }[],
  currentMessage: string
) => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        { role: 'user', parts: [{ text: currentMessage }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_CHAT,
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 8192 } // Higher budget for reasoning/search
      }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const grounding = groundingChunks?.map((chunk: any) => chunk.web).filter(Boolean) || [];

    return {
      text: response.text || "I couldn't generate a response.",
      grounding
    };
  } catch (error) {
    console.error("Gemini API Error (Chat):", error);
    return { text: "Sorry, I'm having trouble connecting right now.", grounding: [] };
  }
};

// --- Transcription (Fast -> Gemini 2.5 Flash) ---
export const transcribeAudio = async (base64Audio: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/wav', data: base64Audio } },
          { text: "Transcribe this audio exactly as spoken." }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Transcription Error:", error);
    return "";
  }
};

// --- Text to Speech (TTS -> Gemini 2.5 Flash TTS) ---
export const speakText = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }
          }
        }
      }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};


// --- Live API Helpers ---

// Audio Encoding/Decoding Utils
export const audioUtils = {
  createBlob: (data: Float32Array): { data: string; mimeType: string } => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return {
      data: btoa(binary),
      mimeType: 'audio/pcm;rate=16000',
    };
  },

  decode: (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  },

  decodeAudioData: async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }
};

export const connectLive = (callbacks: any) => {
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
      systemInstruction: "You are Architect.ai, a voice assistant for building apps. Be brief and helpful."
    },
  });
};
