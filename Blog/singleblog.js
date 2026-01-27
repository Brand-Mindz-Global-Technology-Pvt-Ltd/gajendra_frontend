import { HeaderInitializer } from '../Assets/js/utils/headerInitializer.js';

document.addEventListener("DOMContentLoaded", () => {
    // Initialize Header & Footer
    HeaderInitializer.init();

    // Fetch Blog Content
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");

    if (!slug) {
        if (document.getElementById("blogLoading")) document.getElementById("blogLoading").classList.add("hidden");
        if (document.getElementById("blogError")) document.getElementById("blogError").classList.remove("hidden");
        return;
    }

    fetchBlog(slug);
});

async function fetchBlog(slug) {
    const API_URL = "https://gajendhrademo.brandmindz.com/routes/blogs/user/get_blog.php";

    try {
        const fd = new FormData();
        fd.append("slug", slug);

        const res = await fetch(API_URL, {
            method: "POST",
            body: fd
        });

        if (!res.ok) throw new Error("Network response was not ok");

        const data = await res.json();

        if (data.status === "success" && data.data) {
            const blog = data.data;

            document.title = `${blog.title} | Gajendra Vilas`;
            document.getElementById("blogTitle").textContent = blog.title;
            document.getElementById("blogCategory").textContent = blog.category || 'General';

            const dateObj = new Date(blog.created_at);
            document.getElementById("blogDate").textContent = `Published on ${dateObj.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })}`;

            document.getElementById("blogContent").innerHTML = blog.content;

            if (blog.image) {
                document.getElementById("blogHeroImage").src = blog.image;
                document.getElementById("blogHeroImage").alt = blog.title;
            } else {
                document.getElementById("blogHeroImage").src = 'https://placehold.co/1200x600/5D3420/FFFFFF?text=Gajendra+Vilas';
            }

            document.getElementById("blogLoading").classList.add("hidden");
            document.getElementById("blogContentWrapper").classList.remove("hidden");

            // Increment views (optional)
            fetch("https://gajendhrademo.brandmindz.com/routes/blogs/user/increment_views.php", {
                method: "POST",
                body: fd
            }).catch(e => console.warn("View increment failed", e));

        } else {
            document.getElementById("blogLoading").classList.add("hidden");
            document.getElementById("blogError").classList.remove("hidden");
        }
    } catch (err) {
        console.error("Error fetching blog:", err);
        if (document.getElementById("blogLoading")) document.getElementById("blogLoading").classList.add("hidden");
        if (document.getElementById("blogError")) document.getElementById("blogError").classList.remove("hidden");
    }
}
