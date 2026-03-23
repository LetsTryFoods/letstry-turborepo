// services/AuthService.js
// import { API_BASE_URL } from '@env';

const API_BASE_URL = "https://apiv2.letstryfoods.com"
//const API_BASE_URL = "http://192.168.1.14:5000"
const LOGIN_ENDPOINT = "/api/user/login-firebase";
const FULL_URL = `${API_BASE_URL}${LOGIN_ENDPOINT}`;

export const loginWithFirebaseToken = async (idToken) => {
    try {
        const response = await fetch(FULL_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(`Login failed: ${response.status} - ${errorData?.message || 'Unknown error'}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("Error logging in with Firebase token:", error);
        throw error;
    };
};
