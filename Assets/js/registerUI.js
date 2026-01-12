import AuthService from "./services/authService.js";
import { Toast } from "./utils/toast.js";

document.addEventListener("DOMContentLoaded", () => {
    setupPasswordToggles();
    setupRegisterForm();
    setupOtpVerification();
});

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

let registerPayload = {};
let timerInterval;

function setupRegisterForm() {
    const registerForm = document.getElementById("registerForm");
    const otpSection = document.getElementById("otpSection");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const submitBtn = registerForm.querySelector("button[type='submit']");
            const originalBtnText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerText = "Processing...";

            const formData = new FormData(registerForm);
            registerPayload = Object.fromEntries(formData.entries());

            const response = await AuthService.register(formData);

            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;

            const isSuccess = response.success === true || response.status === 'success';

            if (isSuccess) {
                Toast.success(response.message || "OTP sent to your email!");
                registerForm.classList.add("hidden");
                otpSection.classList.remove("hidden");
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

            const isSuccess = response.success === true || response.status === 'success';

            if (isSuccess) {
                Toast.success("Account created successfully 🎉");
                setTimeout(() => location.href = "./my-account.html", 2000);
            } else {
                Toast.error(response.message || "Invalid OTP");
            }
        });
    }

    if (resendOtpBtn) {
        resendOtpBtn.addEventListener("click", async () => {
            resendOtpBtn.innerText = "Resending...";
            resendOtpBtn.disabled = true;

            const resendData = new FormData();
            resendData.append("email", registerPayload.email);
            resendData.append("name", registerPayload.name);
            resendData.append("purpose", "signup");

            const response = await AuthService.resendOTP(resendData);

            resendOtpBtn.innerText = "Resend OTP";
            resendOtpBtn.disabled = false;

            if (response.success || response.status === 'success') {
                Toast.success("OTP resent successfully. Check your email.");
                startOtpTimer();
            } else {
                Toast.error(response.message || "Failed to resend OTP");
            }
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
