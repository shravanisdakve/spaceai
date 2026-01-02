import { type Course } from '../types';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp, orderBy, limit, startAfter } from 'firebase/firestore';

// Helper to generate a color for a new course
const generateColor = (existingColors: string[] = []): string => {
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    const availableColors = colors.filter(c => !existingColors.includes(c));
    return availableColors.length > 0 ? availableColors[Math.floor(Math.random() * colors.length)] : colors[Math.floor(Math.random() * colors.length)];
}

// Get all courses for the current user with pagination
export const getCourses = async (lastVisibleDocId: string | null = null, limitCount: number = 10): Promise<{ courses: Course[], lastVisibleDocId: string | null }> => {
    const user = auth.currentUser;
    if (!user) {
        console.warn("No user logged in, cannot fetch courses.");
        return { courses: [], lastVisibleDocId: null };
    }
    console.log(`Fetching courses for user ${user.uid} (limit: ${limitCount}, startAfter: ${lastVisibleDocId})...`);
    try {
        const coursesRef = collection(db, "courses");
        let q = query(coursesRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(limitCount));

        if (lastVisibleDocId) {
            const lastDocSnapshot = await getDocs(query(coursesRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"), where(doc.id, '==', lastVisibleDocId), limit(1)));
            if (!lastDocSnapshot.empty) {
                q = query(coursesRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"), startAfter(lastDocSnapshot.docs[0]), limit(limitCount));
            }
        }
        
        const querySnapshot = await getDocs(q);
        const courses = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Course));

        const newLastVisibleDocId = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1].id : null;

        console.log(`Fetched ${courses.length} courses. Next cursor: ${newLastVisibleDocId}`);
        return { courses, lastVisibleDocId: newLastVisibleDocId };
    } catch (error) {
        console.error("Error fetching courses from Firestore:", error);
        throw error;
    }
};

// Get a single course by its ID
export const getCourse = async (id: string): Promise<Course | null> => {
    // This function might still be useful, but it needs to be implemented with Firestore if needed.
    // For now, it's not strictly necessary for the MyCourses component.
    console.warn("getCourse function is not implemented for Firestore yet.");
    return null; 
};

// Add a new course for the current user
export const addCourse = async (name: string): Promise<Course | null> => {
    const user = auth.currentUser;
    if (!user) {
        console.error("No user logged in, cannot add course.");
        return null;
    }

    if (!name || name.trim() === '') {
        console.error("Course name cannot be empty.");
        return null;
    }

    console.log(`Adding course "${name}" for user ${user.uid}...`);

    try {
        // Fetch existing colors to try and assign a unique one
        const currentCourses = await getCourses();
        const existingColors = currentCourses.map(c => c.color);

        const newCourseData = {
            userId: user.uid,
            name: name.trim(),
            color: generateColor(existingColors),
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, "courses"), newCourseData);
        console.log("Course added with ID: ", docRef.id);
        
        // Return the full course object including the new ID
        return {
            id: docRef.id,
            name: newCourseData.name,
            color: newCourseData.color,
        };
    } catch (error) {
        console.error("Error adding course to Firestore:", error);
        throw error;
    }
};

// Delete a course by its ID
export const deleteCourse = async (id: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
        console.error("No user logged in, cannot delete course.");
        return;
    }
    console.log(`Deleting course ${id} for user ${user.uid}...`);
    try {
        const courseDocRef = doc(db, "courses", id);
        // Optional: You might want to add a security check to ensure the user owns this course
        // This is better handled with Firestore security rules, but can be checked here as well.
        await deleteDoc(courseDocRef);
        console.log(`Course ${id} deleted successfully.`);
    } catch (error) {
        console.error("Error deleting course from Firestore:", error);
        throw error;
    }
};
