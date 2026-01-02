import { apiFetch } from './api/api';

export interface TutorProfile {
    id: string;
    display_name: string;
    topic: string;
    ollama_model: string;
}

export const getTutors = async (): Promise<TutorProfile[]> => {
    const res = await apiFetch('/api/tutors');
    return res.json();
};

export const streamLocalChat = async (messages: any[], tutorId: string) => {
    const response = await apiFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages,
            tutor_id: tutorId
        })
    });
    
    if (!response.ok) throw new Error('Network response was not ok');
    if (!response.body) throw new Error('No response body');
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    return {
        async *[Symbol.asyncIterator]() {
            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            // Since the backend stream is now just forwarding, we expect JSON chunks
                            const json = JSON.parse(line);
                            yield json;
                        } catch (e) {
                            // It's possible to get partial JSON objects, so we just log and continue
                            console.warn("Could not parse stream chunk:", line, e);
                        }
                    }
                }
            }
        }
    };
};
