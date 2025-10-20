-- Add Users table for authentication
CREATE TABLE IF NOT EXISTS "User" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "passwordHash" VARCHAR(255) NOT NULL,
  "role" VARCHAR(50) NOT NULL DEFAULT 'guide',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "lastLoginAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");

-- Insert default admin user (password: admin123)
INSERT INTO "User" ("id", "email", "name", "passwordHash", "role", "active")
VALUES (
  gen_random_uuid(),
  'admin@yyd.tours',
  'Administrator',
  '$2b$10$rBV2KKkV9fFpBXZQfhXMVeYF.z9X5vU6HxUL3xzN7r0zYqGQm8V2m',
  'admin',
  true
)
ON CONFLICT (email) DO NOTHING;
