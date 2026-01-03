





import { GoogleGenAI, Chat, GenerateContentResponse, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// --- AI TUTOR SERVICE ---
let chat: Chat | null = null;

const getChatInstance = (): Chat => {
    if (!chat) {
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: 'You are an expert AI Tutor. Your goal is to help users understand complex topics by providing clear explanations, step-by-step examples, and asking probing questions to test their knowledge. Be patient, encouraging, and adapt your teaching style to the user\'s needs.',
            },
        });
    }
    return chat;
}

export const streamChat = (message: string) => {
    const chatInstance = getChatInstance();
    return chatInstance.sendMessageStream({ message });
};


// --- STUDY BUDDY (NOTES-BASED) SERVICE ---
let studyBuddyChat: Chat | null = null;
let currentNotesContext = '';

export const streamStudyBuddyChat = (message: string, notes: string) => {
    // If the chat doesn't exist or the notes have changed, create a new instance.
    if (!studyBuddyChat || currentNotesContext !== notes) {
        currentNotesContext = notes;
        const systemInstruction = `You are an expert AI Study Buddy. The user has provided the following notes to study from:
---
${notes || 'No notes provided yet.'}
---
Your knowledge is strictly limited to the text provided above. You CANNOT use any external information. When responding to the user:
1. First, determine if the user's question can be answered using ONLY the provided notes.
2. If the answer is in the notes, provide a comprehensive answer based exclusively on that text.
3. If the answer is NOT in the notes, you MUST begin your response with the exact phrase: "Based on the provided notes, I can't find information on that topic." After this phrase, you may optionally and briefly mention what the notes DO cover. Do not try to answer the original question.`;

        studyBuddyChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction,
            },
        });
    }

    return studyBuddyChat.sendMessageStream({ message });
};

export const startFeynmanSession = async (topic: string): Promise<string> => {
    const prompt = `You are an expert tutor using the Feynman Technique. I want to learn about "${topic}". 
    
    My goal is to explain this concept to you in simple terms. Your role is to:
    1. Listen to my explanation.
    2. Identify gaps in my understanding or jargon that I'm hiding behind.
    3. Ask probing questions to test my depth.
    4. Rate my simplicity on a scale of 1-5 when I'm done.
    
    Do NOT explain the topic yourself yet. Start by asking me to explain the core concept of "${topic}" as if I were teaching a beginner.`;

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return result.text;
    } catch (error) {
        console.error("Error starting Feynman session:", error);
        return "I'm ready to help you learn! Please start by explaining the topic to me.";
    }
};


// --- CONCEPT VISUALIZER SERVICE ---
export const generateImage = async (prompt: string, aspectRatio: string) => {
    const fullPrompt = `A clear, educational diagram or mind map illustrating the following concept. Use minimal text, focusing on visual representation. Concept: "${prompt}"`;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio,
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

// --- NOTE SUMMARIZATION SERVICE ---
export const summarizeText = async (text: string): Promise<string> => {
    const prompt = `Summarize the following academic text or notes. Focus on extracting the key concepts, definitions, and main arguments. Present the summary in a clear, structured format, using bullet points or numbered lists where appropriate. Text: "${text}"`;
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

// --- AUDIO SUMMARIZATION SERVICE ---
export const summarizeAudioFromBase64 = async (base64Data: string, mimeType: string): Promise<string> => {
    const audioPart = {
        inlineData: {
            data: base64Data,
            mimeType: mimeType,
        },
    };
    const textPart = {
        text: "First, transcribe the provided audio accurately. Second, based on the transcription, provide a concise summary of the key points and topics discussed. Use bullet points for the summary."
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, audioPart] },
    });
    return response.text;
};

// --- CODE HELPER SERVICE ---
export const generateCode = async (prompt: string, language: string): Promise<string> => {
    const fullPrompt = `You are an expert programming assistant. The user is asking for help with a coding task in ${language}. Provide a clear and accurate response. If generating code, wrap it in a single markdown code block (\`\`\`${language.toLowerCase()}\\n...\`\`\`). Task: "${prompt}"`;
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
    });
    return response.text;
};

// --- TEXT EXTRACTION FROM FILE SERVICE ---
export const extractTextFromFile = async (base64Data: string, mimeType: string): Promise<string> => {
    const filePart = {
        inlineData: {
            data: base64Data,
            mimeType: mimeType,
        },
    };
    const textPart = {
        text: "Extract all text content from the provided document. Present it as clean, unformatted text. If the document is a presentation, extract text from all slides."
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, filePart] },
    });
    return response.text;
};

