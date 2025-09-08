// Tab functionality
document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
        const tabName = this.dataset.tab;

        // Remove active class from all buttons
        document
            .querySelectorAll(".tab-btn")
            .forEach((b) => b.classList.remove("active"));
        // Add active class to clicked button
        this.classList.add("active");

        // Hide all tab contents
        document
            .querySelectorAll(".tab-content")
            .forEach((content) => {
                content.style.display = "none";
            });

        // Show selected tab content
        document.getElementById(tabName + "Tab").style.display =
            "block";
    });
});

// Edit tab functionality
document
    .getElementById("editContentType")
    .addEventListener("change", async function () {
        const contentType = this.value;
        const editContentSelect =
            document.getElementById("editContentSelect");
        const editForm = document.getElementById("editForm");

        // Reset and disable content select
        editContentSelect.innerHTML =
            '<option value="">Select an item...</option>';
        editContentSelect.disabled = true;
        editForm.style.display = "none";

        if (!contentType) return;

        try {
            const token = localStorage.getItem("authToken");
            const endpoint = "/api/all-posts";

            const response = await fetch(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const items = await response.json();

                items.forEach((item) => {
                    const option = document.createElement("option");
                    option.value = item.id;
                    option.textContent = item.title;
                    option.dataset.type = contentType;
                    editContentSelect.appendChild(option);
                });

                editContentSelect.disabled = false;
            } else {
                console.error("Failed to fetch items");
            }
        } catch (error) {
            console.error("Error fetching items:", error);
        }
    });

document
    .getElementById("editContentSelect")
    .addEventListener("change", async function () {
        const itemId = this.value;
        const itemType =
            document.getElementById("editContentType").value;
        const editForm = document.getElementById("editForm");

        if (!itemId || !itemType) {
            editForm.style.display = "none";
            return;
        }

        try {
            const token = localStorage.getItem("authToken");
            const endpoint = `/api/blog/${itemId}`;

            const response = await fetch(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const item = await response.json();

                // Fill the form with existing data
                document.getElementById("editItemId").value =
                    item.id;
                document.getElementById("editItemType").value =
                    itemType;
                document.getElementById("editTitle").value =
                    item.title;
                document.getElementById("editSummary").value =
                    item.summary;
                document.getElementById("editExcerpt").value =
                    item.excerpt;

                editForm.style.display = "block";
            } else {
                console.error("Failed to fetch item details");
            }
        } catch (error) {
            console.error("Error fetching item details:", error);
        }
    });

// Edit form submission
document
    .getElementById("editForm")
    .addEventListener("submit", async function (e) {
        e.preventDefault();

        const editSubmitBtn =
            document.getElementById("editSubmitBtn");
        const statusMessage =
            document.getElementById("statusMessage");

        // Disable submit button and show loading state
        editSubmitBtn.disabled = true;
        editSubmitBtn.textContent = "Updating...";
        statusMessage.style.display = "none";

        const itemId = document.getElementById("editItemId").value;
        const itemType =
            document.getElementById("editItemType").value;
        const title = document.getElementById("editTitle").value;
        const summary =
            document.getElementById("editSummary").value;
        const excerpt =
            document.getElementById("editExcerpt").value;

        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                throw new Error("No authentication token found");
            }

            const endpoint = `/api/blogs/${itemId}`;

            const response = await fetch(endpoint, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: title,
                    summary: summary,
                    excerpt: excerpt,
                }),
            });

            if (response.ok) {
                statusMessage.textContent = `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} updated successfully!`;
                statusMessage.className =
                    "status-message status-success";
                statusMessage.style.display = "block";

                // Refresh the dropdown to show updated title
                document
                    .getElementById("editContentType")
                    .dispatchEvent(new Event("change"));
            } else {
                const errorData = await response.json();
                if (
                    response.status === 401 ||
                    response.status === 403
                ) {
                    localStorage.removeItem("authToken");
                    window.location.href = "login.html";
                    return;
                }
                throw new Error(
                    errorData.error || "Failed to update content",
                );
            }
        } catch (error) {
            console.error("Error:", error);
            if (
                error.message.includes("authentication") ||
                error.message.includes("token")
            ) {
                window.location.href = "login.html";
                return;
            }
            statusMessage.textContent = `Error: ${error.message}`;
            statusMessage.className = "status-message status-error";
            statusMessage.style.display = "block";
        } finally {
            editSubmitBtn.disabled = false;
            editSubmitBtn.textContent = "Update";
        }
    });

// Authentication check
async function checkAuthentication() {
    const token = localStorage.getItem("authToken");
    const authOverlay = document.getElementById("authOverlay");
    const adminContent = document.getElementById("adminContent");

    if (!token) {
        showAuthError(
            "Authentication required",
            "Please log in to access the admin panel.",
        );
        return false;
    }

    try {
        const response = await fetch("/api/verify-token", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.ok && data.valid) {
            // Authentication successful
            authOverlay.style.display = "none";
            adminContent.classList.add("authenticated");
            return true;
        } else {
            // Invalid token
            localStorage.removeItem("authToken");
            showAuthError(
                "Session expired",
                "Your session has expired. Please log in again.",
            );
            return false;
        }
    } catch (error) {
        console.error("Authentication check failed:", error);
        showAuthError(
            "Authentication error",
            "Unable to verify authentication. Please try again.",
        );
        return false;
    }
}

function showAuthError(title, message) {
    const authOverlay = document.getElementById("authOverlay");
    authOverlay.innerHTML = `
                    <div class="auth-message">
                        <h3>${title}</h3>
                        <p>${message}</p>
                        <a href="login.html">Go to Login</a>
                    </div>
                `;
}

// Logout functionality
document
    .getElementById("logoutBtn")
    .addEventListener("click", function () {
        localStorage.removeItem("authToken");
        window.location.href = "login.html";
    });

// Check authentication on page load
window.addEventListener("load", function () {
    checkAuthentication();
});

document
    .getElementById("adminForm")
    .addEventListener("submit", async function (e) {
        e.preventDefault();

        const submitBtn = document.getElementById("submitBtn");
        const statusMessage =
            document.getElementById("statusMessage");

        // Disable submit button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
        statusMessage.style.display = "none";

        // Get form data
        const formData = new FormData(this);
        const contentType = formData.get("contentType");
        const title = formData.get("title");
        const summary = formData.get("summary");
        const excerpt = formData.get("excerpt");

        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await fetch(`/api/${contentType}s`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: title,
                    summary: summary,
                    excerpt: excerpt,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                statusMessage.textContent = `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} created successfully!`;
                statusMessage.className =
                    "status-message status-success";
                statusMessage.style.display = "block";

                // Reset form
                this.reset();
            } else {
                const errorData = await response.json();
                if (
                    response.status === 401 ||
                    response.status === 403
                ) {
                    // Token expired or invalid
                    localStorage.removeItem("authToken");
                    window.location.href = "login.html";
                    return;
                }
                throw new Error(
                    errorData.error || "Failed to create content",
                );
            }
        } catch (error) {
            console.error("Error:", error);
            if (
                error.message.includes("authentication") ||
                error.message.includes("token")
            ) {
                window.location.href = "login.html";
                return;
            }
            statusMessage.textContent = `Error: ${error.message}`;
            statusMessage.className = "status-message status-error";
            statusMessage.style.display = "block";
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit";
        }
    });
