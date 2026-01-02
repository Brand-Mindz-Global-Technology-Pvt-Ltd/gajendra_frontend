// Toast notification function
function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toastContainer");
  const toastId = "toast-" + Date.now();

  const bgClass =
    type === "success"
      ? "bg-success"
      : type === "error"
      ? "bg-danger"
      : type === "warning"
      ? "bg-warning"
      : "bg-info";

  const toastHTML = `
    <div id="${toastId}" class="toast ${bgClass} text-white" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header ${bgClass} text-white border-0">
        <strong class="me-auto">
          ${
            type === "success"
              ? "✅ Success"
              : type === "error"
              ? "❌ Error"
              : type === "warning"
              ? "⚠️ Warning"
              : "ℹ️ Info"
          }
        </strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    </div>
  `;

  toastContainer.insertAdjacentHTML("beforeend", toastHTML);

  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, {
    autohide: true,
    delay: type === "error" ? 5000 : 3000,
  });

  toast.show();

  // Remove toast element after it's hidden
  toastElement.addEventListener("hidden.bs.toast", () => {
    toastElement.remove();
  });
}

// Login validation functions
function validateLoginEmail(email) {
  if (!email || email.trim().length === 0) {
    return "Email address is required";
  }
  if (email.length > 100) {
    return "Email address is too long";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address";
  }
  return null;
}

function validateLoginPassword(password) {
  if (!password || password.trim().length === 0) {
    return "Password is required";
  }
  if (password.length > 50) {
    return "Password is too long";
  }
  return null;
}

function showLoginFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorDiv = document.getElementById(fieldId + "-error");

  field.classList.add("is-invalid");
  errorDiv.textContent = message;
}

function clearLoginFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  const errorDiv = document.getElementById(fieldId + "-error");

  field.classList.remove("is-invalid");
  errorDiv.textContent = "";
}

function clearAllLoginErrors() {
  const fields = ["email", "password"];
  fields.forEach((fieldId) => clearLoginFieldError(fieldId));
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const submitBtn = document.getElementById("submitBtn");

  // Real-time validation on input
  const fields = ["email", "password"];
  fields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    field.addEventListener("blur", () => {
      validateLoginField(fieldId);
    });
    field.addEventListener("input", () => {
      clearLoginFieldError(fieldId);
    });
  });

  function validateLoginField(fieldId) {
    const field = document.getElementById(fieldId);
    const value = field.value.trim();
    let error = null;

    switch (fieldId) {
      case "email":
        error = validateLoginEmail(value);
        break;
      case "password":
        error = validateLoginPassword(value);
        break;
    }

    if (error) {
      showLoginFieldError(fieldId, error);
      return false;
    } else {
      clearLoginFieldError(fieldId);
      return true;
    }
  }

  function validateLoginForm() {
    clearAllLoginErrors();
    let isValid = true;

    fields.forEach((fieldId) => {
      if (!validateLoginField(fieldId)) {
        isValid = false;
      }
    });

    return isValid;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateLoginForm()) {
      showToast(
        "❌ Please fix the errors in the form before submitting.",
        "error"
      );
      return;
    }

    // Disable submit button to prevent double submission
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    const formData = new FormData(form);

    try {
      const res = await fetch(
        "https://gajendhrademo.brandmindz.com/routes/auth/admin/login_admin.php",
        
        {
          method: "POST",
          body: formData,
        }
      );

      // Check if response is ok
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Login response:", data);

      if (data.success) {
        // Use session manager to save session with 7-day expiry
        if (
          window.sessionManager &&
          window.sessionManager.saveSession(data.user)
        ) {
          showToast("Login successful! Redirecting...", "success");
          // Redirect after short delay
          setTimeout(() => {
            window.location.replace("index.html");
          }, 1000);
        } else {
          showToast("❌ Failed to save session. Please try again.", "error");
        }
      } else {
        // Handle specific login errors
        if (data.message && data.message.includes("Invalid credentials")) {
          showLoginFieldError("email", "Invalid email or password");
          showLoginFieldError("password", "Invalid email or password");
          showToast("❌ Invalid email or password. Please try again.", "error");
        } else if (data.message && data.message.includes("email")) {
          showLoginFieldError("email", "Email not found");
          showToast("❌ " + data.message, "error");
        } else if (data.message && data.message.includes("password")) {
          showLoginFieldError("password", "Incorrect password");
          showToast("❌ " + data.message, "error");
        } else {
          showToast("❌ " + (data.message || "Login failed"), "error");
        }
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.name === "TypeError" && err.message.includes("fetch")) {
        showToast(
          "❌ Cannot connect to server. Please check your internet connection or try again later.",
          "error"
        );
      } else if (err.message.includes("404")) {
        showToast(
          "❌ Login service not found. Please contact administrator.",
          "error"
        );
      } else if (err.message.includes("500")) {
        showToast("❌ Server error occurred. Please try again later.", "error");
      } else if (err.message.includes("403")) {
        showToast("❌ Access denied. Please check your permissions.", "error");
      } else if (err.message.includes("400")) {
        showToast("❌ Invalid request. Please check your input data.", "error");
      } else {
        showToast(
          "⚠️ An unexpected error occurred. Please try again later.",
          "error"
        );
      }
    } finally {
      // Re-enable submit button
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});
