import AuthService from "../services/authService.js";
import ProfileService from "../services/profileService.js";
import { ProfileRenderer } from "../renderers/profileRenderer.js";
import { Toast } from "../utils/toast.js";

// Global Cache for Addresses
window.userAddresses = [];

document.addEventListener("DOMContentLoaded", () => {
    loadUserProfile();
    setupEventListeners();
});

function setupEventListeners() {
    /* ================= TAB SWITCHING ================= */
    window.openTab = function (tabId, el) {
        document.querySelectorAll(".account-tab").forEach(tab => tab.classList.add("hidden"));
        
        document.querySelectorAll(".sidebar-tab").forEach(item => {
            item.classList.remove("bg-brown", "text-white", "shadow-md");
            item.classList.add("text-brown", "hover:bg-brown/10", "hover:text-brownDark");
        });

        const activeTab = document.getElementById(tabId);
        if (activeTab) activeTab.classList.remove("hidden");

        if (el) {
            el.classList.add("bg-brown", "text-white", "shadow-md");
            el.classList.remove("text-brown", "hover:bg-brown/10", "hover:text-brownDark");
        }
    };

    /* ================= LOGOUT ================= */
    window.logout = async function() {
        await AuthService.logout();
        Toast.success("Logged out successfully");
        setTimeout(() => window.location.href = "./login.html", 1000);
    }

    /* ================= PERSONAL INFO UPDATE ================= */
    const personalForm = document.getElementById("personalForm");
    if (personalForm) {
        personalForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(personalForm);
            try {
                const result = await ProfileService.updateProfile(formData);
                if (result.success || result.status === 'success') {
                    Toast.success("Profile updated successfully");
                    loadUserProfile(); 
                } else {
                    Toast.error(result.message || "Failed to update profile");
                }
            } catch (error) {
                console.error(error);
                Toast.error("Update failed. Please try again.");
            }
        });
    }

    /* ================= ADDRESS FORM HANDLER ================= */
    const addressForm = document.getElementById("addressForm");
    if (addressForm) {
        addressForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(addressForm);
            const isDefault = document.getElementById("addr_default").checked ? 1 : 0;
            formData.set("is_default", isDefault);

            try {
                const result = await ProfileService.saveAddress(formData);
                if (result.success || result.status === 'success') {
                    Toast.success(result.message || "Address saved");
                    fetchAddresses(); 
                    toggleAddressForm(false); 
                } else {
                    Toast.error(result.message || "Failed to save address");
                }
            } catch (e) {
                Toast.error("Network error");
            }
        });
    }
}

/* ================= PROFILE LOADING ================= */
async function loadUserProfile() {
    try {
        const response = await AuthService.getUserProfile();
        const isSuccess = response.success === true || response.status === 'success';

        if (!isSuccess) {
            Toast.error(response.message || "Session expired. Please login again.");
            setTimeout(() => window.location.href = "./login.html", 2000);
            return;
        } 

        const user = response.data; 
        updateSidebarProfile(user);
        updatePersonalInfoForm(user);
        
        // Lazy Load Other Data
        fetchOrders(user.id);
        fetchWishlist(user.id);
        fetchAddresses();

    } catch (e) {
        console.error("Profile Load Error", e);
    }
}

function updateSidebarProfile(user) {
    ProfileRenderer.updateSidebar(user);
    ProfileRenderer.toggleLoading('sidebar', false);

    const userDropdown = document.getElementById("user-dropdown");
    if (userDropdown) {
        userDropdown.innerHTML = ProfileRenderer.renderUserDropdown(user);
    }
}

function updatePersonalInfoForm(user) {
    ProfileRenderer.populatePersonalInfoForm(user);
    ProfileRenderer.toggleLoading('personal', false);
}

/* ================= IMAGE UPLOAD ================= */
window.uploadProfileImage = async function(input) {
    if (input.files && input.files[0]) {
        const formData = new FormData();
        formData.append("profile_image", input.files[0]);

        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("profileImg").src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);

        try {
            const result = await ProfileService.uploadProfileImage(formData);
            if (result.success || result.status === 'success') {
                Toast.success("Profile image updated");
            } else {
                Toast.error("Failed to upload image");
            }
        } catch (e) {
            Toast.error("Error uploading image");
        }
    }
}

