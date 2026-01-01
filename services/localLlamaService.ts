const API_BASE = 'http://localhost:8020';

export interface TutorProfile {
    id: string;
    display_name: string;
    topic: string;
    ollama_model: string;
}

export const getTutors = async (): Promise<TutorProfile[]> => {
    const res = await fetch(`${API_BASE}/api/tutors`);
    return res.json();
};

export const streamLocalChat = async (messages: any[], tutorId: string) => {
    // ... same as before, but pass 'tutor_id' in body instead of 'model'
    const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages,
            tutor_id: tutorId
        })
    });
    // ... return stream reader (same as previous code)
    // ...
    // ...
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
                            const json = JSON.parse(line);
                            if (json.text) yield { text: json.text };
                        } catch (e) {}
                    }
                }
            }
        }
    };
};
