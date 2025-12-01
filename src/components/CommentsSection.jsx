import React, { useState, useEffect } from "react";

function CommentsSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    author_name: "",
    author_email: "",
    content: "",
  });

  useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId]);

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/comments/${postId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blog_post_id: postId,
          author_name: formData.author_name,
          author_email: formData.author_email || null,
          content: formData.content,
        }),
      });

      if (response.ok) {
        setMessage("Comment submitted successfully! It will appear after approval.");
        setFormData({
          author_name: "",
          author_email: "",
          content: "",
        });
        setShowForm(false);
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error || "Failed to submit comment"}`);
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      setMessage("Error: Failed to submit comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="mt-8 pt-8 border-t border-gray-600">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white text-xl sm:text-2xl m-0">Comments</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-white text-gray-900 px-4 py-2 border-none rounded cursor-pointer font-bold text-sm hover:bg-gray-300"
          >
            Add Comment
          </button>
        )}
      </div>

      {/* Comment Form */}
      {showForm && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white text-lg m-0">Leave a Comment</h3>
            <button
              onClick={() => {
                setShowForm(false);
                setMessage("");
                setFormData({
                  author_name: "",
                  author_email: "",
                  content: "",
                });
              }}
              className="text-gray-400 hover:text-white text-sm"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="author_name"
                className="block mb-1 text-white text-sm font-medium"
              >
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="author_name"
                name="author_name"
                required
                value={formData.author_name}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-600 rounded bg-[#1a1a1a] text-white font-sans box-border focus:outline-none focus:border-white"
                placeholder="Your name"
              />
            </div>
            <div>
              <label
                htmlFor="author_email"
                className="block mb-1 text-white text-sm font-medium"
              >
                Email (optional)
              </label>
              <input
                type="email"
                id="author_email"
                name="author_email"
                value={formData.author_email}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-600 rounded bg-[#1a1a1a] text-white font-sans box-border focus:outline-none focus:border-white"
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="content"
                className="block mb-1 text-white text-sm font-medium"
              >
                Comment <span className="text-red-400">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                required
                value={formData.content}
                onChange={handleChange}
                rows="5"
                className="w-full p-2.5 border border-gray-600 rounded bg-[#1a1a1a] text-white font-sans box-border focus:outline-none focus:border-white resize-y"
                placeholder="Write your comment here..."
              />
            </div>
            {message && (
              <div
                className={`p-3 rounded ${
                  message.includes("Error")
                    ? "bg-red-600 text-white"
                    : "bg-green-600 text-white"
                }`}
              >
                {message}
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-white text-gray-900 px-6 py-3 border-none rounded cursor-pointer font-bold text-base hover:bg-gray-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Comment"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setMessage("");
                  setFormData({
                    author_name: "",
                    author_email: "",
                    content: "",
                  });
                }}
                className="bg-gray-600 text-white px-6 py-3 border-none rounded cursor-pointer font-bold text-base hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Comments List */}
      <div>
        <h3 className="text-white text-lg mb-4">
          {loading
            ? "Loading comments..."
            : comments.length === 0
            ? "No comments yet. Be the first to comment!"
            : `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`}
        </h3>
        {!loading && comments.length > 0 && (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="pb-6 border-b border-gray-700 last:border-b-0 last:pb-0"
              >
                <div className="mb-2">
                  <span className="text-white font-semibold">
                    {comment.author_name}
                  </span>
                  <span className="text-gray-500 text-sm ml-3">
                    {new Date(comment.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed m-0">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentsSection;


