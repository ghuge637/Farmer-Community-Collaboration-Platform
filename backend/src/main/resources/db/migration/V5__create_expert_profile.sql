-- Create expert_profile table linked to users
CREATE TABLE IF NOT EXISTS expert_profile (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(255),
    crop_expertise VARCHAR(255),
    years_of_experience INTEGER,
    region VARCHAR(255),
    bio TEXT,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_status VARCHAR(16) NOT NULL DEFAULT 'PENDING'
);
