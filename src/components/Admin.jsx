import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import AvailableImagesList from "./AvailableImagesList";

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
  const navigate = useNavigate();

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
        <div className="bg-[#1a1a1a] p-10 rounded-md text-center text-white">
          <div className="loading-spinner"></div>
          <h3 className="m-0 mb-5 text-xl">Checking authentication...</h3>
          <p className="m-0 mb-5 text-gray-300">
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
        <div className="bg-[#2d2d2d] p-3 sm:p-5 rounded-md flex-[0_0_100%] min-w-0 box-border">
          <div className="text-center mb-8">
            <h2 className="text-white m-0 text-xl sm:text-2xl">Admin Panel</h2>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              Manage blog posts
            </p>
            <button
              className="bg-red-800 text-white px-3 sm:px-4 py-2 border-none rounded cursor-pointer text-xs sm:text-sm ml-3 sm:ml-5 hover:bg-red-700"
              id="logoutBtn"
              onClick={handleLogout}
            >
              Logout
            </button>
            {submitMessage && (
              <div
                className={`mt-4 p-3 rounded ${
                  submitMessage.includes("Error")
                    ? "bg-red-600 text-white"
                    : "bg-green-600 text-white"
                }`}
              >
                {submitMessage}
              </div>
            )}
          </div>

          <div className="my-5">
            <div className="flex border-b-2 border-gray-600 mb-5">
              <button
                className={`bg-[#2d2d2d] text-gray-300 border-none px-6 py-3 cursor-pointer border-b-2 border-transparent text-base font-bold transition-all duration-300 hover:bg-gray-800 hover:text-white ${
                  activeTab === "new"
                    ? "bg-gray-800 text-white border-b-2 border-white"
                    : ""
                }`}
                onClick={() => setActiveTab("new")}
              >
                New
              </button>
              <button
                className={`bg-[#2d2d2d] text-gray-300 border-none px-6 py-3 cursor-pointer border-b-2 border-transparent text-base font-bold transition-all duration-300 hover:bg-gray-800 hover:text-white ${
                  activeTab === "edit"
                    ? "bg-gray-800 text-white border-b-2 border-white"
                    : ""
                }`}
                onClick={() => setActiveTab("edit")}
              >
                Edit
              </button>
            </div>

            {activeTab === "new" && (
              <div id="newTab" className="block">
                <h3 className="text-white text-lg sm:text-xl mb-4">
                  Create New Blog Post
                </h3>
                <form
                  id="newForm"
                  className="bg-[#2d2d2d] p-4 sm:p-8 rounded-md my-5"
                  onSubmit={handleNewSubmit}
                >
                  <div className="mb-5">
                    <label
                      htmlFor="newTitle"
                      className="block mb-1 font-bold text-white"
                    >
                      Title:
                    </label>
                    <input
                      type="text"
                      id="newTitle"
                      name="title"
                      required
                      className="w-full p-2.5 border border-gray-600 rounded bg-[#1a1a1a] text-white font-sans box-border focus:outline-none focus:border-white"
                    />
                  </div>
                  <div className="mb-5">
                    <label
                      htmlFor="newSummary"
                      className="block mb-1 font-bold text-white"
                    >
                      Summary:
                    </label>
                    <input
                      type="text"
                      id="newSummary"
                      name="summary"
                      required
                      className="w-full p-2.5 border border-gray-600 rounded bg-[#1a1a1a] text-white font-sans box-border focus:outline-none focus:border-white"
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block mb-1 font-bold text-white">
                      Add Image:
                    </label>

                    {/* File Upload Section */}
                    <div className="mb-3">
                      <label className="block mb-2 text-sm text-gray-300">
                        Upload from local storage:
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="w-full p-2.5 border border-gray-600 rounded bg-[#1a1a1a] text-white font-sans box-border focus:outline-none focus:border-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                      />
                      {isUploading && (
                        <div className="mt-2">
                          <div className="bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-300 mt-1">
                            Uploading image...
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* URL Input Section */}
                    <div className="mb-2">
                      <label className="block mb-2 text-sm text-gray-300">
                        Or enter image URL:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="Enter image URL..."
                          value={imageUrl}
                          onChange={handleImageUrlChange}
                          className="flex-1 p-2.5 border border-gray-600 rounded bg-[#1a1a1a] text-white font-sans box-border focus:outline-none focus:border-white"
                        />
                        <button
                          type="button"
                          onClick={() => insertImageIntoEditor(newContent, setNewContent)}
                          disabled={!imageUrl && !uploadedImage && uploadedImages.length === 0}
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
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
                        <div className="mt-1 text-xs text-gray-400">
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
                      className="block mb-1 font-bold text-white"
                    >
                      Content:
                    </label>
                    <div className="bg-[#2d2d2d] rounded border border-gray-600">
                      <MDEditor
                        value={newContent}
                        onChange={setNewContent}
                        height={300}
                        data-color-mode="dark"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-white text-gray-900 px-6 py-3 border-none rounded cursor-pointer font-bold text-base hover:bg-gray-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Creating..." : "Create Post"}
                    </button>
                    <button
                      type="button"
                      onClick={clearNewForm}
                      className="bg-gray-600 text-white px-6 py-3 border-none rounded cursor-pointer font-bold text-base hover:bg-gray-500"
                    >
                      Clear Form
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "edit" && (
              <div id="editTab" className="block">
                <h3 className="text-white text-lg sm:text-xl mb-4">
                  Edit Existing Blog Post
                </h3>
                <div className="mb-5">
                  <label
                    htmlFor="editContentSelect"
                    className="block mb-1 font-bold text-white"
                  >
                    Select Post to Edit:
                  </label>
                  <select
                    id="editContentSelect"
                    onChange={handlePostSelect}
                    className="w-full p-2.5 border border-gray-600 rounded bg-[#1a1a1a] text-white font-sans box-border focus:outline-none focus:border-white"
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
                  className="bg-[#2d2d2d] p-4 sm:p-8 rounded-md my-5"
                  onSubmit={handleEditSubmit}
                >
                  <input type="hidden" id="editItemId" />
                  <input type="hidden" id="editItemType" />
                  <div className="mb-5">
                    <label
                      htmlFor="editTitle"
                      className="block mb-1 font-bold text-white"
                    >
                      Title:
                    </label>
                    <input
                      type="text"
                      id="editTitle"
                      name="title"
                      required
                      className="w-full p-2.5 border border-gray-600 rounded bg-[#1a1a1a] text-white font-sans box-border focus:outline-none focus:border-white"
                    />
                  </div>
                  <div className="mb-5">
                    <label
                      htmlFor="editSummary"
                      className="block mb-1 font-bold text-white"
                    >
                      Summary:
                    </label>
                    <input
                      type="text"
                      id="editSummary"
                      name="summary"
                      required
                      className="w-full p-2.5 border border-gray-600 rounded bg-[#1a1a1a] text-white font-sans box-border focus:outline-none focus:border-white"
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block mb-1 font-bold text-white">
                      Add Image:
                    </label>

                    {/* File Upload Section */}
                    <div className="mb-3">
                      <label className="block mb-2 text-sm text-gray-300">
                        Upload from local storage:
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="w-full p-2.5 border border-gray-600 rounded bg-[#1a1a1a] text-white font-sans box-border focus:outline-none focus:border-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                      />
                      {isUploading && (
                        <div className="mt-2">
                          <div className="bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-300 mt-1">
                            Uploading image...
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* URL Input Section */}
                    <div className="mb-2">
                      <label className="block mb-2 text-sm text-gray-300">
                        Or enter image URL:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="Enter image URL..."
                          value={imageUrl}
                          onChange={handleImageUrlChange}
                          className="flex-1 p-2.5 border border-gray-600 rounded bg-[#1a1a1a] text-white font-sans box-border focus:outline-none focus:border-white"
                        />
                        <button
                          type="button"
                          onClick={() => insertImageIntoEditor(editContent, setEditContent)}
                          disabled={!imageUrl && !uploadedImage && uploadedImages.length === 0}
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
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
                        <div className="mt-1 text-xs text-gray-400">
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
                      className="block mb-1 font-bold text-white"
                    >
                      Content:
                    </label>
                    <div className="bg-[#2d2d2d] rounded border border-gray-600">
                      <MDEditor
                        value={editContent}
                        onChange={setEditContent}
                        height={300}
                        data-color-mode="dark"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-white text-gray-900 px-6 py-3 border-none rounded cursor-pointer font-bold text-base hover:bg-gray-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Updating..." : "Update Post"}
                    </button>
                    <button
                      type="button"
                      onClick={clearEditForm}
                      className="bg-gray-600 text-white px-6 py-3 border-none rounded cursor-pointer font-bold text-base hover:bg-gray-500"
                    >
                      Clear Form
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
