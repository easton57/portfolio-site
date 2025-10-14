import React, { useState } from 'react'
import meAndWifeImg from '../img/meAndWife.jpg'

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
    <div className="w-full">
      <h2 className="text-white text-xl sm:text-2xl font-bold mb-5">About</h2>
      <div className="flex flex-col lg:flex-row gap-5 my-5 w-full box-border">
        <div className="bg-[#2d2d2d] p-5 rounded-md flex-[1] min-w-0 box-border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="about-section">
              <img src={meAndWifeImg} alt="Easton and his wife" className="max-w-[200px] block h-auto float-left mr-5 mb-2.5 clear-left" />
              <p className="m-0 overflow-hidden inline text-white">
                If you'd like to contact me, you can use the
                form to the right or reach out on any of the
                social media links on the home page. The contact
                form is the best way as I don't monitor social
                media regularly.
              </p>
              <br />
              <br />
              <p className="m-0 overflow-hidden inline text-white">
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
              <h3 className="text-white text-lg sm:text-xl font-bold mb-4">Contact Me</h3>
              <form id="contact-form" onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block mb-1 text-white font-bold">Name:</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full p-2 border border-gray-600 rounded bg-[#2d2d2d] text-white"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block mb-1 text-white font-bold">Email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full p-2 border border-gray-600 rounded bg-[#2d2d2d] text-white"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="message" className="block mb-1 text-white font-bold">Message:</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    className="w-full p-2 border border-gray-600 rounded bg-[#2d2d2d] text-white h-36 resize-y"
                  ></textarea>
                </div>
                <div className="mb-4">
                  <div
                    className="g-recaptcha"
                    data-sitekey="6LdDdHMrAAAAACAFBXAti9TAy03E3RHmcaxKYpZJ"
                  ></div>
                </div>
                <button type="submit" className="bg-green-500 text-white px-5 py-2.5 border-none rounded cursor-pointer text-base hover:bg-green-600">Send Message</button>
              </form>
              <div id="form-status" className="mt-4 p-2.5 rounded">{status}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
