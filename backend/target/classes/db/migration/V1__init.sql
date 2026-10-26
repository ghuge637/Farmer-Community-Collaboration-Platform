-- Create users table
CREATE TABLE users (
  id serial PRIMARY KEY,
  email varchar(255) UNIQUE,
  name varchar(255),
  password varchar(255),
  bio text,
  avatar_color varchar(32)
);

-- Create posts & comments and a join table for likes
CREATE TABLE posts (
  id serial PRIMARY KEY,
  content text,
  created_at timestamp,
  author_id integer REFERENCES users(id)
);

CREATE TABLE comments (
  id serial PRIMARY KEY,
  text text,
  author_name varchar(255),
  created_at timestamp,
  post_id integer REFERENCES posts(id)
);

CREATE TABLE post_likes (
  post_id integer REFERENCES posts(id),
  user_id integer REFERENCES users(id),
  PRIMARY KEY (post_id, user_id)
);

-- Seed users
INSERT INTO users (email, name, password, bio, avatar_color) VALUES ('you@example.com','You','$2a$10$eImiTXuWVxfM37uY4JANjQ==','Demo user','\#60a5fa') ON CONFLICT DO NOTHING;
