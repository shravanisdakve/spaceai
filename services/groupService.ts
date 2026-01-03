import { db, auth } from '../firebase';
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    serverTimestamp,
    getDoc,
    arrayUnion,
    arrayRemove,
    orderBy,
    limit,
    increment
} from 'firebase/firestore';

export interface StudyGroup {
    id: string;
    name: string;
    description: string;
    tags: string[];
    isPrivate: boolean;
    createdBy: string;
    memberCount: number;
    members: string[]; // Array of UIDs for permission checks
    createdAt: any;
    bannerUrl?: string; // Optional nice UI touch
}

export const createGroup = async (name: string, description: string, tags: string[], isPrivate: boolean): Promise<string> => {
    const user = auth.currentUser;
    if (!user) throw new Error("Must be logged in");

    const groupData = {
        name,
        description,
        tags,
        isPrivate,
        createdBy: user.uid,
        memberCount: 1,
        members: [user.uid],
        createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'groups'), groupData);
    return docRef.id;
};

export const getPublicGroups = async (): Promise<StudyGroup[]> => {
    // Basic query for public groups, ordered by creation (newest first)
    // In real app, we might check 'isPrivate' == false
    const q = query(
        collection(db, 'groups'),
        where('isPrivate', '==', false),
        orderBy('createdAt', 'desc'),
        limit(20)
    );

    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as StudyGroup));
};

export const getUserGroups = async (): Promise<StudyGroup[]> => {
    const user = auth.currentUser;
    if (!user) return [];

    // 'array-contains' is efficiently indexed in Firestore
    const q = query(
        collection(db, 'groups'),
        where('members', 'array-contains', user.uid)
    );

    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as StudyGroup));
};

export const joinGroup = async (groupId: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Must be logged in");

    const groupRef = doc(db, 'groups', groupId);

    await updateDoc(groupRef, {
        members: arrayUnion(user.uid),
        memberCount: increment(1)
    });
};

export const leaveGroup = async (groupId: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Must be logged in");

    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
        members: arrayRemove(user.uid),
        memberCount: increment(-1)
    });
};
