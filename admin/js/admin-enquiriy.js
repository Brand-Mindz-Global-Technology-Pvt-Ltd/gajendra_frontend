// ========= CONFIG =========
const ENQUIRY_API_BASE =
  "https://gajendhrademo.brandmindz.com/routes/enquiries";

let allEnquiries = [];
let filteredEnquiries = [];
let currentPage = 1;
const pageSize = 10;

// ========= INIT =========
document.addEventListener("DOMContentLoaded", () => {
  // Load once when admin opens
  loadEnquiries();

  // Search
  const searchInput = document.getElementById("enquirySearch");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      currentPage = 1;
      applyFiltersAndRender();
    });
  }

  // Date filter
  const dateFilter = document.getElementById("enquiryDateFilter");
  if (dateFilter) {
    dateFilter.addEventListener("change", () => {
      currentPage = 1;
      applyFiltersAndRender();
    });
  }

  // Pagination
  const prevBtn = document.getElementById("enquiryPrevBtn");
  const nextBtn = document.getElementById("enquiryNextBtn");

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });

    nextBtn.addEventListener("click", () => {
      const totalPages = Math.ceil(filteredEnquiries.length / pageSize) || 1;
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
      }
    });
  }

  // Optional: reload enquiries when Enquiries menu clicked
  document
    .querySelectorAll('.admin-sidebar .nav-link[data-target="enquiries"]')
    .forEach((link) => {
      link.addEventListener("click", () => {
        loadEnquiries();
      });
    });
});

// ========= LOAD ENQUIRIES =========
async function loadEnquiries() {
  const loading = document.getElementById("enquiryLoading");
  const tableWrapper = document.getElementById("enquiryTableWrapper");
  const paginationWrapper = document.getElementById(
    "enquiryPaginationWrapper"
  );
  const tableBody = document.getElementById("enquiryTableBody");
  const countBadge = document.getElementById("enquiryCount");

  if (!loading || !tableWrapper || !tableBody || !countBadge) return;

  tableWrapper.classList.add("d-none");
  paginationWrapper?.classList.add("d-none");
  loading.classList.remove("d-none");
  tableBody.innerHTML = "";

  try {
    const res = await fetch(`${ENQUIRY_API_BASE}/get_enquiries.php`);
    const data = await res.json();

    if (!data.success || !Array.isArray(data.data)) {
      showToast("Failed to load enquiries", "error");
      loading.classList.add("d-none");
      return;
    }

    allEnquiries = data.data;
    countBadge.textContent = `${allEnquiries.length} enquiries`;

    currentPage = 1;
    applyFiltersAndRender();
  } catch (err) {
    console.error(err);
    showToast("Error fetching enquiries", "error");
    loading.classList.add("d-none");
  }
}

// ========= FILTER + RENDER =========
function applyFiltersAndRender() {
  const searchInput = document.getElementById("enquirySearch");
  const dateFilter = document.getElementById("enquiryDateFilter");

  const searchTerm = (searchInput?.value || "").toLowerCase().trim();
  const dateValue = dateFilter?.value || "all";

  filteredEnquiries = allEnquiries.filter((item) => {
    // Search filter
    const combined =
      `${item.name} ${item.email} ${item.phone} ${item.message}`.toLowerCase();
    if (searchTerm && !combined.includes(searchTerm)) return false;

    // Date filter
    if (dateValue !== "all" && item.created_at) {
      const created = new Date(item.created_at);
      const today = new Date();
      // strip time
      today.setHours(0, 0, 0, 0);

      if (dateValue === "today") {
        const sameDay =
          created.toDateString() === today.toDateString();
        if (!sameDay) return false;
      } else if (dateValue === "7days") {
        const sevenAgo = new Date(today);
        sevenAgo.setDate(today.getDate() - 7);
        if (created < sevenAgo) return false;
      } else if (dateValue === "month") {
        const sameMonth =
          created.getMonth() === today.getMonth() &&
          created.getFullYear() === today.getFullYear();
        if (!sameMonth) return false;
      }
    }

    return true;
  });

  renderTable();
}

