-- Drop existing tables if they exist
DROP TABLE IF EXISTS blog_posts;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;

-- Create blog_posts table with ID
CREATE TABLE blog_posts (
	id SERIAL PRIMARY KEY,
	title varchar(64),
	summary varchar(128),
	excerpt varchar,
	created_at timestamp not null default CURRENT_TIMESTAMP
);

-- Create projects table with ID
CREATE TABLE projects (
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
