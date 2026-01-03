const API_URL = 'http://localhost:5000/api/courses';
const TEST_USER_ID = 'test-user-verification-123';

async function verifyCoursesFlow() {
    console.log("1. Creating a new course...");
    let courseId;
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: TEST_USER_ID, name: 'Physics 101', color: '#10b981' })
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Create failed');
        }
        const course = await res.json();
        courseId = course.id;
        console.log(`✅ Course created: ${course.name} (${courseId})`);
    } catch (e) {
        console.error("❌ Create course failed:", e.message);
        return;
    }

    console.log("2. Fetching courses...");
    try {
        const res = await fetch(`${API_URL}?userId=${TEST_USER_ID}`);
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        const found = data.courses.find(c => c.id === courseId);

        if (found) {
            console.log("✅ Course found in list");
        } else {
            console.error("❌ Course NOT found in list");
        }
    } catch (e) {
        console.error("❌ Fetch courses failed:", e.message);
    }

    console.log("3. Deleting course...");
    try {
        const res = await fetch(`${API_URL}/${courseId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Delete failed');
        console.log("✅ Course deleted");
    } catch (e) {
        console.error("❌ Delete course failed:", e.message);
    }

    console.log("4. Verifying deletion...");
    try {
        const res = await fetch(`${API_URL}?userId=${TEST_USER_ID}`);
        const data = await res.json();
        const found = data.courses.find(c => c.id === courseId);
        if (!found) {
            console.log("✅ Course correctly removed from list");
        } else {
            console.error("❌ Course still exists in list");
        }
    } catch (e) {
        console.error("❌ Verify deletion failed:", e.message);
    }
}

verifyCoursesFlow();