/* ================= ADDRESS FUNCTIONS ================= */
window.toggleAddressForm = function(show = true) {
    const form = document.getElementById("addressForm");
    const title = document.getElementById("addressFormTitle");
    
    if (show) {
        form.classList.remove("hidden");
        form.scrollIntoView({ behavior: 'smooth' });
    } else {
        form.classList.add("hidden");
        document.getElementById("addressForm").reset();
        document.getElementById("address_id").value = ""; 
        title.innerText = "Add New Address";
    }
}

window.editAddress = function(id) {
    const addr = window.userAddresses.find(a => a.id == id);
    if (!addr) return;

    document.getElementById("address_id").value = addr.id;
    document.getElementById("addr_name").value = addr.full_name;
    document.getElementById("addr_phone").value = addr.phone;
    document.getElementById("addr_line1").value = addr.address_line1;
    document.getElementById("addr_line2").value = addr.address_line2 || "";
    document.getElementById("addr_city").value = addr.city;
    document.getElementById("addr_state").value = addr.state;
    document.getElementById("addr_pincode").value = addr.pincode;
    document.getElementById("addr_default").checked = addr.is_default == 1;

    document.getElementById("addressFormTitle").innerText = "Edit Address";
    window.toggleAddressForm(true);
}

window.deleteAddress = async function(addressId) {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
        const result = await ProfileService.deleteAddress(addressId);
        if (result.success || result.status === 'success') {
            Toast.success("Address deleted");
            fetchAddresses(); 
        } else {
            Toast.error(result.message || "Failed to delete address");
        }
    } catch (e) {
        Toast.error("Error deleting address");
    }
}

async function fetchAddresses() {
    ProfileRenderer.showSkeletons('addressList');

    try {
        const result = await ProfileService.getAllAddresses();
        const data = (result.success && result.data) ? result.data : [];
        window.userAddresses = data;
        const addressList = document.getElementById("addressList");
        if (addressList) {
            addressList.innerHTML = ProfileRenderer.renderAddressList(data);
        }
    } catch {
        const addressList = document.getElementById("addressList");
        if (addressList) {
            addressList.innerHTML = `<p class="text-red-500 text-center col-span-full">Failed to load addresses.</p>`;
        }
    }
}

async function fetchOrders(userId) {
    ProfileRenderer.showSkeletons('ordersList');

    try {
        const result = await ProfileService.getOrders(userId);
        const orders = (result.success && result.orders) ? result.orders : [];
        const ordersList = document.getElementById("ordersList");
        if (ordersList) {
            ordersList.innerHTML = ProfileRenderer.renderOrderList(orders);
        }
    } catch {
        const ordersList = document.getElementById("ordersList");
        if (ordersList) {
            ordersList.innerHTML = `<p class="text-center text-gray-400 py-4">No recent orders found.</p>`;
        }
    }
}

async function fetchWishlist(userId) {
    ProfileRenderer.showSkeletons('wishlistGrid');

    try {
        const result = await ProfileService.getWishlist(userId);
        const products = (result.success && result.data && result.data.products) ? result.data.products : [];
        const wishlistGrid = document.getElementById("wishlistGrid");
        if (wishlistGrid) {
            wishlistGrid.innerHTML = ProfileRenderer.renderWishlist(products, userId);
        }
    } catch {
        const wishlistGrid = document.getElementById("wishlistGrid");
        if (wishlistGrid) {
            wishlistGrid.innerHTML = ProfileRenderer.renderWishlist([], userId);
        }
    }
}

// Global hook for wishlist removal (needed for onclick)
window.removeFromWishlist = async function(userId, productId) {
    if (!confirm("Remove from wishlist?")) return;
    try {
        const result = await ProfileService.removeFromWishlist(userId, productId);
        if (result.success || result.status === 'success') {
            Toast.success("Removed from wishlist");
            fetchWishlist(userId);
        } else {
            Toast.error("Failed to remove");
        }
    } catch {
        Toast.error("Error removing item");
    }
}
