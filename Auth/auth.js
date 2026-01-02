document.addEventListener("DOMContentLoaded", function () {

  /* ================= PASSWORD TOGGLE ================= */
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

});


document.addEventListener("DOMContentLoaded", function () {

  /* ==================================================
     MY ACCOUNT – TAB SWITCHING (TAILWIND)
  ================================================== */
  window.openTab = function (tabId, el) {
    // Hide all tabs
    document.querySelectorAll(".account-tab").forEach(tab => {
      tab.classList.add("hidden");
    });

    // Reset sidebar menu styles
    document.querySelectorAll(".account-menu li").forEach(item => {
      item.classList.remove("bg-brown", "text-white");
      item.classList.add("text-brown");
    });

    // Show selected tab
    const activeTab = document.getElementById(tabId);
    if (activeTab) activeTab.classList.remove("hidden");

    // Highlight active menu item
    if (el) {
      el.classList.add("bg-brown", "text-white");
      el.classList.remove("text-brown");
    }
  };

  /* ==================================================
     ADDRESS FORM LOGIC
  ================================================== */
  const form = document.getElementById("addressForm");
  const card = document.getElementById("addressCard");

  window.toggleAddressForm = function () {
    if (!form) return;
    form.classList.toggle("hidden");
  };

  window.editAddress = function () {
    if (!form) return;
    form.classList.remove("hidden");

    document.getElementById("name").value =
      document.getElementById("showName")?.innerText || "";

    document.getElementById("phone").value =
      document.getElementById("showPhone")?.innerText || "";

    document.getElementById("city").value = "Thoothukudi";
    document.getElementById("state").value = "Tamil Nadu";
    document.getElementById("pincode").value = "628208";

    document.getElementById("landmark").value =
      document.getElementById("showLandmark")?.innerText || "";
  };

  window.deleteAddress = function () {
    if (!card) return;

    if (confirm("Are you sure you want to delete this address?")) {
      card.remove();
      if (form) form.classList.add("hidden");
    }
  };

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      document.getElementById("showName").innerText =
        document.getElementById("name").value;

      document.getElementById("showPhone").innerText =
        document.getElementById("phone").value;

      document.getElementById("showLandmark").innerText =
        document.getElementById("landmark").value || "0";

      alert("Address saved successfully!");
      form.classList.add("hidden");
    });
  }

});


/* ================= LOGIN ================= */
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const res = await fetch(
      "https://gajendhrademo.brandmindz.com/routes/auth/login.php",
      {
        method: "POST",
        body: new FormData(loginForm),
        credentials: "include"
      }
    );

    const data = await res.json();

    if (data.success) {
      window.location.href = "./my-account.html";
    } else {
      alert(data.message);
    }
  });
}


/* ================= REGISTER ================= */
const registerForm = document.getElementById("registerForm");

let registerPayload = {};

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(registerForm);
    registerPayload = Object.fromEntries(formData.entries());

fetch("https://gajendhrademo.brandmindz.com/routes/auth/register.php", {
  method: "POST",
  body: formData,
  credentials: "include"
});


    const data = await res.json();
    console.log("REGISTER RESPONSE:", data);

    if (data.success) {
      showAlert(data.message, "success");
      registerForm.classList.add("hidden");
      document.getElementById("otpSection").classList.remove("hidden");
    } else {
      showAlert(data.message || "Registration failed", "error");
    }
  });
}



document.getElementById("verifyOtpBtn")?.addEventListener("click", async () => {
  const otp = document.getElementById("otpInput").value.trim();

  if (otp.length !== 6) {
    showAlert("Enter valid OTP", "error");
    return;
  }

  const formData = new FormData();
  Object.keys(registerPayload).forEach(k => {
    formData.append(k, registerPayload[k]);
  });
  formData.append("otp", otp);

  const res = await fetch(
    "https://gajendhrademo.brandmindz.com/routes/auth/verify_otp.php",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await res.json();

  if (data.success) {
    showAlert("Account created successfully 🎉", "success");
    setTimeout(() => location.href = "./login.html", 2000);
  } else {
    showAlert(data.message || "Invalid OTP", "error");
  }
});


function logout() {
  fetch("https://gajendhrademo.brandmindz.com/routes/auth/logout.php", {
    credentials: "include"
  }).then(() => {
    window.location.href = "./login.html";
  });
}

/* ================= LOAD USER PROFILE ================= */
async function loadUserProfile() {
  const res = await fetch(
    "https://gajendhrademo.brandmindz.com/routes/profile/get_profile.php",
    { credentials: "include" }
  );

  const data = await res.json();

  if (!data.success) {
    window.location.href = "./login.html";
    return;
  }

  const user = data.user;

  document.querySelector(".account-name").textContent = user.name;
  document.querySelector(".account-email").textContent = user.email;

  document.querySelector("input[name='full_name']").value = user.name;
  document.querySelector("input[name='email']").value = user.email;
  document.querySelector("input[name='phone']").value = user.phone;
}

if (location.pathname.includes("my-account")) {
  loadUserProfile();
}



/* ================= LOAD PROFILE ON MY ACCOUNT ================= */
if (location.pathname.includes("my-account")) {
  loadUserProfile();
}

function showAlert(msg, type="success") {
  const el = document.getElementById("pageAlert");
  if (!el) return;
  el.className = "fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg shadow-lg text-sm " +
    (type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white");
  el.textContent = msg;
  el.classList.remove("hidden");
  setTimeout(()=> el.classList.add("hidden"), 4000);
}