import { type Course } from '../types';
import { auth } from '../firebase'; // Still need auth for currentUser, or use localStorage user
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp, orderBy, limit, startAfter } from 'firebase/firestore';

const API_URL = 'http://localhost:5000/api/courses';

// Get all courses for the current user
// Get all courses for the current user
export const getCourses = async (lastVisibleId: string | null = null, limitVal: number = 10): Promise<{ courses: Course[], lastVisibleDocId: string | null }> => {
    // We can get userId from the auth object or localStorage
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    if (!user || (!user.uid && !user.id)) {
        console.warn("No user logged in, cannot fetch courses.");
        return { courses: [], lastVisibleDocId: null };
    }
    const userId = user.uid || user.id;

    try {
        const response = await fetch(`${API_URL}?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        // Backend currently returns { courses: [...] }
        return { courses: data.courses || [], lastVisibleDocId: null };
    } catch (error) {
        console.error("Error fetching courses:", error);
        return { courses: [], lastVisibleDocId: null };
    }
};

// Add a new course for the current user
export const addCourse = async (name: string): Promise<Course | null> => {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    if (!user || (!user.uid && !user.id)) {
        console.error("No user logged in, cannot add course.");
        return null;
    }
    const userId = user.uid || user.id;

    if (!name || name.trim() === '') {
        console.error("Course name cannot be empty.");
        return null;
    }

    // Generate a random color
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, name, color }),
        });

        if (!response.ok) throw new Error('Failed to add course');
        return await response.json();
    } catch (error) {
        console.error("Error adding course:", error);
        throw error; // Re-throw error so UI can handle it
    }
};

export const deleteCourse = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete course');
    } catch (error) {
        console.error("Error deleting course:", error);
        throw error;
    }
};

// --- Unused/Legacy helpers kept to prevent import errors if any ---
export const getCourse = async (id: string): Promise<Course | null> => {
    return null;
};
