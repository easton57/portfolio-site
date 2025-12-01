import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import AvailableImagesList from "./AvailableImagesList";
import CommentsApprovalPanel from "./CommentsApprovalPanel";
import { useTheme } from "../contexts/ThemeContext";

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("new");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState("");
  const [newContent, setNewContent] = useState("");
  const [editContent, setEditContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUploadTrigger, setImageUploadTrigger] = useState(0);
  const [themeMessage, setThemeMessage] = useState("");
  const [customThemeColors, setCustomThemeColors] = useState({});
  const navigate = useNavigate();
  const { theme, themes, changeTheme, customColors } = useTheme();
  
  // Initialize custom colors when theme is custom
  useEffect(() => {
    if (theme === 'custom' && customColors) {
      setCustomThemeColors(customColors);
    } else if (theme === 'custom') {
      // Initialize with dark theme colors as default
      setCustomThemeColors(themes.dark.colors);
    }
  }, [theme, customColors, themes]);
  
  // Determine MDEditor color mode based on theme
  const editorColorMode = theme === "light" ? "light" : "dark";

  // Image handling functions
  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    if (url) {
      setImagePreview(url);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const validFiles = [];
      const invalidFiles = [];
      
      files.forEach(file => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          invalidFiles.push(`${file.name} - not an image file`);
          return;
        }
        
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          invalidFiles.push(`${file.name} - file too large (max 5MB)`);
          return;
        }
        
        validFiles.push(file);
      });
      
      if (invalidFiles.length > 0) {
        setSubmitMessage(`Error: ${invalidFiles.join(', ')}`);
      }
      
      if (validFiles.length > 0) {
        setUploadedImages(validFiles);
        
        // Create preview for first file
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(validFiles[0]);
      }
    }
  };

  const uploadImageToServer = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("authToken");

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await fetch("/api/upload-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        // Check if response has content before trying to parse JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          return data.imageUrl;
        } else {
          // If not JSON, try to get text response
          const text = await response.text();
          console.error("Server returned non-JSON response:", text);
          throw new Error("Server returned invalid response format");
        }
      } else {
        // Try to parse error response as JSON, fallback to text
        try {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        } catch (jsonError) {
          const text = await response.text();
          throw new Error(`Upload failed: ${text || response.statusText}`);
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setSubmitMessage(`Error: ${error.message}`);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const insertImageIntoEditor = async (editorContent, setEditorContent) => {
    let imageUrlsToUse = [];
    
    // If we have uploaded files, upload them first
    if (uploadedImages.length > 0) {
      for (const file of uploadedImages) {
        const imageUrl = await uploadImageToServer(file);
        if (imageUrl) {
          imageUrlsToUse.push(imageUrl);
        }
      }
    } else if (uploadedImage) {
      const imageUrl = await uploadImageToServer(uploadedImage);
      if (imageUrl) {
        imageUrlsToUse.push(imageUrl);
      }
    } else if (imageUrl) {
      imageUrlsToUse.push(imageUrl);
    }
    
    if (imageUrlsToUse.length > 0) {
      const imageMarkdowns = imageUrlsToUse.map(url => `![Image](${url})`).join('\n');
      const newContent = editorContent + '\n' + imageMarkdowns;
      setEditorContent(newContent);
      setImageUrl("");
      setImagePreview("");
      setUploadedImage(null);
      setUploadedImages([]);
      
      // Trigger refresh of available images list
      setImageUploadTrigger(prev => prev + 1);
    }
  };

  const handleImageInsert = (imageMarkdown, editorContent, setEditorContent) => {
    const newContent = editorContent + '\n' + imageMarkdown;
    setEditorContent(newContent);
  };

  const clearNewForm = () => {
    document.getElementById("newForm").reset();
    setNewContent("");
    setImageUrl("");
    setImagePreview("");
    setUploadedImage(null);
    setUploadedImages([]);
  };

  const clearEditForm = () => {
    document.getElementById("editForm").reset();
    setEditContent("");
    setImageUrl("");
    setImagePreview("");
    setUploadedImage(null);
    setUploadedImages([]);
    setSelectedPostId("");
    document.getElementById("editContentSelect").value = "";
    document.getElementById("editForm").style.display = "none";
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated]);

  const checkAuthentication = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("/api/verify-token", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.valid) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("authToken");
        navigate("/login");
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      localStorage.removeItem("authToken");
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/all-posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const createPost = async (formData) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitMessage("Post created successfully!");
        // Clear form
        clearNewForm();
        // Refresh posts list
        fetchPosts();
      } else {
        const error = await response.json();
        setSubmitMessage(`Error: ${error.error || "Failed to create post"}`);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      setSubmitMessage("Error: Failed to create post");
    }
  };

  const updatePost = async (postId, formData) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(`/api/blogs/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitMessage("Post updated successfully!");
        // Refresh posts list
        fetchPosts();
      } else {
        const error = await response.json();
        setSubmitMessage(`Error: ${error.error || "Failed to update post"}`);
      }
    } catch (error) {
      console.error("Error updating post:", error);
      setSubmitMessage("Error: Failed to update post");
    }
  };

  const handleNewSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    const formData = {
      title: e.target.title.value,
      summary: e.target.summary.value,
      excerpt: newContent,
    };

    await createPost(formData);
    setIsSubmitting(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPostId) {
      setSubmitMessage("Please select a post to edit");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    const formData = {
      title: e.target.title.value,
      summary: e.target.summary.value,
      excerpt: editContent,
    };

    await updatePost(selectedPostId, formData);
    setIsSubmitting(false);
  };

  const handlePostSelect = async (e) => {
    const postId = e.target.value;
    setSelectedPostId(postId);

    if (postId) {
      try {
        const response = await fetch(`/api/blog/${postId}`);
        if (response.ok) {
          const post = await response.json();
          // Populate edit form
          document.getElementById("editTitle").value = post.title;
          document.getElementById("editSummary").value = post.summary;
          setEditContent(post.excerpt || "");
          document.getElementById("editForm").style.display = "block";
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    } else {
      document.getElementById("editForm").style.display = "none";
    }
  };

  if (isLoading) {
    return (
      <div
        id="authOverlay"
        className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 flex justify-center items-center z-[1000]"
      >
        <div className="bg-[var(--color-background)] p-10 rounded-md text-center text-[var(--color-text)]">
          <div className="loading-spinner"></div>
          <h3 className="m-0 mb-5 text-xl">Checking authentication...</h3>
          <p className="m-0 mb-5 text-[var(--color-textSecondary)]">
            Please wait while we verify your access.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-full">
      <div
        className={`flex gap-5 my-5 w-full box-border admin-content ${
          isAuthenticated ? "authenticated" : ""
        }`}
        id="adminContent"
      >
        <div className="bg-[var(--color-surface)] p-3 sm:p-5 rounded-md flex-[0_0_100%] min-w-0 box-border">
          <div className="text-center mb-8">
            <h2 className="text-[var(--color-text)] m-0 text-xl sm:text-2xl">Admin Panel</h2>
            <p className="text-[var(--color-textSecondary)] mb-4 text-sm sm:text-base">
              Manage blog posts
            </p>
            <button
              className="bg-[var(--color-error)] text-[var(--color-text)] px-3 sm:px-4 py-2 border-none rounded cursor-pointer text-xs sm:text-sm ml-3 sm:ml-5 hover:bg-[var(--color-errorLight)]"
              id="logoutBtn"
              onClick={handleLogout}
            >
              Logout
            </button>
            {submitMessage && (
              <div
                className={`mt-4 p-3 rounded ${
                  submitMessage.includes("Error")
                    ? "bg-[var(--color-error)] text-[var(--color-text)]"
                    : "bg-[var(--color-success)] text-[var(--color-text)]"
                }`}
              >
                {submitMessage}
              </div>
            )}
          </div>

          <div className="my-5">
            <div className="flex border-b-2 border-[var(--color-border)] mb-5">
              <button
                className={`bg-[var(--color-surface)] text-[var(--color-textSecondary)] border-none px-6 py-3 cursor-pointer border-b-2 border-transparent text-base font-bold transition-all duration-300 hover:bg-[var(--color-surfaceSecondary)] hover:text-[var(--color-text)] ${
                  activeTab === "new"
                    ? "bg-[var(--color-surfaceSecondary)] text-[var(--color-text)] border-b-2 border-[var(--color-text)]"
                    : ""
                }`}
                onClick={() => setActiveTab("new")}
              >
                New
              </button>
              <button
                className={`bg-[var(--color-surface)] text-[var(--color-textSecondary)] border-none px-6 py-3 cursor-pointer border-b-2 border-transparent text-base font-bold transition-all duration-300 hover:bg-[var(--color-surfaceSecondary)] hover:text-[var(--color-text)] ${
                  activeTab === "edit"
                    ? "bg-[var(--color-surfaceSecondary)] text-[var(--color-text)] border-b-2 border-[var(--color-text)]"
                    : ""
                }`}
                onClick={() => setActiveTab("edit")}
              >
                Edit
              </button>
              <button
                className={`bg-[var(--color-surface)] text-[var(--color-textSecondary)] border-none px-6 py-3 cursor-pointer border-b-2 border-transparent text-base font-bold transition-all duration-300 hover:bg-[var(--color-surfaceSecondary)] hover:text-[var(--color-text)] ${
                  activeTab === "comments"
                    ? "bg-[var(--color-surfaceSecondary)] text-[var(--color-text)] border-b-2 border-[var(--color-text)]"
                    : ""
                }`}
                onClick={() => setActiveTab("comments")}
              >
                Comments
              </button>
              <button
                className={`bg-[var(--color-surface)] text-[var(--color-textSecondary)] border-none px-6 py-3 cursor-pointer border-b-2 border-transparent text-base font-bold transition-all duration-300 hover:bg-[var(--color-surfaceSecondary)] hover:text-[var(--color-text)] ${
                  activeTab === "theme"
                    ? "bg-[var(--color-surfaceSecondary)] text-[var(--color-text)] border-b-2 border-[var(--color-text)]"
                    : ""
                }`}
                onClick={() => setActiveTab("theme")}
              >
                Theme
              </button>
            </div>

            {activeTab === "new" && (
              <div id="newTab" className="block">
                <h3 className="text-[var(--color-text)] text-lg sm:text-xl mb-4">
                  Create New Blog Post
                </h3>
                <form
                  id="newForm"
                  className="bg-[var(--color-surface)] p-4 sm:p-8 rounded-md my-5"
                  onSubmit={handleNewSubmit}
                >
                  <div className="mb-5">
                    <label
                      htmlFor="newTitle"
                      className="block mb-1 font-bold text-[var(--color-text)]"
                    >
                      Title:
                    </label>
                    <input
                      type="text"
                      id="newTitle"
                      name="title"
                      required
                      className="w-full p-2.5 border border-[var(--color-border)] rounded bg-[var(--color-background)] text-[var(--color-text)] font-sans box-border focus:outline-none focus:border-[var(--color-text)]"
                    />
                  </div>
                  <div className="mb-5">
                    <label
                      htmlFor="newSummary"
                      className="block mb-1 font-bold text-[var(--color-text)]"
                    >
                      Summary:
                    </label>
                    <input
                      type="text"
                      id="newSummary"
                      name="summary"
                      required
                      className="w-full p-2.5 border border-[var(--color-border)] rounded bg-[var(--color-background)] text-[var(--color-text)] font-sans box-border focus:outline-none focus:border-[var(--color-text)]"
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block mb-1 font-bold text-[var(--color-text)]">
                      Add Image:
                    </label>

                    {/* File Upload Section */}
                    <div className="mb-3">
                      <label className="block mb-2 text-sm text-[var(--color-textSecondary)]">
                        Upload from local storage:
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="w-full p-2.5 border border-[var(--color-border)] rounded bg-[var(--color-background)] text-[var(--color-text)] font-sans box-border focus:outline-none focus:border-[var(--color-text)] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                      />
                      {isUploading && (
                        <div className="mt-2">
                          <div className="bg-[var(--color-surfaceSecondary)] rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-[var(--color-textSecondary)] mt-1">
                            Uploading image...
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* URL Input Section */}
                    <div className="mb-2">
                      <label className="block mb-2 text-sm text-[var(--color-textSecondary)]">
                        Or enter image URL:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="Enter image URL..."
                          value={imageUrl}
                          onChange={handleImageUrlChange}
                          className="flex-1 p-2.5 border border-[var(--color-border)] rounded bg-[var(--color-background)] text-[var(--color-text)] font-sans box-border focus:outline-none focus:border-[var(--color-text)]"
                        />
                        <button
                          type="button"
                          onClick={() => insertImageIntoEditor(newContent, setNewContent)}
                          disabled={!imageUrl && !uploadedImage && uploadedImages.length === 0}
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:bg-[var(--color-secondary)] disabled:cursor-not-allowed"
                        >
                          Insert Image{uploadedImages.length > 1 ? 's' : ''}
                        </button>
                      </div>
                    </div>
                    
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-xs max-h-32 object-contain border rounded"
                          onError={() => setImagePreview("")}
                        />
                        <div className="mt-1 text-xs text-[var(--color-textTertiary)]">
                          {uploadedImages.length > 0
                            ? `${uploadedImages.length} file(s) selected: ${uploadedImages.map(f => f.name).join(', ')}`
                            : uploadedImage
                            ? `Local file: ${uploadedImage.name}`
                            : "URL preview"}
                        </div>
                        {uploadedImages.length > 0 && (
                          <div className="mt-1 text-xs text-blue-400">
                            Will be uploaded to: <code>/uploads/</code>
                            {uploadedImages.map((file, index) => (
                              <div key={index} className="ml-2">
                                • <code>{file.name}</code>
                              </div>
                            ))}
                          </div>
                        )}
                        {uploadedImage && uploadedImages.length === 0 && (
                          <div className="mt-1 text-xs text-blue-400">
                            Will be uploaded to: <code>/uploads/{uploadedImage.name}</code>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Available Images List */}
                  <div className="mb-5">
                    <AvailableImagesList 
                      onImageInsert={(imageMarkdown) => handleImageInsert(imageMarkdown, newContent, setNewContent)}
                      refreshTrigger={imageUploadTrigger}
                    />
                  </div>
                  
                  <div className="mb-5">
                    <label
                      htmlFor="newExcerpt"
                      className="block mb-1 font-bold text-[var(--color-text)]"
                    >
                      Content:
                    </label>
                    <div className="bg-[var(--color-surface)] rounded border border-[var(--color-border)]">
                      <MDEditor
                        value={newContent}
                        onChange={setNewContent}
                        height={300}
                        data-color-mode={editorColorMode}
                        preview="edit"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-6 py-3 border-none rounded cursor-pointer font-bold text-base hover:bg-[var(--color-primaryHover)] disabled:bg-[var(--color-secondary)] disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Creating..." : "Create Post"}
                    </button>
                    <button
                      type="button"
                      onClick={clearNewForm}
                      className="bg-[var(--color-secondary)] text-[var(--color-text)] px-6 py-3 border-none rounded cursor-pointer font-bold text-base hover:bg-[var(--color-secondaryHover)]"
                    >
                      Clear Form
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "edit" && (
              <div id="editTab" className="block">
                <h3 className="text-[var(--color-text)] text-lg sm:text-xl mb-4">
                  Edit Existing Blog Post
                </h3>
                <div className="mb-5">
                  <label
                    htmlFor="editContentSelect"
                    className="block mb-1 font-bold text-[var(--color-text)]"
                  >
                    Select Post to Edit:
                  </label>
                  <select
                    id="editContentSelect"
                    onChange={handlePostSelect}
                    className="w-full p-2.5 border border-[var(--color-border)] rounded bg-[var(--color-background)] text-[var(--color-text)] font-sans box-border focus:outline-none focus:border-[var(--color-text)]"
                  >
                    <option value="">Select an item...</option>
                    {posts.map((post) => (
                      <option key={post.id} value={post.id}>
                        {post.title}
                      </option>
                    ))}
                  </select>
                </div>
                <form
                  id="editForm"
                  style={{ display: "none" }}
                  className="bg-[var(--color-surface)] p-4 sm:p-8 rounded-md my-5"
                  onSubmit={handleEditSubmit}
                >
                  <input type="hidden" id="editItemId" />
                  <input type="hidden" id="editItemType" />
                  <div className="mb-5">
                    <label
                      htmlFor="editTitle"
                      className="block mb-1 font-bold text-[var(--color-text)]"
                    >
                      Title:
                    </label>
                    <input
                      type="text"
                      id="editTitle"
                      name="title"
                      required
                      className="w-full p-2.5 border border-[var(--color-border)] rounded bg-[var(--color-background)] text-[var(--color-text)] font-sans box-border focus:outline-none focus:border-[var(--color-text)]"
                    />
                  </div>
                  <div className="mb-5">
                    <label
                      htmlFor="editSummary"
                      className="block mb-1 font-bold text-[var(--color-text)]"
                    >
                      Summary:
                    </label>
                    <input
                      type="text"
                      id="editSummary"
                      name="summary"
                      required
                      className="w-full p-2.5 border border-[var(--color-border)] rounded bg-[var(--color-background)] text-[var(--color-text)] font-sans box-border focus:outline-none focus:border-[var(--color-text)]"
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block mb-1 font-bold text-[var(--color-text)]">
                      Add Image:
                    </label>

                    {/* File Upload Section */}
                    <div className="mb-3">
                      <label className="block mb-2 text-sm text-[var(--color-textSecondary)]">
                        Upload from local storage:
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="w-full p-2.5 border border-[var(--color-border)] rounded bg-[var(--color-background)] text-[var(--color-text)] font-sans box-border focus:outline-none focus:border-[var(--color-text)] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                      />
                      {isUploading && (
                        <div className="mt-2">
                          <div className="bg-[var(--color-surfaceSecondary)] rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-[var(--color-textSecondary)] mt-1">
                            Uploading image...
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* URL Input Section */}
                    <div className="mb-2">
                      <label className="block mb-2 text-sm text-[var(--color-textSecondary)]">
                        Or enter image URL:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="Enter image URL..."
                          value={imageUrl}
                          onChange={handleImageUrlChange}
                          className="flex-1 p-2.5 border border-[var(--color-border)] rounded bg-[var(--color-background)] text-[var(--color-text)] font-sans box-border focus:outline-none focus:border-[var(--color-text)]"
                        />
                        <button
                          type="button"
                          onClick={() => insertImageIntoEditor(editContent, setEditContent)}
                          disabled={!imageUrl && !uploadedImage && uploadedImages.length === 0}
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:bg-[var(--color-secondary)] disabled:cursor-not-allowed"
                        >
                          Insert Image{uploadedImages.length > 1 ? 's' : ''}
                        </button>
                      </div>
                    </div>

                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-xs max-h-32 object-contain border rounded"
                          onError={() => setImagePreview("")}
                        />
                        <div className="mt-1 text-xs text-[var(--color-textTertiary)]">
                          {uploadedImages.length > 0
                            ? `${uploadedImages.length} file(s) selected: ${uploadedImages.map(f => f.name).join(', ')}`
                            : uploadedImage
                            ? `Local file: ${uploadedImage.name}`
                            : "URL preview"}
                        </div>
                        {uploadedImages.length > 0 && (
                          <div className="mt-1 text-xs text-blue-400">
                            Will be uploaded to: <code>/uploads/</code>
                            {uploadedImages.map((file, index) => (
                              <div key={index} className="ml-2">
                                • <code>{file.name}</code>
                              </div>
                            ))}
                          </div>
                        )}
                        {uploadedImage && uploadedImages.length === 0 && (
                          <div className="mt-1 text-xs text-blue-400">
                            Will be uploaded to: <code>/uploads/{uploadedImage.name}</code>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Available Images List */}
                  <div className="mb-5">
                    <AvailableImagesList 
                      onImageInsert={(imageMarkdown) => handleImageInsert(imageMarkdown, editContent, setEditContent)}
                      refreshTrigger={imageUploadTrigger}
                    />
                  </div>
                  
                  <div className="mb-5">
                    <label
                      htmlFor="editExcerpt"
                      className="block mb-1 font-bold text-[var(--color-text)]"
                    >
                      Content:
                    </label>
                    <div className="bg-[var(--color-surface)] rounded border border-[var(--color-border)]">
                      <MDEditor
                        value={editContent}
                        onChange={setEditContent}
                        height={300}
                        data-color-mode={editorColorMode}
                        preview="edit"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-6 py-3 border-none rounded cursor-pointer font-bold text-base hover:bg-[var(--color-primaryHover)] disabled:bg-[var(--color-secondary)] disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Updating..." : "Update Post"}
                    </button>
                    <button
                      type="button"
                      onClick={clearEditForm}
                      className="bg-[var(--color-secondary)] text-[var(--color-text)] px-6 py-3 border-none rounded cursor-pointer font-bold text-base hover:bg-[var(--color-secondaryHover)]"
                    >
                      Clear Form
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "comments" && (
              <div id="commentsTab" className="block">
                <CommentsApprovalPanel />
              </div>
            )}

            {activeTab === "theme" && (
              <div id="themeTab" className="block">
                <h3 className="text-[var(--color-text)] text-lg sm:text-xl mb-4">
                  Site Theme Settings
                </h3>
                <p className="text-[var(--color-textSecondary)] mb-4 text-sm">
                  Change the theme for the entire site. This will apply to all visitors.
                </p>
                
                {themeMessage && (
                  <div
                    className={`mb-4 p-3 rounded ${
                      themeMessage.includes("Error")
                        ? "bg-[var(--color-error)] text-[var(--color-text)]"
                        : "bg-[var(--color-success)] text-[var(--color-text)]"
                    }`}
                  >
                    {themeMessage}
                  </div>
                )}

                <div className="mb-5">
                  <label className="block mb-2 text-[var(--color-text)] font-bold">
                    Current Theme: <span className="text-[var(--color-textSecondary)]">{themes[theme]?.name || theme}</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.keys(themes).map((themeKey) => (
                      <button
                        key={themeKey}
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem("authToken");
                            const body = themeKey === 'custom' 
                              ? { theme: themeKey, customColors: customThemeColors }
                              : { theme: themeKey };
                            
                            const response = await fetch("/api/admin/theme", {
                              method: "PUT",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify(body),
                            });

                            if (response.ok) {
                              setThemeMessage(`Theme changed to ${themes[themeKey].name} successfully!`);
                              changeTheme(themeKey, themeKey === 'custom' ? customThemeColors : null);
                              setTimeout(() => setThemeMessage(""), 3000);
                            } else {
                              const error = await response.json();
                              setThemeMessage(`Error: ${error.error || "Failed to change theme"}`);
                              setTimeout(() => setThemeMessage(""), 5000);
                            }
                          } catch (error) {
                            console.error("Error changing theme:", error);
                            setThemeMessage("Error: Failed to change theme");
                            setTimeout(() => setThemeMessage(""), 5000);
                          }
                        }}
                        className={`p-4 rounded border-2 transition-all ${
                          theme === themeKey
                            ? "border-[var(--color-text)] bg-[var(--color-surfaceSecondary)]"
                            : "border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-borderLight)]"
                        }`}
                      >
                        <div className="text-[var(--color-text)] font-semibold mb-2">{themes[themeKey].name}</div>
                        <div className="flex gap-1">
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: themes[themeKey].colors.background }}
                            title="Background"
                          />
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: themes[themeKey].colors.surface }}
                            title="Surface"
                          />
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: themes[themeKey].colors.primary }}
                            title="Primary"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Palette Editor */}
                {theme === 'custom' && (
                  <div className="mt-6 p-4 bg-[var(--color-background)] rounded border border-[var(--color-border)]">
                    <h4 className="text-[var(--color-text)] text-base font-bold mb-4">
                      Custom Color Palette
                    </h4>
                    <p className="text-[var(--color-textSecondary)] text-sm mb-4">
                      Customize each color in your theme. Changes are saved automatically when you select the Custom theme.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.keys(themes.dark.colors).map((colorKey) => (
                        <div key={colorKey} className="flex items-center gap-3">
                          <label className="text-[var(--color-text)] text-sm font-medium min-w-[120px] capitalize">
                            {colorKey.replace(/([A-Z])/g, ' $1').trim()}:
                          </label>
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="color"
                              value={customThemeColors[colorKey] || themes.dark.colors[colorKey]}
                              onChange={(e) => {
                                const newColors = { ...customThemeColors, [colorKey]: e.target.value };
                                setCustomThemeColors(newColors);
                                // Auto-save when custom theme is active
                                if (theme === 'custom') {
                                  const token = localStorage.getItem("authToken");
                                  fetch("/api/admin/theme", {
                                    method: "PUT",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({ theme: 'custom', customColors: newColors }),
                                  }).then(() => {
                                    changeTheme('custom', newColors);
                                  }).catch(err => console.error("Error saving custom colors:", err));
                                }
                              }}
                              className="w-12 h-8 rounded border border-[var(--color-border)] cursor-pointer"
                            />
                            <input
                              type="text"
                              value={customThemeColors[colorKey] || themes.dark.colors[colorKey]}
                              onChange={(e) => {
                                const newColors = { ...customThemeColors, [colorKey]: e.target.value };
                                setCustomThemeColors(newColors);
                                // Auto-save when custom theme is active
                                if (theme === 'custom') {
                                  const token = localStorage.getItem("authToken");
                                  fetch("/api/admin/theme", {
                                    method: "PUT",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({ theme: 'custom', customColors: newColors }),
                                  }).then(() => {
                                    changeTheme('custom', newColors);
                                  }).catch(err => console.error("Error saving custom colors:", err));
                                }
                              }}
                              className="flex-1 px-2 py-1 border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-mono"
                              placeholder="#000000"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem("authToken");
                            const response = await fetch("/api/admin/theme", {
                              method: "PUT",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({ theme: 'custom', customColors: customThemeColors }),
                            });

                            if (response.ok) {
                              setThemeMessage("Custom colors saved successfully!");
                              changeTheme('custom', customThemeColors);
                              setTimeout(() => setThemeMessage(""), 3000);
                            } else {
                              const error = await response.json();
                              setThemeMessage(`Error: ${error.error || "Failed to save colors"}`);
                              setTimeout(() => setThemeMessage(""), 5000);
                            }
                          } catch (error) {
                            console.error("Error saving custom colors:", error);
                            setThemeMessage("Error: Failed to save custom colors");
                            setTimeout(() => setThemeMessage(""), 5000);
                          }
                        }}
                        className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-4 py-2 rounded text-sm font-bold hover:bg-[var(--color-primaryHover)]"
                      >
                        Save Custom Colors
                      </button>
                      <button
                        onClick={() => {
                          setCustomThemeColors(themes.dark.colors);
                        }}
                        className="bg-[var(--color-secondary)] text-[var(--color-text)] px-4 py-2 rounded text-sm font-bold hover:bg-[var(--color-secondaryHover)]"
                      >
                        Reset to Dark Theme
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
