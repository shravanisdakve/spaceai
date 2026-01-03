import { type Note, type Flashcard } from '../types';
import { extractTextFromFile, summarizeAudioFromBase64 } from './geminiService';

const API_URL = 'http://localhost:5000/api';

// Helper function to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            if (!result || !result.includes(',')) {
                return reject(new Error("Invalid file data for base64 conversion"));
            }
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

// --- NOTES (MongoDB API) ---

export const getNotes = async (courseId: string): Promise<Note[]> => {
    try {
        const response = await fetch(`${API_URL}/notes/${courseId}`);
        if (!response.ok) throw new Error('Failed to fetch notes');
        return await response.json();
    } catch (error) {
        console.error("Error fetching notes:", error);
        return [];
    }
};

export const addTextNote = async (courseId: string, title: string, content: string): Promise<Note | null> => {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const userId = user ? (user.uid || user.id) : 'anonymous';

    try {
        const response = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                courseId,
                title,
                content,
                type: 'text'
            })
        });
        if (!response.ok) throw new Error('Failed to add note');
        return await response.json();
    } catch (error) {
        console.error("Error adding note:", error);
        return null;
    }
};

export const uploadNoteFile = async (courseId: string, title: string, file: File): Promise<Note | null> => {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const userId = user ? (user.uid || user.id) : 'anonymous';

    let extractedContent = "[Text extraction pending or failed]";

    try {
        const base64Data = await fileToBase64(file);

        if (file.type.startsWith('audio/')) {
            console.log(`Summarizing audio file ${file.name}...`);
            extractedContent = await summarizeAudioFromBase64(base64Data, file.type);
        } else {
            console.log(`Extracting text from document ${file.name}...`);
            extractedContent = await extractTextFromFile(base64Data, file.type);
        }
    } catch (error) {
        console.error(`Failed to extract text from ${file.name}:`, error);
    }

    try {
        const response = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                courseId,
                title,
                content: extractedContent,
                type: 'file',
                fileName: file.name,
                fileType: file.type,
                fileUrl: URL.createObjectURL(file)
            })
        });

        if (!response.ok) throw new Error('Failed to upload note');
        return await response.json();
    } catch (error) {
        console.error("Error uploading note:", error);
        return null;
    }
};

export const updateNoteContent = async (courseId: string, noteId: string, newContent: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/notes/${noteId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: newContent })
        });
        if (!response.ok) throw new Error('Failed to update note');
    } catch (error) {
        console.error("Error updating note:", error);
        throw error;
    }
};

export const deleteNote = async (courseId: string, note: Note): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/notes/${note.id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete note');
    } catch (error) {
        console.error("Error deleting note:", error);
        throw error;
    }
};

// --- FLASHCARDS (MongoDB API + SRS) ---

export const getFlashcards = async (courseId: string): Promise<Flashcard[]> => {
    try {
        const response = await fetch(`${API_URL}/flashcards/${courseId}`);
        if (!response.ok) throw new Error('Failed to fetch flashcards');
        return await response.json();
    } catch (error) {
        console.error("Error fetching flashcards:", error);
        return [];
    }
};

export const addFlashcards = async (courseId: string, flashcards: Flashcard[]): Promise<void> => {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const userId = user ? (user.uid || user.id) : 'anonymous';

    try {
        // Iterate and add (bulk create would be better but simple loop for now)
        for (const card of flashcards) {
            await fetch(`${API_URL}/flashcards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    courseId,
                    front: card.front,
                    back: card.back
                })
            });
        }
    } catch (error) {
        console.error("Error adding flashcards:", error);
        throw error;
    }
};

export const updateFlashcard = async (courseId: string, flashcardId: string, updates: Partial<Flashcard>): Promise<void> => {
    // Note: Standard update not fully implemented in backend yet, just SRS review.
    // Assuming we might add PUT /api/flashcards/:id later for content edits
    console.warn("Update flashcard content not yet implemented on backend");
    return Promise.resolve();
};

export const deleteFlashcard = async (courseId: string, flashcardId: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/flashcards/${flashcardId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete flashcard');
    } catch (error) {
        console.error("Error deleting flashcard:", error);
        throw error;
    }
};

// NEW: Record a review (SRS)
export const reviewFlashcard = async (flashcardId: string, quality: number): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/flashcards/review/${flashcardId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quality })
        });
        if (!response.ok) throw new Error('Failed to submit review');
    } catch (error) {
        console.error("Error submitting flashcard review:", error);
        throw error;
    }
};
