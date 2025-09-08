document
    .getElementById("contact-form")
    .addEventListener("submit", async function (e) {
        e.preventDefault();

        const statusDiv = document.getElementById("form-status");

        // Check if grecaptcha is available
        if (typeof grecaptcha === "undefined") {
            statusDiv.textContent =
                "reCAPTCHA is not loaded. Please refresh the page and try again.";
            return;
        }

        const captchaResponse = grecaptcha.enterprise.getResponse();

        if (!captchaResponse) {
            statusDiv.textContent = "Please complete the CAPTCHA";
            return;
        }

        statusDiv.textContent = "Sending...";

        // Send form data with reCAPTCHA token to backend
        const formData = {
            from_name: document.getElementById("name").value,
            from_email: document.getElementById("email").value,
            message: document.getElementById("message").value,
            recaptchaResponse: captchaResponse,
        };

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                statusDiv.textContent =
                    "Message sent successfully!";
                document.getElementById("contact-form").reset();
                if (typeof grecaptcha !== "undefined") {
                    grecaptcha.enterprise.reset();
                }
            } else {
                statusDiv.textContent =
                    result.error ||
                    "Failed to send message. Please try again.";
                if (typeof grecaptcha !== "undefined") {
                    grecaptcha.enterprise.reset();
                }
            }
        } catch (error) {
            statusDiv.textContent =
                "Failed to send message. Please try again.";
            if (typeof grecaptcha !== "undefined") {
                grecaptcha.enterprise.reset();
            }
        }
    });