function renderTable() {
  const loading = document.getElementById("enquiryLoading");
  const tableWrapper = document.getElementById("enquiryTableWrapper");
  const paginationWrapper = document.getElementById(
    "enquiryPaginationWrapper"
  );
  const tableBody = document.getElementById("enquiryTableBody");
  const pageInfo = document.getElementById("enquiryPageInfo");
  const countBadge = document.getElementById("enquiryCount");

  if (!loading || !tableWrapper || !tableBody) return;

  loading.classList.add("d-none");
  tableWrapper.classList.remove("d-none");

  tableBody.innerHTML = "";

  if (filteredEnquiries.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4 text-muted">
          No enquiries found
        </td>
      </tr>`;
    paginationWrapper?.classList.add("d-none");
    pageInfo && (pageInfo.textContent = "");
    countBadge && (countBadge.textContent = "0 enquiries");
    return;
  }

  const totalPages = Math.ceil(filteredEnquiries.length / pageSize) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const pageItems = filteredEnquiries.slice(startIndex, endIndex);

  pageItems.forEach((item, idx) => {
    const formattedDate = formatDateTime(item.created_at);
    const rowNumber = startIndex + idx + 1;

    tableBody.insertAdjacentHTML(
      "beforeend",
      `
      <tr id="enqRow_${item.id}">
        <td>${rowNumber}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.email)}</td>
        <td>${escapeHtml(item.phone)}</td>
        <td
          class="text-primary message-preview"
          style="max-width:260px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:pointer;"
          onclick="openMessageModal(${item.id})"
        >
          ${escapeHtml(truncateMessage(item.message || "", 80))}
        </td>
        <td>${formattedDate}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-danger" onclick="deleteEnquiry(${item.id})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>`
    );
  });

  countBadge &&
    (countBadge.textContent = `${filteredEnquiries.length} enquiries`);

  // Pagination UI
  if (paginationWrapper && pageInfo) {
    paginationWrapper.classList.remove("d-none");
    pageInfo.textContent = `Showing ${
      startIndex + 1
    }–${Math.min(endIndex, filteredEnquiries.length)} of ${
      filteredEnquiries.length
    } enquiries`;
  }
}

// ========= HELPERS =========
function truncateMessage(msg, limit) {
  return msg.length > limit ? msg.substring(0, limit) + "..." : msg;
}

function formatDateTime(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);

  const d = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const t = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${d} `;
}

function escapeHtml(text) {
  return (text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ========= MODAL (FULL MESSAGE) =========
function openMessageModal(id) {
  const enquiry = allEnquiries.find((e) => String(e.id) === String(id));
  if (!enquiry) return;

  const nameEl = document.getElementById("modalName");
  const emailEl = document.getElementById("modalEmail");
  const phoneEl = document.getElementById("modalPhone");
  const dateEl = document.getElementById("modalDate");
  const messageEl = document.getElementById("modalMessage");

  if (nameEl) nameEl.textContent = enquiry.name || "-";
  if (emailEl) emailEl.textContent = enquiry.email || "-";
  if (phoneEl) phoneEl.textContent = enquiry.phone || "-";
  if (dateEl) dateEl.textContent = formatDateTime(enquiry.created_at);
  if (messageEl) messageEl.textContent = enquiry.message || "";

  const modalEl = document.getElementById("messageModal");
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}

// ========= DELETE ENQUIRY =========
async function deleteEnquiry(id) {
  if (!confirm("Are you sure you want to delete this enquiry?")) return;

  try {
    const res = await fetch(`${ENQUIRY_API_BASE}/delete_enquiry.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();

    if (data.success) {
      showToast("Enquiry deleted", "success");
      // Remove from local arrays
      allEnquiries = allEnquiries.filter(
        (e) => String(e.id) !== String(id)
      );
      applyFiltersAndRender();
    } else {
      showToast(data.message || "Delete failed", "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Server error while deleting", "error");
  }
}
