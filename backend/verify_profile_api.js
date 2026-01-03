const API_URL = 'http://localhost:5000/api/auth';
const TEST_USER = {
    email: `test_profile_${Date.now()}@example.com`,
    password: 'Password123!',
    displayName: 'Test User Profile',
    university: 'Test University'
};

const UPDATES = {
    firstName: 'Updated',
    lastName: 'User',
    bio: 'This is a test bio.',
    university: 'Updated University',
    preferences: {
        theme: 'light',
        studyLanguage: 'Spanish'
    }
};

async function verifyProfileFlow() {
    console.log("1. Registering new user...");
    try {
        const res = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_USER)
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Signup failed');
        }
        console.log("✅ Signup successful");
    } catch (e) {
        console.error("❌ Signup failed:", e.message);
        return;
    }

    console.log("2. Logging in...");
    let token;
    let userId;
    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_USER.email,
                password: TEST_USER.password
            })
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Login failed');
        }

        const data = await res.json();
        token = data.token;
        userId = data.user._id;
        console.log("✅ Login successful");

        if (data.user.displayName !== TEST_USER.displayName) {
            console.error("❌ Display Name mismatch on login");
        } else {
            console.log("✅ Display Name verified on login");
        }
    } catch (e) {
        console.error("❌ Login failed:", e.message);
        return;
    }

    console.log("3. Updating Profile...");
    try {
        const res = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(UPDATES)
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Update failed');
        }

        const data = await res.json();
        console.log("✅ Profile update request successful");

        const updatedUser = data.user;
        if (updatedUser.firstName === UPDATES.firstName && updatedUser.preferences.theme === 'light') {
            console.log("✅ API returned updated fields correctly");
        } else {
            console.error("❌ API did not return updated fields correctly", updatedUser);
        }

    } catch (e) {
        console.error("❌ Profile update failed:", e.message);
    }
}

verifyProfileFlow();
