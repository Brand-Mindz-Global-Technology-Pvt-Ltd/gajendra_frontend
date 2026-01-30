import CONFIG from "./config.js";
import AuthService from "./services/authService.js";
import { Toast } from "./utils/toast.js";

document.addEventListener("DOMContentLoaded", () => {
    setupPasswordToggles();
    setupRegisterForm();
    setupOtpVerification();
    setupPasswordChecklist();
    setupConfirmPasswordMatch();
    setupEmailAvailabilityCheck();
    setupGoogleSSO();
    checkPendingSSO();
});

function parseGoogleToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Token parse error:", e);
        return null;
    }
}

function setupGoogleSSO() {
    if (typeof google === "undefined") {
        setTimeout(setupGoogleSSO, 1000);
        return;
    }

    google.accounts.id.initialize({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse
    });

    google.accounts.id.renderButton(
        document.getElementById("googleButton"),
        { theme: "outline", size: "large", width: "100%", text: "signup_with" }
    );
}

function handleGoogleResponse(response) {
    if (response.credential) {
        fillRegisterFormWithGoogle(response.credential);
    }
}

function checkPendingSSO() {
    const pendingToken = sessionStorage.getItem("google_sso_token");
    if (pendingToken) {
        sessionStorage.removeItem("google_sso_token");
        fillRegisterFormWithGoogle(pendingToken);
    }
}

function fillRegisterFormWithGoogle(token) {
    const userData = parseGoogleToken(token);
    if (!userData) return;

    const nameInput = document.querySelector("input[name='name']");
    const emailInput = document.getElementById("registerEmail");

    if (nameInput) nameInput.value = userData.name || "";
    if (emailInput) {
        emailInput.value = userData.email || "";
        // Trigger availability check
        emailInput.dispatchEvent(new Event("blur"));
    }

    Toast.success("Details pre-filled from Google! Please complete the rest of the form.");
}

