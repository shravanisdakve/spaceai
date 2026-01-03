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
    setDoc,
    deleteDoc,
    limit
} from 'firebase/firestore';
import { User } from '../hooks/useAuth';

export interface FriendRequest {
    id: string;
    fromUserId: string;
    toUserId: string;
    status: 'pending' | 'accepted' | 'rejected';
    timestamp: any;
    fromUser?: Partial<User>; // Hydrated data for UI
}

export interface FriendProfile {
    uid: string;
    displayName: string;
    avatar?: string;
    level?: number; // For social leaderboards
    status?: 'online' | 'offline' | 'studying';
}

// --- Search Users ---
export const searchUsers = async (searchTerm: string): Promise<Partial<User>[]> => {
    // Note: Firestore doesn't support full-text search natively. 
    // We'll implementing a simple prefix search or use a third-party like Algolia in production.
    // For this MVP, we'll fetch a limited set and filter client-side or use exact email match.

    if (!searchTerm) return [];

    // exact email search
    const emailQuery = query(collection(db, 'users'), where('email', '==', searchTerm));
    const emailSnap = await getDocs(emailQuery);

    if (!emailSnap.empty) {
        return emailSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Partial<User>));
    }

    // If not email, try displayName (this is expensive/limited in Firestore without Algolia)
    // We will just do a "getAll" limit 20 and filter for MVP demo purposes if searchTerm needs it
    // Or simpler: Just warn user to search by exact email for now.
    return [];
};

// --- Friend Requests ---

export const sendFriendRequest = async (toUserId: string) => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId || !toUserId) throw new Error("Invalid User IDs");
    if (currentUserId === toUserId) throw new Error("Cannot add yourself");

    // Check if request already exists
    const q = query(
        collection(db, 'friend_requests'),
        where('fromUserId', '==', currentUserId),
        where('toUserId', '==', toUserId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
        const existing = snap.docs[0].data();
        if (existing.status === 'pending') throw new Error("Request already pending");
        if (existing.status === 'accepted') throw new Error("Already friends");
    }

    await addDoc(collection(db, 'friend_requests'), {
        fromUserId: currentUserId,
        toUserId,
        status: 'pending',
        timestamp: serverTimestamp()
    });
};

export const getIncomingFriendRequests = async (): Promise<FriendRequest[]> => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return [];

    const q = query(
        collection(db, 'friend_requests'),
        where('toUserId', '==', currentUserId),
        where('status', '==', 'pending')
    );

    const snap = await getDocs(q);
    const requests: FriendRequest[] = [];

    // Hydrate with user data
    for (const d of snap.docs) {
        const reqData = d.data() as Omit<FriendRequest, 'id'>;
        const userDoc = await getDoc(doc(db, 'users', reqData.fromUserId));
        const userData = userDoc.exists() ? userDoc.data() : { displayName: 'Unknown User' };

        requests.push({
            id: d.id,
            ...reqData,
            fromUser: { uid: reqData.fromUserId, ...userData } // minimal user info
        });
    }

    return requests;
};

export const respondToFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    const reqRef = doc(db, 'friend_requests', requestId);
    const reqSnap = await getDoc(reqRef);

    if (!reqSnap.exists()) throw new Error("Request not found");
    const reqData = reqSnap.data();

    if (reqData.toUserId !== currentUserId) throw new Error("Unauthorized");

    if (action === 'accept') {
        const otherUserId = reqData.fromUserId;

        // 1. Update request status
        await updateDoc(reqRef, { status: 'accepted' });

        // 2. Add to both users' friend subcollections
        const myFriendRef = doc(db, `users/${currentUserId}/friends/${otherUserId}`);
        const theirFriendRef = doc(db, `users/${otherUserId}/friends/${currentUserId}`);

        // We'll just store basic info, assuming we fetch details fresh or rely on IDs
        await setDoc(myFriendRef, { since: serverTimestamp() });
        await setDoc(theirFriendRef, { since: serverTimestamp() });

    } else {
        await deleteDoc(reqRef); // Or set to rejected
    }
};

// --- Friends List ---

export const getFriends = async (): Promise<FriendProfile[]> => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return [];

    const friendsSnap = await getDocs(collection(db, `users/${currentUserId}/friends`));
    const friends: FriendProfile[] = [];

    for (const d of friendsSnap.docs) {
        const friendId = d.id;
        // Fetch fresh profile data
        const userDoc = await getDoc(doc(db, 'users', friendId));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            friends.push({
                uid: friendId,
                displayName: userData.displayName || 'Unknown',
                avatar: userData.avatar,
                level: 1, // Placeholder, would fetch from gamification
                status: 'offline' // Placeholder for online presence
            });
        }
    }
    return friends;
};