// --- QUIZ GENERATION SERVICE ---
export const generateQuizQuestion = async (context: string): Promise<string> => {
    const prompt = `Based on the following context, generate a single multiple-choice quiz question to test understanding. The question should focus on a key concept from the text. Context: "${context.substring(0, 4000)}"`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    topic: { type: Type.STRING, description: "A brief, one or two-word topic for the question (e.g., 'Photosynthesis', 'Calculus')." },
                    question: { type: Type.STRING },
                    options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    correctOptionIndex: { type: Type.INTEGER }
                },
                required: ["topic", "question", "options", "correctOptionIndex"]
            }
        }
    });

    return response.text;
};

// --- AI STUDY SUGGESTIONS SERVICE ---
export const getStudySuggestions = async (reportJson: string): Promise<string> => {
    const prompt = `You are an expert academic advisor. Based on the following JSON data of a student's weekly performance, provide 2-3 concise, actionable suggestions to help them improve. Focus on their weaknesses, time management, or quiz performance. Frame your advice in a positive and encouraging tone.\n\nStudent Performance Data:\n${reportJson}\n\nYour Suggestions:`;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

// --- FLASHCARD GENERATION SERVICE ---
export const generateFlashcards = async (context: string): Promise<string> => {
    const prompt = `Based on the following context, generate a list of flashcards. Each flashcard should have a 'front' (a question or term) and a 'back' (the answer or definition). Context: "${context.substring(0, 4000)}"`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        front: { type: Type.STRING },
                        back: { type: Type.STRING }
                    },
                    required: ["front", "back"]
                }
            }
        }
    });

    return response.text;
};

/**
 * Gets a smart suggestion based on the user's reported mood.
 */
export const getSuggestionForMood = async (mood: string): Promise<string> => {
    console.log(`Getting AI suggestion for mood: ${mood}`);

    const prompt = `A user in my learning app just reported their mood as '${mood}'.
Provide one, short (1-2 sentences) and encouraging, actionable suggestion.
- If mood is 'Happy' or 'Calm', suggest a good study task.
- If mood is 'Overwhelmed', suggest a way to get clarity.
- If mood is 'Sad' or 'Angry', suggest a constructive way to manage the feeling.

Example for 'Angry': 'Feeling frustrated? Try taking a short 5-minute walk to clear your head before diving back in.'
Example for 'Overwhelmed': 'Not sure what to do next? Try breaking down your main goal into smaller steps or ask the AI chat for ideas.'
Example for 'Happy': 'Great! Now is a perfect time to tackle that challenging topic you've been putting off.'`;

    try {
        // --- REAL GEMINI API CALL ---
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return result.text;

        return "Let's make today productive!";

    } catch (error) {
        console.error("Error in getSuggestionForMood:", error);
        return "Could not get an AI suggestion at this time.";
    }
};

// --- GOAL BREAKDOWN SERVICE ---
export const breakDownGoal = async (goalTitle: string): Promise<string> => {
    const prompt = `A user has set the following academic goal: "${goalTitle}".
Break this high-level goal down into a short list of 3-5 small, actionable sub-tasks.
Return ONLY a JSON array of strings.
Example for "Learn React": ["Understand JSX syntax", "Learn about components and props", "Practice state management with useState", "Build a simple to-do app"]`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    });

    return response.text;
};

// --- 11. Smart Quiz Generation (Tier 1 AI Feature) ---
export const generateQuizFromContent = async (content: string): Promise<any[]> => {
    if (!content) return [];

    const prompt = `
    You are an expert AI tutor. Based on the following study notes, generate a short 5-question quiz to test the student's understanding.
    
    NOTES CONTENT:
    """
    ${content.slice(0, 3000)}
    """

    Return ONLY a raw JSON array (no markdown, no code blocks) with this exact structure:
    [
        {
            "id": "unique_id_1",
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctOptionIndex": 0
        }
    ]
    `;

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const text = result.text;
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Error generating quiz from content:", error);
        // Fallback mock check if API fails (or for dev without key)
        return [
            {
                id: '1',
                question: 'What is the main topic of these notes (AI generation error)?',
                options: ['Topic A', 'Topic B', 'Topic C', 'Topic D'],
                correctOptionIndex: 0
            }
        ];
    }
};

// --- 12. Smart Note Analysis (Tier 1 AI Feature) ---
export const analyzeNoteContent = async (content: string): Promise<{ tags: string[], concepts: string[] }> => {
    if (!content) return { tags: [], concepts: [] };

    const prompt = `
    Analyze the following note content and extract:
    1. 3-5 relevant "tags" (short, lowercase keywords).
    2. 2-3 core "concepts" (key ideas or definitions discussed).

    NOTE CONTENT:
    """
    ${content.slice(0, 3000)}
    """

    Return ONLY a raw JSON object with this exact structure:
    {
        "tags": ["tag1", "tag2"],
        "concepts": ["Concept 1", "Concept 2"]
    }
    `;

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const text = result.text;
        // Gemini flash sometimes returns markdown blocks even with json mode
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Error analyzing note:", error);
        return { tags: [], concepts: [] };
    }
};