import React, { useState, useEffect } from "react";

function CommentsApprovalPanel() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'pending', 'approved'

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/comments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        setMessage("Error: Failed to load comments");
      }
    } catch (error) {
      console.error("Error loading comments:", error);
      setMessage("Error: Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (commentId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/comments/${commentId}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage("Comment approved successfully!");
        loadComments(); // Reload comments
        setTimeout(() => setMessage(""), 3000);
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error || "Failed to approve comment"}`);
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (error) {
      console.error("Error approving comment:", error);
      setMessage("Error: Failed to approve comment");
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage("Comment deleted successfully!");
        loadComments(); // Reload comments
        setTimeout(() => setMessage(""), 3000);
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error || "Failed to delete comment"}`);
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      setMessage("Error: Failed to delete comment");
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const filteredComments =
    filter === "all"
      ? comments
      : filter === "pending"
      ? comments.filter((c) => !c.approved)
      : comments.filter((c) => c.approved);

  const pendingCount = comments.filter((c) => !c.approved).length;
  const approvedCount = comments.filter((c) => c.approved).length;

  if (loading) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-300 text-sm">Loading comments...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <h3 className="text-white text-base mb-2">
          Comments Management
        </h3>
        {message && (
          <div
            className={`mb-2 p-2 rounded text-sm ${
              message.includes("Error")
                ? "bg-red-600 text-white"
                : "bg-green-600 text-white"
            }`}
          >
            {message}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-3 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              filter === "all"
                ? "bg-white text-gray-900"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            All ({comments.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              filter === "pending"
                ? "bg-yellow-600 text-white"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              filter === "approved"
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            Approved ({approvedCount})
          </button>
        </div>
      </div>

      {/* Comments List */}
      {filteredComments.length === 0 ? (
        <div className="text-center p-4">
          <p className="text-gray-300 text-sm">
            {filter === "pending"
              ? "No pending comments"
              : filter === "approved"
              ? "No approved comments"
              : "No comments yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="bg-[#1a1a1a] p-3 rounded border border-gray-600"
            >
              <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white font-medium text-sm">
                      {comment.author_name}
                    </span>
                    {comment.author_email && (
                      <span className="text-gray-400 text-xs">
                        ({comment.author_email})
                      </span>
                    )}
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        comment.approved
                          ? "bg-green-600 text-white"
                          : "bg-yellow-600 text-white"
                      }`}
                    >
                      {comment.approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs mb-1">
                    Post:{" "}
                    <span className="text-gray-300">
                      {comment.blog_post_title || `ID: ${comment.blog_post_id}`}
                    </span>
                  </p>
                  <p className="text-gray-500 text-xs">
                    {new Date(comment.created_at).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {!comment.approved && (
                    <button
                      onClick={() => handleApprove(comment.id)}
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-700">
                <p className="text-gray-300 whitespace-pre-wrap leading-normal m-0 text-sm">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentsApprovalPanel;


