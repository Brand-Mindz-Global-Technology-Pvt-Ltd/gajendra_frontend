import CONFIG from "./config.js";
import AuthService from "./services/authService.js";
import { Toast } from "./utils/toast.js";

document.addEventListener("DOMContentLoaded", () => {
    setupPasswordToggles();
    setupLoginForm();
    setupForgotPassword();
    setupCapsLock();
    setupRealTimeValidation();
    loadRememberedUser();
    setupGoogleSSO();
});

/**
 * CAPS LOCK DETECTION
 */
function setupCapsLock() {
    const passwordInput = document.getElementById("passwordInput");
    const capsWarning = document.getElementById("capsWarning");

    if (passwordInput && capsWarning) {
        passwordInput.addEventListener("keyup", (e) => {
            if (e.getModifierState("CapsLock")) {
                capsWarning.style.display = "block";
            } else {
                capsWarning.style.display = "none";
            }
        });

        passwordInput.addEventListener("keydown", (e) => {
            if (e.getModifierState("CapsLock")) {
                capsWarning.style.display = "block";
            } else {
                capsWarning.style.display = "none";
            }
        });
    }
}

/**
 * REAL-TIME VALIDATION
 */
function setupRealTimeValidation() {
    const emailInput = document.querySelector("#loginForm input[name='email']");
    if (emailInput) {
        emailInput.addEventListener("input", function () {
            const email = this.value;
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            if (email.length > 0 && !isValid) {
                this.classList.add("border-red-500");
                this.classList.remove("focus:ring-brownDark");
                this.classList.add("focus:ring-red-500");
            } else {
                this.classList.remove("border-red-500");
                this.classList.remove("focus:ring-red-500");
                this.classList.add("focus:ring-brownDark");
            }
        });
    }
}

/**
 * REMEMBER ME LOGIC
 */
function loadRememberedUser() {
    const rememberedEmail = localStorage.getItem("gajendra_remember_email");
    if (rememberedEmail) {
        const emailInput = document.querySelector("#loginForm input[name='email']");
        const rememberCheckbox = document.querySelector("#loginForm input[type='checkbox']");
        if (emailInput) emailInput.value = rememberedEmail;
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }
}

function handleRememberMe(email, isChecked) {
    if (isChecked) {
        localStorage.setItem("gajendra_remember_email", email);
    } else {
        localStorage.removeItem("gajendra_remember_email");
    }
}

function setupPasswordToggles() {
    const toggleIcons = document.querySelectorAll(".fa-eye, .fa-eye-slash");
    toggleIcons.forEach(icon => {
        icon.addEventListener("click", function () {
            const input = this.previousElementSibling;
            if (!input) return;
            if (input.type === "password") {
                input.type = "text";
                this.classList.remove("fa-eye");
                this.classList.add("fa-eye-slash");
            } else {
                input.type = "password";
                this.classList.remove("fa-eye-slash");
                this.classList.add("fa-eye");
            }
        });
    });
}

function setupLoginForm() {
    const loginForm = document.getElementById("loginForm");
    const errorContainer = document.getElementById("loginErrorMessage");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = loginForm.querySelector("button[type='submit']");
            const originalBtnText = submitBtn.innerText;

            errorContainer.classList.add("hidden");
            submitBtn.disabled = true;
            submitBtn.innerText = "Logging in...";

            const formData = new FormData(loginForm);
            const email = formData.get("email");
            const rememberMe = loginForm.querySelector("input[type='checkbox']").checked;

            const response = await AuthService.login(formData);

            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;

            const isSuccess = response.success === true || response.status === 'success';

            if (isSuccess) {
                handleRememberMe(email, rememberMe);
                Toast.success("Login successful!");
                setTimeout(() => window.location.href = "./my-account.html", 1000);
            } else {
                errorContainer.innerText = response.message || "Invalid email or password";
                errorContainer.classList.remove("hidden");
                Toast.error(response.message || "Login failed");
                // Note: Form is NOT reset here, preserving typed values
            }
        });
    }
}

/**
 * GOOGLE SSO INITIALIZATION
 */
function setupGoogleSSO() {
    if (typeof google === "undefined") {
        console.warn("Google SDK not loaded yet, retrying...");
        setTimeout(setupGoogleSSO, 1000);
        return;
    }

    google.accounts.id.initialize({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse
    });

    google.accounts.id.renderButton(
        document.getElementById("googleButton"),
        { theme: "outline", size: "large", width: "100%", text: "signin_with" }
    );
}