function setupPasswordToggles() {
    const toggleIcons = document.querySelectorAll(".fa-eye, .fa-eye-slash");
    toggleIcons.forEach(icon => {
        icon.addEventListener("click", function () {
            const input = this.parentElement.querySelector("input");
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

/**
 * PASSWORD CHECKLIST LOGIC
 */
function setupPasswordChecklist() {
    const passwordInput = document.getElementById("registerPassword");
    const requirements = document.querySelectorAll(".requirement-item");

    if (passwordInput) {
        passwordInput.addEventListener("input", function () {
            const val = this.value;

            const rules = {
                length: val.length >= 8,
                uppercase: /[A-Z]/.test(val),
                number: /[0-9]/.test(val),
                special: /[@$!%*#?&]/.test(val)
            };

            requirements.forEach(item => {
                const rule = item.dataset.rule;
                if (rules[rule]) {
                    item.classList.add("valid");
                    item.querySelector("i").classList.replace("fa-circle", "fa-circle-check");
                } else {
                    item.classList.remove("valid");
                    item.querySelector("i").classList.replace("fa-circle-check", "fa-circle");
                }
            });
        });
    }
}

/**
 * CONFIRM PASSWORD MATCH
 */
function setupConfirmPasswordMatch() {
    const p1 = document.getElementById("registerPassword");
    const p2 = document.getElementById("confirmPassword");
    const msg = document.getElementById("passwordMatchMsg");

    if (p1 && p2 && msg) {
        p2.addEventListener("input", () => {
            if (p2.value === "") {
                msg.classList.add("hidden");
                return;
            }
            if (p1.value === p2.value) {
                msg.innerText = "✓ Passwords match";
                msg.className = "text-green-600 text-[10px] mt-1 font-medium";
                msg.classList.remove("hidden");
            } else {
                msg.innerText = "× Passwords do not match";
                msg.className = "text-red-600 text-[10px] mt-1 font-medium";
                msg.classList.remove("hidden");
            }
        });
    }
}

/**
 * EMAIL AVAILABILITY CHECK (DEBOUNCED)
 */
function setupEmailAvailabilityCheck() {
    const emailInput = document.getElementById("registerEmail");
    const msg = document.getElementById("emailAvailabilityMsg");
    let timeout = null;

    if (emailInput && msg) {
        emailInput.addEventListener("blur", async function () {
            const email = this.value.trim();
            if (email.length < 5 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

            msg.innerText = "Checking availability...";
            msg.className = "text-gray-500 text-[10px] mt-1 font-medium";
            msg.classList.remove("hidden");

            const response = await AuthService.checkEmailAvailability(email);
            if (response.available) {
                msg.innerText = "✓ Email is available";
                msg.className = "text-green-600 text-[10px] mt-1 font-medium";
            } else {
                msg.innerText = "× Email is already registered";
                msg.className = "text-red-600 text-[10px] mt-1 font-medium";
            }
        });
    }
}

let registerPayload = {};
let timerInterval;

function setupRegisterForm() {
    const registerForm = document.getElementById("registerForm");
    const otpSection = document.getElementById("otpSection");
    const displayEmail = document.getElementById("displayEmail");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Validate requirements first
            const val = document.getElementById("registerPassword").value;
            const isValid = val.length >= 8 && /[A-Z]/.test(val) && /[0-9]/.test(val) && /[@$!%*#?&]/.test(val);
            if (!isValid) {
                Toast.error("Please meet all password requirements");
                return;
            }

            const p1 = document.getElementById("registerPassword").value;
            const p2 = document.getElementById("confirmPassword").value;
            if (p1 !== p2) {
                Toast.error("Passwords do not match");
                return;
            }

            const submitBtn = registerForm.querySelector("button[type='submit']");
            const originalBtnText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerText = "Sending OTP...";

            const formData = new FormData(registerForm);
            registerPayload = Object.fromEntries(formData.entries());

            const response = await AuthService.register(formData);

            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;

            if (response.success || response.status === 'success') {
                Toast.success(response.message || "Code sent to your email!");
                registerForm.classList.add("hidden");
                otpSection.classList.remove("hidden");
                if (displayEmail) displayEmail.innerText = registerPayload.email;
                startOtpTimer();
            } else {
                Toast.error(response.message || "Registration failed");
            }
        });
    }
}

function setupOtpVerification() {
    const verifyOtpBtn = document.getElementById("verifyOtpBtn");
    const resendOtpBtn = document.getElementById("resendOtpBtn");
    const otpSection = document.getElementById("otpSection");
    const successState = document.getElementById("registerSuccessState");

    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener("click", async () => {
            const otpInput = document.getElementById("otpInput");
            const otp = otpInput.value.trim();

            if (otp.length !== 6) {
                Toast.error("Enter valid 6-digit OTP");
                return;
            }

            verifyOtpBtn.disabled = true;
            verifyOtpBtn.innerText = "Verifying...";

            const verificationData = new FormData();
            Object.keys(registerPayload).forEach(key => {
                verificationData.append(key, registerPayload[key]);
            });
            verificationData.append("otp", otp);

            const response = await AuthService.verifyOTP(verificationData);

            verifyOtpBtn.disabled = false;
            verifyOtpBtn.innerText = "Verify OTP";

            if (response.success || response.status === 'success') {
                otpSection.classList.add("hidden");
                successState.classList.remove("hidden");
                Toast.success("Success! Redirecting...");
                setTimeout(() => location.href = "./login.html", 3000);
            } else {
                Toast.error(response.message || "Invalid or expired code");
            }
        });
    }

    if (resendOtpBtn) {
        resendOtpBtn.addEventListener("click", async () => {
            resendOtpBtn.innerText = "Sending...";
            resendOtpBtn.disabled = true;

            const resendData = new FormData();
            resendData.append("email", registerPayload.email);
            resendData.append("name", registerPayload.name);
            resendData.append("purpose", "signup");

            const response = await AuthService.resendOTP(resendData);

            resendOtpBtn.innerText = "Resend Code";
            resendOtpBtn.disabled = false;

            if (response.success || response.status === 'success') {
                Toast.success("New OTP sent. Check your inbox.");
                startOtpTimer();
            } else {
                Toast.error(response.message || "Failed to resend");
            }
        });
    }

    const editDetailsBtn = document.getElementById("editDetailsBtn");
    if (editDetailsBtn) {
        editDetailsBtn.addEventListener("click", () => {
            const otpSection = document.getElementById("otpSection");
            const registerForm = document.getElementById("registerForm");
            otpSection.classList.add("hidden");
            registerForm.classList.remove("hidden");
            clearInterval(timerInterval);
        });
    }
}

function startOtpTimer() {
    const otpTimerText = document.getElementById("otpTimerText");
    const otpTimerSpan = document.getElementById("otpTimer");
    const resendOtpBtn = document.getElementById("resendOtpBtn");

    if (!otpTimerText || !otpTimerSpan || !resendOtpBtn) return;

    let timeLeft = 60;
    otpTimerSpan.innerText = timeLeft;
    otpTimerText.classList.remove("hidden");
    resendOtpBtn.classList.add("hidden");

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        otpTimerSpan.innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            otpTimerText.classList.add("hidden");
            resendOtpBtn.classList.remove("hidden");
        }
    }, 1000);
}
