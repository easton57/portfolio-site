// Blog Posts Page Loader
async function loadBlogPosts() {
    try {
        const response = await fetch("/api/all-posts");
        const posts = await response.json();

        const postsContainer =
            document.getElementById("blog-posts");
        postsContainer.innerHTML = posts
            .map(
                (post) => `
                        <div class="blog-post">
                            <h3><a href="blog-post.html?id=${post.id}">${post.title}</a></h3>
                            <p>${post.summary}</p>
                            <small>${new Date(post.created_at).toLocaleDateString()}</small>
                        </div>
                    `,
            )
            .join("");
    } catch (error) {
        console.error("Error loading blog posts:", error);
        document.getElementById("blog-posts").innerHTML =
            "<p>Error loading posts</p>";
    }
}

// Load posts when the page loads
document.addEventListener("DOMContentLoaded", loadBlogPosts);

// Blog Post Loader
async function loadBlogPost() {
    try {
        // Get the post ID from the URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');

        if (!postId) {
            document.getElementById('blog-post-content').innerHTML = '<p>Post not found</p>';
            return;
        }

        const response = await fetch(`/api/blog/${postId}`);

        if (!response.ok) {
            throw new Error('Post not found');
        }

        const post = await response.json();

        // Update the page title
        document.title = `${post.title} - Easton Seidel`;

        // Display the blog post content
        document.getElementById('blog-post-content').innerHTML = `
                        <article class="blog-post-full">
                            <header class="post-header">
                                <h1>${post.title}</h1>
                                <div class="post-meta">
                                    <time datetime="${post.created_at}">${new Date(post.created_at).toLocaleDateString()}</time>
                                </div>
                                <p class="post-summary">${post.summary}</p>
                            </header>
                            <div class="post-content">
                                ${post.excerpt}
                            </div>
                        </article>
                    `;
    } catch (error) {
        console.error('Error loading blog post:', error);
        document.getElementById('blog-post-content').innerHTML = '<p>Error loading post</p>';
    }
}

// Load the blog post when the page loads
document.addEventListener('DOMContentLoaded', loadBlogPost);
