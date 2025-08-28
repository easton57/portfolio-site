export function createAboutPage() {
  return `
    <div class="content">
        <a href="#"><h1>Easton Seidel</h1></a>

        <nav class="navbar">
            <ul>
                <li><a href="#about">About</a></li>
                <li><a href="#blog">Blog</a></li>
            </ul>
        </nav>

        <h2>About</h2>

        <div class="main-content full-width">
            <div class="content-body">
                <div class="about-grid">
                    <div class="about-section">
                        <img src="/IMG/meAndWife.jpg" alt="Easton and Wife" />
                        <p>
                            If you'd like to contact me, you can use the
                            form to the right or reach out on any of the
                            social media links on the home page. The contact
                            form is the best way as I don't monitor social
                            media regularly.
                        </p>
                        <br />
                        <br />
                        <p>
                            I'm open to any and all offers for work or
                            colaboration if my skill set matches your needs.
                            While I'd like to start moving into professional
                            development, my primary roles have been in
                            Systems Administration. I have extensive
                            experience implementing new services and
                            managing those services and their hosts in a
                            professional and personal capacity in my own
                            homelab. Refer to the experience page or contact
                            me for more information.
                        </p>
                    </div>
                    <div class="contact-section">
                        <h3>Contact Me</h3>
                        <form id="contact-form">
                            <div class="form-group">
                                <label for="name">Name:</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                />
                            </div>
                            <div class="form-group">
                                <label for="email">Email:</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                />
                            </div>
                            <div class="form-group">
                                <label for="message">Message:</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                ></textarea>
                            </div>
                            <div class="form-group">
                                <div
                                    class="g-recaptcha"
                                    data-sitekey="6LdDdHMrAAAAACAFBXAti9TAy03E3RHmcaxKYpZJ"
                                ></div>
                            </div>
                            <button type="submit">Send Message</button>
                        </form>
                        <div id="form-status"></div>
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
