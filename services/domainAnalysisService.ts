import { apiFetch } from './api/api';

export interface AnalysisRequest {
    text: string;
    domain: string;
    queryType?: string; // Optional, default will be set by backend
    model_size?: string; // Optional, default will be set by backend
    advanced_analysis?: boolean; // Optional, default will be set by backend
    context?: {
        subject?: string;
        level?: string;
        format?: string;
    };
}

export interface ChatRequestForNodeBackend {
    messages: Array<{
        role: string;
        parts: Array<{ text: string }>;
    }>;
    tutor_id: string; // Corresponds to the domain
}

export interface AnalysisResponse {
    summary: string;
    roadmap: string;
    key_concepts?: string[];
    difficulty_level?: string;
    is_domain_related?: boolean; // More general name
    domain_confidence?: number;
    error?: string; // For error responses
    message?: string; // For Node.js proxy error message
}

// Function to call the Python main.py /analyze endpoint
export const analyzeTextWithPythonBackend = async (
    request: AnalysisRequest
): Promise<AnalysisResponse> => {
    try {
        const res = await apiFetch('/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });

        if (!res.ok) {
            const errorData = await res.json();
            return { error: errorData.detail || 'Python analysis failed', summary: '', roadmap: '' };
        }
        return res.json();
    } catch (error) {
        console.error('Error analyzing text with Python backend:', error);
        return { error: 'Network or unexpected error with Python backend', summary: '', roadmap: '' };
    }
};

// Function to call the Node.js main-router /api/chat endpoint (which proxies to Python domain models)
// This endpoint expects a chat-like message structure but triggers analysis
export const analyzeTextWithNodeBackendChatProxy = async (
    text: string,
    domain: string,
    context: { subject?: string; level?: string; format?: string; }
): Promise<AnalysisResponse> => {
    // The Node.js proxy expects a 'messages' array, even if it's for analysis.
    // We construct a single user message here.
    const chatRequest: ChatRequestForNodeBackend = {
        messages: [{
            role: 'user',
            parts: [{ text: text }],
        }],
        tutor_id: domain.toLowerCase().replace(/ /g, '_').replace(/&/g, 'and'), // Convert to a format Node.js backend expects for tutor_id/domain
    };

    try {
        const NODE_BACKEND_PORT = 8020; // As identified from main-router.mjs
        const res = await fetch(`http://localhost:${NODE_BACKEND_PORT}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(chatRequest),
        });

        if (!res.ok) {
            const errorData = await res.json();
            // Node.js proxy might return specific error structures
            return {
                error: errorData.error || errorData.message || 'Node.js proxy analysis failed',
                message: errorData.message,
                summary: '',
                roadmap: '',
                domain_confidence: errorData.confidence // Node.js proxy returns confidence on domain mismatch
            };
        }
        return res.json();
    } catch (error) {
        console.error('Error analyzing text with Node.js backend chat proxy:', error);
        return { error: 'Network or unexpected error with Node.js backend chat proxy', summary: '', roadmap: '' };
    }
};

// Function to get available analysis domains/tutors (from Python backend)
// This will be useful for a dropdown in the UI
export const getAvailableAnalysisDomains = async (): Promise<Array<{ id: string; display_name: string; }>> => {
    try {
        // We can reuse the getTutors from localLlamaService.ts, as it gets from main.py
        // Or create a new endpoint in main.py for just analysis domains if they differ.
        // For now, let's assume getTutors also covers analysis domains, if their IDs match.
        const res = await apiFetch('/api/tutors'); // Assuming main.py /api/tutors lists all available domain IDs
        if (!res.ok) {
            throw new Error('Failed to fetch available analysis domains from Python backend');
        }
        const tutors = await res.json();
        // Filter out those that are purely chat tutors if necessary, or just return all for choice
        return tutors.map((tutor: any) => ({ id: tutor.id, display_name: tutor.display_name }));
    } catch (error) {
        console.error('Error fetching available analysis domains:', error);
        return [];
    }
};
