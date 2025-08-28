export function createHomePage() {
  return `
    <div class="content">
        <a href="#"><h1>Easton Seidel</h1></a>

        <nav class="navbar">
            <ul>
                <li><a href="#about">About</a></li>
                <li><a href="#blog">Blog</a></li>
            </ul>
        </nav>

        <div class="main-content">
            <div class="content-body">
                <img src="/IMG/me.jpg" alt="Easton Seidel" />
                <p>
                    I'm Easton Seidel. I'm a Systems Administrator and
                    aspiring Software Engineer in Southern California.
                </p>
                <br />
                <br />
                <p>
                    I'm passionate about technology and how it can increase
                    efficiency and productivity. You can find examples of
                    that on my
                    <a href="https://github.com/easton57" target="_blank">github</a> where I
                    have my linux configuration and other projects.
                </p>
                <br />
                <br />
                <p>
                    In my free time, I play the upright bass in Southern
                    California Philharmonic and tinker with any electronics
                    I can get my hands on.
                </p>
            </div>

            <div class="sidebar">
                <table class="social-media">
                    <tr>
                        <td>
                            <a
                                href="https://www.linkedin.com/in/easton-seidel/"
                                target="_blank"
                                ><img
                                    src="/IMG/linkedin.png"
                                    class="social-media-icon"
                                    alt="LinkedIn"
                            /></a>
                        </td>
                        <td>
                            <a
                                href="https://github.com/easton57"
                                target="_blank"
                                ><img
                                    src="/IMG/github.png"
                                    class="social-media-icon"
                                    alt="GitHub"
                            /></a>
                        </td>
                        <td>
                            <a
                                href="https://www.youtube.com/@eastonseidel5024"
                                target="_blank"
                                ><img
                                    src="/IMG/youtube.png"
                                    class="social-media-icon"
                                    alt="YouTube"
                            /></a>
                        </td>
                    </tr>
                </table>

                <div class="recent-blog-posts">
                    <h3>Recent Blog Posts</h3>
                    <div id="blog-posts">
                        <!-- Posts will be loaded here -->
                    </div>
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
