/* ============================================================
   ADMIN BLOG MANAGEMENT SCRIPT
   ============================================================ */

   const BLOG_API_BASE = "https://gajendhrademo.brandmindz.com/routes/blogs";

   // --------------- DOM CACHE (Safely loaded) --------------- //
   function getEl(id) {
     return document.getElementById(id);
   }
   
   function safeLoad(id) {
     const el = document.getElementById(id);
     if (!el) {
       console.warn(`Element #${id} not found`);
     }
     return el;
   }
   
   // --------------- Toast Message (Bootstrap) --------------- //
   function showToast(message, type = "info") {
     let toastContainer = document.getElementById("toastContainer");
   
     if (!toastContainer) {
       toastContainer = document.createElement("div");
       toastContainer.id = "toastContainer";
       toastContainer.className = "toast-container position-fixed top-0 end-0 p-3";
       toastContainer.style.zIndex = "12000";
       document.body.appendChild(toastContainer);
     }
   
     const toastId = "toast-" + Date.now();
     const toast = document.createElement("div");
   
     toast.id = toastId;
     toast.className = `toast align-items-center text-white bg-${
       type === "error"
         ? "danger"
         : type === "success"
         ? "success"
         : type === "warning"
         ? "warning"
         : "info"
     } border-0 shadow-lg`;
   
     toast.setAttribute("role", "alert");
     toast.setAttribute("aria-live", "assertive");
     toast.setAttribute("aria-atomic", "true");
   
     toast.innerHTML = `
         <div class="d-flex">
             <div class="toast-body">${message}</div>
             <button type="button" class="btn-close btn-close-white me-2 m-auto"
                 data-bs-dismiss="toast"></button>
         </div>
     `;
   
     toastContainer.appendChild(toast);
   
     const bsToast = new bootstrap.Toast(toast);
     bsToast.show();
   
     toast.addEventListener("hidden.bs.toast", () => toast.remove());
   }
   
   // ------------------ IMAGE UPLOAD ------------------ //
   async function uploadBlogImage(file) {
     const fd = new FormData();
     fd.append("image", file);
   
     try {
       const res = await fetch(`${BLOG_API_BASE}/admin/upload_blog_image.php`, {
         method: "POST",
         body: fd,
       });
   
       const data = await res.json();
   
       if (data.status === "success") {
         showToast("Image uploaded successfully!", "success");
         return data.image_url;
       } else {
         showToast(data.message, "error");
         return null;
       }
     } catch (error) {
       console.error(error);
       showToast("Image upload failed", "error");
       return null;
     }
   }
   
   // ------------------ CREATE BLOG ------------------ //
   async function createBlog() {
     const fd = new FormData();
   
     fd.append("title", getEl("blogTitle").value);
     fd.append("slug", getEl("blogSlug").value);
     fd.append("short_description", getEl("blogShortDesc").value);
     fd.append("content", getEl("blogContent").value);
     fd.append("category", getEl("blogCategory").value);
     fd.append("tags", getEl("blogTags").value);
     fd.append("meta_title", getEl("blogMetaTitle").value);
     fd.append("meta_description", getEl("blogMetaDesc").value);
     fd.append("status", getEl("blogStatus").value);
     fd.append("image", getEl("blogImageUrl").value);
   
     try {
       if (typeof setButtonLoading === 'function') {
           setButtonLoading("blogSubmitBtn", true, "Creating...");
       }
       const res = await fetch(`${BLOG_API_BASE}/admin/create_blog.php`, {
         method: "POST",
         body: fd,
       });
   
       const data = await res.json();
       
       if (typeof setButtonLoading === 'function') {
           setButtonLoading("blogSubmitBtn", false);
       }
   
       if (data.status === "success") {
         showToast("Blog created successfully!", "success");
         resetBlogForm();
         loadBlogs();
       } else {
         showToast(data.message, "error");
       }
     } catch (err) {
       console.error(err);
       if (typeof setButtonLoading === 'function') {
           setButtonLoading("blogSubmitBtn", false);
       }
       showToast("Something went wrong", "error");
     }
   }
   
   // ------------------ RESET BLOG FORM ------------------ //
   function resetBlogForm() {
     blogForm.reset();
     getEl("blogImagePreview").classList.add("d-none");
     getEl("blogImageUrl").value = "";
   
     getEl("blogEditControls").style.display = "none";
     getEl("blogSubmitBtn").style.display = "inline-block";
   }
   
   // ------------------ INITIALIZER ------------------ //
   document.addEventListener("DOMContentLoaded", () => {
     const blogSection = document.getElementById("blogs");
   
     if (blogSection) {
       loadBlogs();
   
       document.getElementById("blogForm").addEventListener("submit", createBlog);
   
       document.getElementById("blogSaveBtn").addEventListener("click", updateBlog);
   
       document.getElementById("blogImage").addEventListener("change", async (e) => {
         const url = await uploadBlogImage(e.target.files[0]);
         if (url) {
           getEl("blogImageUrl").value = url;
           getEl("blogImagePreview").src = url;
           getEl("blogImagePreview").classList.remove("d-none");
         }
       });
   
       document.getElementById("blogCancelBtn").addEventListener("click", resetBlogForm);
     }
   });

   

   async function editBlog(id) {
    const fd = new FormData();
    fd.append("blog_id", id);
  
    try {
      const res = await fetch(`${BLOG_API_BASE}/admin/get_blog_admin.php`, {
        method: "POST",
        body: fd,
      });
  
      const data = await res.json();
      if (data.status !== "success") {
        showToast(data.message, "error");
        return;
      }
  
      const b = data.data;
  
      // Fill form fields
      getEl("blogId").value = b.id;
      getEl("blogTitle").value = b.title;
      getEl("blogSlug").value = b.slug;
      getEl("blogShortDesc").value = b.short_description;
      getEl("blogContent").value = b.content;
      getEl("blogCategory").value = b.category;
      getEl("blogTags").value = b.tags;
      getEl("blogMetaTitle").value = b.meta_title;
      getEl("blogMetaDesc").value = b.meta_description;
      getEl("blogStatus").value = b.status;
      getEl("blogImageUrl").value = b.image;
  
      // Image preview
      if (b.image) {
        const preview = getEl("blogImagePreview");
        preview.src = b.image;
        preview.classList.remove("d-none");
      }
  
      // Switch UI to Edit Mode
      getEl("blogSubmitBtn").style.display = "none";
      getEl("blogEditControls").style.display = "block";
  
      showToast("Editing blog...", "info");
  
    } catch (err) {
      console.error(err);
      showToast("Failed to load blog", "error");
    }
  }

  // ------------------ UPDATE BLOG ------------------ //
   async function updateBlog() {
     const fd = new FormData();
   
     fd.append("blog_id", getEl("blogId").value);
     fd.append("title", getEl("blogTitle").value);
     fd.append("slug", getEl("blogSlug").value);
     fd.append("short_description", getEl("blogShortDesc").value);
     fd.append("content", getEl("blogContent").value);
     fd.append("category", getEl("blogCategory").value);
     fd.append("tags", getEl("blogTags").value);
     fd.append("meta_title", getEl("blogMetaTitle").value);
     fd.append("meta_description", getEl("blogMetaDesc").value);
     fd.append("status", getEl("blogStatus").value);
     fd.append("image", getEl("blogImageUrl").value);
   
     try {
       if (typeof setButtonLoading === 'function') {
           setButtonLoading("blogSaveBtn", true, "Updating...");
       }
       const res = await fetch(`${BLOG_API_BASE}/admin/update_blog.php`, {
         method: "POST",
         body: fd,
       });
   
       const data = await res.json();
       
       if (typeof setButtonLoading === 'function') {
           setButtonLoading("blogSaveBtn", false);
       }
   
       if (data.status === "success") {
         showToast("Blog updated successfully!", "success");
         resetBlogForm();
         loadBlogs();
       } else {
         showToast(data.message, "error");
       }
     } catch (e) {
       console.error(e);
       if (typeof setButtonLoading === 'function') {
           setButtonLoading("blogSaveBtn", false);
       }
       showToast("Update failed", "error");
     }
   }

  // ------------------ DELETE BLOG ------------------ //
  async function deleteBlog(id) {
    if (!confirm("Are you sure? This will permanently delete the blog.")) return;
  
    const fd = new FormData();
    fd.append("blog_id", id);
  
    try {
      const res = await fetch(`${BLOG_API_BASE}/admin/delete_blog.php`, {
        method: "POST",
        body: fd,
      });
  
      const data = await res.json();
  
      if (data.status === "success") {
        showToast("Blog deleted successfully!", "success");
        loadBlogs();
      } else {
        showToast(data.message, "error");
      }
  
    } catch (err) {
      console.error(err);
      showToast("Delete failed", "error");
    }
  }

  
  function resetBlogForm() {
    blogForm.reset();
  
    // Reset preview
    const preview = getEl("blogImagePreview");
    preview.classList.add("d-none");
    preview.src = "";
  
    getEl("blogId").value = "";
    getEl("blogImageUrl").value = "";
  
    // Switch UI back to Add Mode
    getEl("blogEditControls").style.display = "none";
    getEl("blogSubmitBtn").style.display = "inline-block";
  }

  
  getEl("blogSaveBtn").addEventListener("click", updateBlog);
getEl("blogCancelBtn").addEventListener("click", resetBlogForm);
