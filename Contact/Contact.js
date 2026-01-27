import { HeaderInitializer } from '../Assets/js/utils/headerInitializer.js';

// Header Initializer
document.addEventListener('DOMContentLoaded', () => {
  HeaderInitializer.init();
});

// ===========================
// CONTACT FORM SUBMISSION
// ===========================

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name: document.getElementById("contactName").value.trim(),
      phone: document.getElementById("contactPhone").value.trim(),
      email: document.getElementById("contactEmail").value.trim(),
      message: document.getElementById("contactMessage").value.trim(),
    };

    // Basic validation
    if (!payload.name || !payload.phone || !payload.email || !payload.message) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch(
        "https://gajendhrademo.brandmindz.com/routes/enquiries/add_enquiry.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Message sent successfully!");
        form.reset();
      } else {
        alert(data.message || "Submission failed");
      }

    } catch (error) {
      console.error("Enquiry error:", error);
      alert("Server error. Please try again later.");
    }
  });

});
