import '../css/style.css'
import '../css/admin.css'

// Simple blog posts loader for the homepage
async function loadBlogPosts() {
    try {
        const response = await fetch("/api/recent-posts");
        const posts = await response.json();

        const postsContainer = document.getElementById("blog-posts");
        if (postsContainer) {
            postsContainer.innerHTML = posts
                .map(
                    (post) => `
                <div class="blog-post">
                    <h5><a href="blog-post.html?id=${post.id}">${post.title}</a></h5>
                    <p>${post.summary}</p>
                    <small>${new Date(post.created_at).toLocaleDateString()}</small>
                </div>
            `,
                )
                .join("");
        }
    } catch (error) {
        console.error("Error loading blog posts:", error);
        const postsContainer = document.getElementById("blog-posts");
        if (postsContainer) {
            postsContainer.innerHTML = "<p>Error loading posts</p>";
        }
    }
}

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
    // Load blog posts if we're on the homepage
    if (document.getElementById('blog-posts')) {
        loadBlogPosts();
    }
});