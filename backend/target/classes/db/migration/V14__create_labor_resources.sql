CREATE TABLE IF NOT EXISTS labor_resource (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  role_mr VARCHAR(255) NOT NULL,
  experience_years INTEGER NOT NULL CHECK (experience_years >= 0),
  location VARCHAR(255) NOT NULL,
  status VARCHAR(16) NOT NULL CHECK (status IN ('AVAILABLE', 'BUSY')),
  phone VARCHAR(32) NOT NULL UNIQUE,
  avatar_color VARCHAR(32) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_labor_resource_enabled_order
  ON labor_resource (enabled, display_order);

INSERT INTO labor_resource (
  name,
  role,
  role_mr,
  experience_years,
  location,
  status,
  phone,
  avatar_color,
  enabled,
  display_order
) VALUES
  ('Ramesh Patil', 'General Farm Worker', 'शेतमजूर', 5, 'Pune', 'AVAILABLE', '919876543210', '#4caf50', TRUE, 1),
  ('Suresh Mane', 'Tractor Driver', 'ट्रॅक्टर चालक', 8, 'Nashik', 'BUSY', '919876543211', '#ff9800', TRUE, 2),
  ('Ganesh Koli', 'Harvester', 'कापणी कामगार', 3, 'Satara', 'AVAILABLE', '919876543212', '#2196f3', TRUE, 3),
  ('Vijay Deshmukh', 'Pesticide Sprayer', 'फवारणी कामगार', 6, 'Nagpur', 'AVAILABLE', '919876543213', '#9c27b0', TRUE, 4),
  ('Anita Shinde', 'Weeding Specialist', 'खुरपणी कामगार', 4, 'Solapur', 'AVAILABLE', '919876543214', '#e91e63', TRUE, 5),
  ('Raju Pawar', 'Irrigation Helper', 'पाणी पुरवठा मदतनीस', 2, 'Aurangabad', 'AVAILABLE', '919876543215', '#00bcd4', TRUE, 6),
  ('Vikas Pawar', 'Farm Manager', 'शेती व्यवस्थापक', 10, 'Baramati', 'AVAILABLE', '919876543220', '#009688', TRUE, 7),
  ('Suman Kale', 'Sowing Specialist', 'पेरणी तज्ञ', 6, 'Latur', 'AVAILABLE', '919876543221', '#673ab7', TRUE, 8),
  ('Arun Gaikwad', 'Irrigation Expert', 'सिंचन तज्ञ', 8, 'Nanded', 'AVAILABLE', '919876543222', '#3f51b5', TRUE, 9),
  ('Meena Patil', 'General Helper', 'मदतनीस', 2, 'Dhule', 'AVAILABLE', '919876543223', '#e91e63', TRUE, 10)
ON CONFLICT (phone) DO NOTHING;
