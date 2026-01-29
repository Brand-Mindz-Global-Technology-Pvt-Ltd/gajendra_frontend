/**
 * User Management Module
 * Handles fetching, rendering, and managing registered users.
 */

// --- CONFIGURATION ---
const USER_API = {
    GET_ALL: `${window.API_BASE}/get_users.php`,
    UPDATE: `${window.API_BASE}/update_user.php`,
    DELETE: `${window.API_BASE}/delete_user.php`
};

let allUsers = [];

/**
 * Main Initialization for User Module
 */
function initUserModule() {
    console.log("👥 User Module Initialized");

    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', (e) => {
            filterUsers(e.target.value);
        });
    }

    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', handleUserUpdate);
    }
}

/**
 * Load Users from API
 */
async function loadUsers() {
    const listContainer = document.getElementById('usersList');
    if (!listContainer) return;

    // Show loading state
    listContainer.innerHTML = `
        <tr>
            <td colspan="7" class="text-center py-5">
                <div class="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                Fetching latest users...
            </td>
        </tr>
    `;

    try {
        const response = await fetch(USER_API.GET_ALL);
        const result = await response.json();

        if (result.success) {
            allUsers = result.data || [];
            renderUsers(allUsers);
        } else {
            showToast(result.message || "Failed to load users", "error");
            renderError("Failed to load user data.");
        }
    } catch (error) {
        console.error("❌ Error loading users:", error);
        showToast("Server connection error", "error");
        renderError("Unable to connect to service.");
    }
}

/**
 * Render User List to Table
 */
function renderUsers(users) {
    const listContainer = document.getElementById('usersList');
    if (!listContainer) return;

    if (users.length === 0) {
        listContainer.innerHTML = '<tr><td colspan="7" class="text-center py-5 text-muted">No users found</td></tr>';
        return;
    }

    listContainer.innerHTML = users.map(user => `
        <tr>
            <td class="px-4 text-muted">#${user.id}</td>
            <td>
                <div class="d-flex align-items-center">
                    
                    <div>
                        <div class="fw-bold text-dark">${user.name}</div>
                        <div class="small text-muted">${user.email}</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="small"><i class="fas fa-phone me-2 "></i>${user.phone || 'N/A'}</div>
            </td>
            <td>
                <span class="badge ${user.role === 'admin' ? 'bg-danger-subtle text-danger' : 'bg-info-subtle text-info'} border-0 px-2 py-1">
                    ${user.role.toUpperCase()}
                </span>
            </td>
            <td>
                <span class="badge ${getStatusBadgeClass(user.status)} border-0 px-2 py-1">
                    ${(user.status || 'Active').toUpperCase()}
                </span>
            </td>
            <td class="small text-muted">
                ${new Date(user.created_at).toLocaleDateString()}
            </td>
            <td class="text-end px-4">
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary border-0" onclick="openEditUserModal(${user.id})" title="Edit User">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger border-0" onclick="handleUserDelete(${user.id})" title="Deactivate User">
                        <i class="fas fa-user-slash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getStatusBadgeClass(status) {
    switch ((status || 'active').toLowerCase()) {
        case 'active': return 'bg-success-subtle text-success';
        case 'inactive': return 'bg-warning-subtle text-warning';
        case 'pending': return 'bg-secondary-subtle text-secondary';
        default: return 'bg-light text-dark';
    }
}

/**
 * Filter Users based on search input
 */
function filterUsers(query) {
    const term = query.toLowerCase();
    const filtered = allUsers.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.phone && user.phone.includes(term))
    );
    renderUsers(filtered);
}

/**
 * Open Modal and Fill Data
 */
function openEditUserModal(id) {
    const user = allUsers.find(u => String(u.id) === String(id));
    if (!user) {
        showToast("User not found", "error");
        return;
    }

    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUserName').value = user.name;
    document.getElementById('editUserEmail').value = user.email;
    document.getElementById('editUserPhone').value = user.phone || '';
    document.getElementById('editUserRole').value = user.role;
    document.getElementById('editUserStatus').value = user.status || 'active';

    const modalEl = document.getElementById('editUserModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

/**
 * Handle User Update Submit
 */
async function handleUserUpdate(e) {
    e.preventDefault();

    const userData = {
        id: document.getElementById('editUserId').value,
        name: document.getElementById('editUserName').value,
        email: document.getElementById('editUserEmail').value,
        phone: document.getElementById('editUserPhone').value,
        role: document.getElementById('editUserRole').value,
        status: document.getElementById('editUserStatus').value
    };

    try {
        const response = await fetch(USER_API.UPDATE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (result.success) {
            showToast("User updated successfully", "success");
            bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
            loadUsers(); // Refresh list
        } else {
            showToast(result.message || "Update failed", "error");
        }
    } catch (error) {
        console.error("❌ Error updating user:", error);
        showToast("Connection error", "error");
    }
}

/**
 * Handle User Delete
 */
function handleUserDelete(id) {
    console.log("🗑️ Deactivate User Request - ID:", id);
    console.log("🗑️ API Endpoint:", USER_API.DELETE);

    showConfirm(
        "Deactivate User",
        "Are you sure you want to deactivate this user? They will no longer be able to log in.",
        async () => {
            try {
                console.log("🚀 Sending deactivate request to:", USER_API.DELETE);
                console.log("📦 Request body:", JSON.stringify({ id: id }));

                const response = await fetch(USER_API.DELETE, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: id })
                });

                console.log("📥 Response status:", response.status);
                const result = await response.json();
                console.log("📥 Response data:", result);

                if (result.success) {
                    showToast("User deactivated successfully", "success");
                    loadUsers(); // Refresh list
                } else {
                    showToast(result.message || "Deactivation failed", "error");
                }
            } catch (error) {
                console.error("❌ Error deactivating user:", error);
                showToast("Connection error", "error");
            }
        }
    );
}

function renderError(msg) {
    const listContainer = document.getElementById('usersList');
    if (listContainer) {
        listContainer.innerHTML = `<tr><td colspan="7" class="text-center py-5 text-danger font-monospace small"><i class="fas fa-exclamation-triangle me-2"></i>${msg}</td></tr>`;
    }
}

// Export functions to window for global access (from HTML onclick)
window.loadUsers = loadUsers;
window.openEditUserModal = openEditUserModal;
window.handleUserDelete = handleUserDelete;
window.initUserModule = initUserModule;
