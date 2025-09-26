import React, { useState } from 'react'

function About() {
  const [status, setStatus] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Check if grecaptcha is available
    if (typeof grecaptcha === "undefined") {
      setStatus("reCAPTCHA is not loaded. Please refresh the page and try again.")
      return
    }

    const captchaResponse = grecaptcha.enterprise.getResponse()

    if (!captchaResponse) {
      setStatus("Please complete the CAPTCHA")
      return
    }

    setStatus("Sending...")

    // Send form data with reCAPTCHA token to backend
    const formData = {
      from_name: e.target.name.value,
      from_email: e.target.email.value,
      message: e.target.message.value,
      recaptchaResponse: captchaResponse,
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setStatus("Message sent successfully!")
        e.target.reset()
        if (typeof grecaptcha !== "undefined") {
          grecaptcha.enterprise.reset()
        }
      } else {
        setStatus(result.error || "Failed to send message. Please try again.")
        if (typeof grecaptcha !== "undefined") {
          grecaptcha.enterprise.reset()
        }
      }
    } catch (error) {
      setStatus("Failed to send message. Please try again.")
      if (typeof grecaptcha !== "undefined") {
        grecaptcha.enterprise.reset()
      }
    }
  }

  return (
    <>
      <h2>About</h2>
      <div className="main-content full-width">
        <div className="content-body">
          <div className="about-grid">
            <div className="about-section">
              <img src="/img/meAndWife.jpg" alt="Easton and his wife" />
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
            <div className="contact-section">
              <h3>Contact Me</h3>
              <form id="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name:</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message:</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <div
                    className="g-recaptcha"
                    data-sitekey="6LdDdHMrAAAAACAFBXAti9TAy03E3RHmcaxKYpZJ"
                  ></div>
                </div>
                <button type="submit">Send Message</button>
              </form>
              <div id="form-status">{status}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default About
