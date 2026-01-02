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

  toastElement.addEventListener("hidden.bs.toast", () => {
    toastElement.remove();
  });
}

// === Form validation functions ===
function validateName(name) {
  if (!name || name.trim().length < 2)
    return "Name must be at least 2 characters long";
  if (name.length > 50) return "Name must be less than 50 characters";
  if (!/^[a-zA-Z\s]+$/.test(name.trim()))
    return "Name can only contain letters and spaces";
  return null;
}
function validatePhone(phone) {
  if (!phone || phone.trim().length < 10)
    return "Phone number must be at least 10 digits";
  if (phone.length > 15) return "Phone number must be less than 15 digits";
  if (!/^[0-9]+$/.test(phone.trim()))
    return "Phone number can only contain digits";
  return null;
}
function validateEmail(email) {
  if (!email) return "Email address is required";
  if (email.length > 100) return "Email address is too long";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim()))
    return "Please enter a valid email address";
  return null;
}
function validatePassword(password) {
  if (!password || password.length < 6)
    return "Password must be at least 6 characters long";
  if (password.length > 50) return "Password must be less than 50 characters";
  return null;
}
function validateShopName(shopName) {
  if (!shopName || shopName.trim().length < 2)
    return "Shop name must be at least 2 characters long";
  if (shopName.length > 100)
    return "Shop name must be less than 100 characters";
  return null;
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorDiv = document.getElementById(fieldId + "-error");
  field.classList.add("is-invalid");
  errorDiv.textContent = message;
}
function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  const errorDiv = document.getElementById(fieldId + "-error");
  field.classList.remove("is-invalid");
  errorDiv.textContent = "";
}
function clearAllErrors() {
  ["name", "phone", "email", "password", "shop_name"].forEach((f) =>
    clearFieldError(f)
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const submitBtn = document.getElementById("submitBtn");

  const fields = ["name", "phone", "email", "password", "shop_name"];

  // Real-time validation
  fields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    field.addEventListener("blur", () => validateField(fieldId));
    field.addEventListener("input", () => clearFieldError(fieldId));
  });

  function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    const value = field.value.trim();
    let error = null;

    switch (fieldId) {
      case "name":
        error = validateName(value);
        break;
      case "phone":
        error = validatePhone(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "shop_name":
        error = validateShopName(value);
        break;
    }

    if (error) {
      showFieldError(fieldId, error);
      return false;
    } else {
      clearFieldError(fieldId);
      return true;
    }
  }

  function validateForm() {
    clearAllErrors();
    return fields.every((f) => validateField(f));
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("❌ Please fix the errors before submitting.", "error");
      return;
    }

    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Registering...";

    const formData = new FormData(form);

    try {
      const response = await fetch(
        "https://gajendhrademo.brandmindz.com/routes/auth/admin/register_admin.php",
        {
          method: "POST",
          body: formData,
        }
      );

      // Check if response is ok
      if (!response.ok) {
        console.error("HTTP Error:", response.status, response.statusText);
        showToast(
          `❌ Server error (${response.status}): ${response.statusText}`,
          "error"
        );
        return;
      }

      const text = await response.text(); // always read raw text first
      console.log("Raw server response:", text); // Debug log
      
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error("Invalid JSON response from server:", text);
        showToast(
          "⚠️ Server returned invalid response. Please check console for details.",
          "error"
        );
        return;
      }

      console.log("Registration response:", result);

      if (result.success) {
        showToast(result.message, "success");
        setTimeout(() => (window.location.href = "login.html"), 1500);
      } else {
        if (result.message.includes("email"))
          showFieldError("email", "This email is already registered");
        else if (result.message.includes("phone"))
          showFieldError("phone", "This phone number is already registered");
        else if (result.message.includes("shop"))
          showFieldError("shop_name", "A shop with this name already exists");

        showToast("❌ " + result.message, "error");
      }
    } catch (error) {
      console.error("Register error:", error);
      
      // More specific error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showToast(
          "❌ Cannot connect to server. Please ensure:\n1. XAMPP/WAMP is running\n2. Apache and MySQL services are active\n3. Backend path is correct",
          "error"
        );
      } else if (error.name === 'NetworkError' || error.message.includes('NetworkError')) {
        showToast(
          "❌ Network error. Please check your internet connection and server status.",
          "error"
        );
      } else {
        showToast(
          `⚠️ An unexpected error occurred: ${error.message}`,
          "error"
        );
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});