async function handleGoogleResponse(response) {
    if (response.credential) {
        Toast.success("Google account verified! Logging in...");
        const result = await AuthService.ssoLogin("google", response.credential);

        if (result.success || result.status === 'success') {
            Toast.success("Login successful!");
            setTimeout(() => window.location.href = "./my-account.html", 1000);
        } else {
            // If account doesn't exist, redirect to register with data
            if (result.message && result.message.includes("Account not found")) {
                Toast.info("Account not found. Redirecting to complete registration...");
                // Store token temporarily to fetch details on register page
                sessionStorage.setItem("google_sso_token", response.credential);
                setTimeout(() => window.location.href = "./register.html", 1500);
            } else {
                Toast.error(result.message || "SSO Login failed");
            }
        }
    }
}

function setupForgotPassword() {
    // ... (rest of the code remains the same)
    const allLinks = document.querySelectorAll("a");
    let forgotPasswordBtn = null;
    allLinks.forEach(link => {
        if (link.innerText.includes("Forgot Password")) {
            forgotPasswordBtn = link;
        }
    });

    const forgotModal = document.getElementById("forgotPasswordModal");
    const closeForgotModal = document.getElementById("closeForgotModal");
    const step1 = document.getElementById("forgotStep1");
    const step2 = document.getElementById("forgotStep2");
    const step3 = document.getElementById("forgotStep3");

    const forgotEmailForm = document.getElementById("forgotEmailForm");
    const forgotOtpForm = document.getElementById("forgotOtpForm");
    const resetPasswordForm = document.getElementById("resetPasswordForm");

    let recoveryEmail = "";

    // Open Modal
    if (forgotPasswordBtn && forgotModal) {
        forgotPasswordBtn.addEventListener("click", (e) => {
            e.preventDefault();
            forgotModal.classList.remove("hidden");
            step1.classList.remove("hidden");
            step2.classList.add("hidden");
            step3.classList.add("hidden");

            const loginEmailInput = document.querySelector("#loginForm input[name='email']");
            const forgotEmailInput = forgotEmailForm.querySelector("input[name='email']");

            if (loginEmailInput && loginEmailInput.value && forgotEmailInput) {
                forgotEmailInput.value = loginEmailInput.value;
            }
        });
    }

    // Close Modal
    if (closeForgotModal) {
        closeForgotModal.addEventListener("click", () => {
            forgotModal.classList.add("hidden");
        });
    }

    // STEP 1: Send OTP
    if (forgotEmailForm) {
        forgotEmailForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = forgotEmailForm.querySelector("button");
            btn.disabled = true;
            btn.innerText = "Sending...";

            const email = forgotEmailForm.querySelector("input[name='email']").value;
            const response = await AuthService.forgotPassword(email);

            btn.disabled = false;
            btn.innerText = "Send OTP";

            if (response.success || response.status === 'success') {
                recoveryEmail = email;
                document.getElementById("recoveryEmail").innerText = email;
                Toast.success("OTP sent to your email!");
                step1.classList.add("hidden");
                step2.classList.remove("hidden");
            } else {
                Toast.error(response.message || "Failed to send OTP");
            }
        });
    }

    // STEP 2: Verify OTP
    if (forgotOtpForm) {
        forgotOtpForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = forgotOtpForm.querySelector("button");
            btn.disabled = true;
            btn.innerText = "Verifying...";

            const otp = forgotOtpForm.querySelector("input[name='otp']").value;
            const response = await AuthService.verifyForgotPasswordOTP(recoveryEmail, otp);

            btn.disabled = false;
            btn.innerText = "Verify OTP";

            if (response.success || response.status === 'success') {
                Toast.success("OTP verified!");
                step2.classList.add("hidden");
                step3.classList.remove("hidden");
            } else {
                Toast.error(response.message || "Invalid OTP");
            }
        });
    }

    // STEP 3: Reset Password
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = resetPasswordForm.querySelector("button");
            const p1 = resetPasswordForm.querySelector("input[name='new_password']").value;
            const p2 = resetPasswordForm.querySelector("input[name='confirm_password']").value;

            if (p1 !== p2) {
                Toast.error("Passwords do not match!");
                return;
            }

            btn.disabled = true;
            btn.innerText = "Resetting...";

            const response = await AuthService.resetPassword(recoveryEmail, p1);

            btn.disabled = false;
            btn.innerText = "Reset Password";

            if (response.success || response.status === 'success') {
                Toast.success("Password reset successful! Please login.");
                forgotModal.classList.add("hidden");
                forgotEmailForm.reset();
                forgotOtpForm.reset();
                resetPasswordForm.reset();
            } else {
                Toast.error(response.message || "Failed to reset password");
            }
        });
    }
}
