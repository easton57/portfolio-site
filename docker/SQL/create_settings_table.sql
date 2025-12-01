-- Create settings table for site-wide configuration
CREATE TABLE IF NOT EXISTS settings (
	id SERIAL PRIMARY KEY,
	key varchar(100) UNIQUE NOT NULL,
	value text NOT NULL,
	updated_at timestamp not null default CURRENT_TIMESTAMP
);

-- Insert default theme setting if it doesn't exist
INSERT INTO settings (key, value) 
VALUES ('theme', 'dark')
ON CONFLICT (key) DO NOTHING;

