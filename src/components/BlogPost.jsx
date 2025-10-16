import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

function BlogPost() {
  const [searchParams] = useSearchParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBlogPost();
  }, []);

  const loadBlogPost = async () => {
    try {
      const postId = searchParams.get("id");

      if (!postId) {
        setError("Post not found");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/blog/${postId}`);

      if (!response.ok) {
        throw new Error("Post not found");
      }

      const postData = await response.json();
      setPost(postData);

      // Update the page title
      document.title = `${postData.title} - Easton Seidel`;
    } catch (error) {
      console.error("Error loading blog post:", error);
      setError("Error loading post");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex gap-5 my-5 w-full box-border">
          <div className="bg-[#2d2d2d] p-5 rounded-md flex-[0_0_100%] min-w-0 box-border">
            <div className="text-center p-10">
              <p className="text-gray-300">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="w-full">
        <div className="flex gap-5 my-5 w-full box-border">
          <div className="bg-[#2d2d2d] p-5 rounded-md flex-[0_0_100%] min-w-0 box-border">
            <div className="text-center p-10">
              <p className="text-gray-300">{error || "Post not found"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-5 my-5 w-full box-border">
      <div className="bg-[#2d2d2d] p-5 rounded-md flex-[0_0_100%] min-w-0 box-border">
        <div id="blog-post-content">
          <article className="max-w-full">
            <header className="mb-8 pb-5 border-b border-gray-600">
              <h1 className="m-0 mb-4 text-white text-2xl sm:text-4xl">
                {post.title}
              </h1>
              <div className="mb-4">
                <time
                  dateTime={post.created_at}
                  className="text-gray-500 text-sm"
                >
                  {new Date(post.created_at).toLocaleDateString()}
                </time>
              </div>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed m-0">
                {post.summary}
              </p>
            </header>
            <div className="text-white leading-loose text-sm sm:text-base prose prose-invert max-w-none">
              <ReactMarkdown>{post.excerpt}</ReactMarkdown>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

export default BlogPost;
