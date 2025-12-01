-- Drop existing tables if they exist
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS blog_posts;
DROP TABLE IF EXISTS users;

-- Create blog_posts table with ID
CREATE TABLE blog_posts (
	id SERIAL PRIMARY KEY,
	title varchar(64),
	summary varchar(128),
	excerpt varchar,
	created_at timestamp not null default CURRENT_TIMESTAMP
);

-- Create users table for admin authentication
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	username varchar(50) UNIQUE NOT NULL,
	password_hash varchar(255) NOT NULL,
	created_at timestamp not null default CURRENT_TIMESTAMP
);

-- Create comments table
CREATE TABLE comments (
	id SERIAL PRIMARY KEY,
	blog_post_id integer NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
	author_name varchar(100) NOT NULL,
	author_email varchar(255),
	content text NOT NULL,
	approved boolean NOT NULL DEFAULT false,
	created_at timestamp not null default CURRENT_TIMESTAMP
);

-- Create index on blog_post_id for faster queries
CREATE INDEX idx_comments_blog_post_id ON comments(blog_post_id);

-- Create index on approved for admin queries
CREATE INDEX idx_comments_approved ON comments(approved);
