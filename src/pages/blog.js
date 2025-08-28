export function createBlogPage() {
  return `
    <div class="content">
        <a href="#"><h1>Easton Seidel</h1></a>

        <nav class="navbar">
            <ul>
                <li><a href="#about">About</a></li>
                <li><a href="#blog">Blog</a></li>
            </ul>
        </nav>

        <h2>Blog</h2>

        <div class="main-content full-width">
            <div class="content-body">
                <div id="blog-posts">
                    <!-- Blog posts will be loaded here -->
                </div>
            </div>
        </div>

        <div class="footer">
            <table>
                <tr>
                    <td><p>Copyright 2025 Easton Seidel</p></td>
                    <td><a href="/rss/blog-feed.xml">RSS Feed</a></td>
                </tr>
            </table>
        </div>
    </div>
  `;
}
