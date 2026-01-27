import { HeaderInitializer } from '../Assets/js/utils/headerInitializer.js';

const BLOG_API_BASE = "https://gajendhrademo.brandmindz.com/routes/blogs/user";

document.addEventListener("DOMContentLoaded", () => {
  HeaderInitializer.init();
  fetchBlogs();
});

/**
 * Fetches all published blogs from the API
 */
async function fetchBlogs() {
  const blogGrid = document.getElementById("blogGrid");
  const blogLoading = document.getElementById("blogLoading");
  const blogEmpty = document.getElementById("blogEmpty");

  try {
    const fd = new FormData();
    fd.append("limit", 12); // Fetch more for the listing page

    const res = await fetch(`${BLOG_API_BASE}/list_blogs.php`, {
      method: "POST",
      body: fd
    });

    const data = await res.json();

    if (blogLoading) blogLoading.classList.add("hidden");

    if (data.status === "success" && data.data && data.data.length > 0) {
      renderBlogs(data.data);
    } else {
      if (blogEmpty) blogEmpty.classList.remove("hidden");
    }
  } catch (err) {
    console.error("Error fetching blogs:", err);
    if (blogLoading) {
      blogLoading.innerHTML = `
            <div class="py-10">
                <p class="text-red-500 font-medium">Failed to load blogs.</p>
                <button onclick="window.location.reload()" class="mt-4 text-brown underline">Try Again</button>
            </div>
        `;
    }
  }
}

/**
 * Renders blog cards into the grid
 * @param {Array} blogs 
 */
function renderBlogs(blogs) {
  const blogGrid = document.getElementById("blogGrid");
  if (!blogGrid) return;

  blogGrid.innerHTML = "";

  blogs.forEach(blog => {
    // Basic validation
    if (!blog.title || !blog.slug) return;

    const blogCard = document.createElement("article");
    blogCard.className = "bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full";

    // Format Date
    const dateObj = new Date(blog.created_at);
    const formattedDate = dateObj.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const image = blog.image || 'https://placehold.co/600x400/5D3420/FFFFFF?text=Gajendra+Vilas';
    const singleBlogUrl = `singleblog.html?slug=${blog.slug}`;

    blogCard.innerHTML = `
        <div class="relative overflow-hidden group">
            <a href="${singleBlogUrl}">
              <img src="${image}" alt="${blog.title}" class="w-full h-[220px] object-cover transition-transform duration-500 group-hover:scale-110">
            </a>
            <div class="absolute top-4 left-4">
                <span class="bg-brown text-white px-3 py-1 rounded text-xs font-semibold shadow-lg">
                  ${blog.category || 'General'}
                </span>
            </div>
        </div>
        
        <div class="p-6 flex flex-col flex-grow">
          <div class="flex items-center text-xs text-gray-400 mb-3">
            <i class="far fa-calendar-alt me-2 text-orange-400"></i>
            <span>${formattedDate}</span>
          </div>
          
          <h3 class="text-xl font-bold mb-3 leading-tight">
            <a href="${singleBlogUrl}" class="text-brown hover:text-orange-500 transition-colors">
              ${blog.title}
            </a>
          </h3>
          
          <p class="text-sm text-gray-500 mb-6 line-clamp-3 leading-relaxed flex-grow">
            ${blog.short_description || 'Explore our latest stories and insights about natural products and traditional tastes.'}
          </p>
          
          <div class="mt-auto pt-4 border-t border-gray-100">
              <a href="${singleBlogUrl}" class="inline-flex items-center text-brown font-bold text-sm tracking-wide group transition-all">
                READ MORE 
                <span class="ms-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
          </div>
        </div>
    `;
    blogGrid.appendChild(blogCard);
  });
}
