import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import meImg from "../img/me.jpg";

function Home() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    try {
      const response = await fetch("/api/recent-posts");
      const posts = await response.json();
      setBlogPosts(posts);
    } catch (error) {
      console.error("Error loading blog posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 my-5 w-full box-border items-start">
      <div className="bg-[var(--color-surface)] p-5 rounded-md w-full lg:flex-[1.3] min-w-0 box-border self-start">
        <img
          src={meImg}
          alt="Easton Seidel"
          className="max-w-[200px] block h-auto float-left mr-5 mb-2.5 clear-left"
        />
        <p className="m-0 overflow-hidden inline text-[var(--color-text)]">
          I'm Easton Seidel. I'm a Christian and Husband.
        </p>
        <br />
        <br />
        <p className="m-0 overflow-hidden inline text-[var(--color-text)]">
          In this blog, I will be sharing my thoughts and insights on the Bible as I study as well as share stories from my walk with God.
        </p>
        <br />
        <p className="m-0 overflow-hidden inline text-[var(--color-text)]">
          In addition to the Bible, I will share my thoughts and insights on my studies of other religious and philosophical texts. I believe it's important to understand the beliefs of others and that it will help me be a better tool in God's hands.
        </p>
        <br />
      </div>

      <div className="w-full lg:flex-[0.7] flex flex-col gap-5 min-w-0">
        <div className="bg-[var(--color-surface)] p-5 rounded-md w-full box-border">
          <h3 className="text-[var(--color-text)] text-lg font-bold mb-4">
            Recent Blog Posts
          </h3>
          <div id="blog-posts">
            {loading ? (
              <p className="text-[var(--color-textSecondary)]">Loading posts...</p>
            ) : blogPosts.length > 0 ? (
              blogPosts.map((post) => (
                <div
                  key={post.id}
                  className="mb-3 pb-3 border-b border-[var(--color-border)] last:border-b-0 last:mb-0 last:pb-0"
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <h5 className="m-0 text-[var(--color-text)] flex-1 pr-2">
                      <Link
                        to={`/blog-post?id=${post.id}`}
                        className="text-[var(--color-text)] no-underline hover:opacity-70"
                      >
                        {post.title}
                      </Link>
                    </h5>
                    <small className="text-[var(--color-textTertiary)] text-xs whitespace-nowrap">
                      {new Date(post.created_at).toLocaleDateString()}
                    </small>
                  </div>
                  <p className="m-0 text-[var(--color-textSecondary)]">{post.summary}</p>
                </div>
              ))
            ) : (
              <p className="text-[var(--color-textSecondary)]">No posts available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
