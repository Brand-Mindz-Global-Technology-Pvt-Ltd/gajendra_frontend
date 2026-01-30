import CONFIG from "../config.js";
import { apiCall } from "../utils/api.js";

const AuthService = {
    async login(formData) {
        const result = await apiCall(`${CONFIG.API_BASE_URL}/login.php`, "POST", formData);
        if ((result.success || result.status === 'success') && result.token) {
            localStorage.setItem("authToken", result.token);
            const uid = result?.data?.id ?? result?.user_id ?? null;
            if (uid) localStorage.setItem("userId", String(uid));
        }
        return result;
    },

    async ssoLogin(provider, idToken) {
        const formData = new FormData();
        formData.append("provider", provider);
        formData.append("id_token", idToken);
        const result = await apiCall(`${CONFIG.API_BASE_URL}/sso_login.php`, "POST", formData);
        if ((result.success || result.status === 'success') && result.token) {
            localStorage.setItem("authToken", result.token);
            const uid = result?.data?.id ?? result?.user_id ?? null;
            if (uid) localStorage.setItem("userId", String(uid));
        }
        return result;
    },

    async register(formData) {
        return await apiCall(`${CONFIG.API_BASE_URL}/register.php`, "POST", formData);
    },

    async verifyOTP(data) {
        const result = await apiCall(`${CONFIG.API_BASE_URL}/verify_otp.php`, "POST", data);
        if ((result.success || result.status === 'success') && result.token) {
            localStorage.setItem("authToken", result.token);
            const uid = result?.data?.id ?? result?.user_id ?? null;
            if (uid) localStorage.setItem("userId", String(uid));
        }
        return result;
    },

    async resendOTP(data) {
        return await apiCall(`${CONFIG.API_BASE_URL}/resend_otp.php`, "POST", data);
    },

    async checkEmailAvailability(email) {
        try {
            const formData = new FormData();
            formData.append("email", email);
            const response = await apiCall(`${CONFIG.API_BASE_URL}/check_email.php`, "POST", formData);
            return { available: response.success };
        } catch (error) {
            console.error("Email check failed:", error);
            return { available: true }; // Fallback to avoid blocking
        }
    },

    async logout() {
        localStorage.removeItem("authToken"); // Clear token on logout
        localStorage.removeItem("userId");
        // Call backend logout if needed (optional for token auth, but good for cleanup)
        return await apiCall(`${CONFIG.API_BASE_URL}/logout.php`, "POST");
    },

    async forgotPassword(email) {
        // Needs to use FormData because backend checks $_POST directly in some places
        const formData = new FormData();
        formData.append('email', email);
        return await apiCall(`${CONFIG.API_BASE_URL}/forgot_password.php`, "POST", formData);
    },

    async verifyForgotPasswordOTP(email, otp) {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('otp', otp);
        return await apiCall(`${CONFIG.API_BASE_URL}/verify_forgot_password_otp.php`, "POST", formData);
    },

    async resetPassword(email, password) {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        return await apiCall(`${CONFIG.API_BASE_URL}/reset_password.php`, "POST", formData);
    },

    async getUserProfile() {
        return await apiCall(`${CONFIG.PROFILE_API_URL}/get_profile.php`, "GET");
    },

    getCurrentUserId() {
        return localStorage.getItem("userId");
    }
};

export default AuthService;
