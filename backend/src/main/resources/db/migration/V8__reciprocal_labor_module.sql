-- Reciprocal Farmer-to-Farmer Labor Scheduling System (no money, no hired labor)

-- Extend users with farmer labor fields (kept optional for existing installs)
ALTER TABLE users ADD COLUMN IF NOT EXISTS location_lat double precision;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location_lng double precision;
ALTER TABLE users ADD COLUMN IF NOT EXISTS labor_credit_balance integer NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_commitment_limit integer NOT NULL DEFAULT 1;

-- Task requests
CREATE TABLE IF NOT EXISTS task_requests (
  id bigserial PRIMARY KEY,
  created_by bigint NOT NULL REFERENCES users(id),
  task_type varchar(32) NOT NULL,
  required_farmer_days integer NOT NULL CHECK (required_farmer_days > 0),
  date_window_start date NOT NULL,
  date_window_end date NOT NULL,
  location_lat double precision,
  location_lng double precision,
  status varchar(16) NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  CHECK (date_window_end >= date_window_start)
);

-- Calendar dates for sign-ups (booking commitments)
CREATE TABLE IF NOT EXISTS task_calendar_dates (
  id bigserial PRIMARY KEY,
  task_request_id bigint NOT NULL REFERENCES task_requests(id) ON DELETE CASCADE,
  calendar_date date NOT NULL,
  date_status varchar(16) NOT NULL,
  UNIQUE (task_request_id, calendar_date)
);

CREATE INDEX IF NOT EXISTS idx_task_calendar_dates_task ON task_calendar_dates(task_request_id);
CREATE INDEX IF NOT EXISTS idx_task_calendar_dates_date ON task_calendar_dates(calendar_date);

-- Booking (commitment) + system assigned workday
CREATE TABLE IF NOT EXISTS bookings (
  id bigserial PRIMARY KEY,
  task_request_id bigint NOT NULL REFERENCES task_requests(id) ON DELETE CASCADE,
  booked_by bigint NOT NULL REFERENCES users(id),
  booking_date date NOT NULL,
  assigned_work_date date,
  status varchar(16) NOT NULL,
  requester_confirmed boolean NOT NULL DEFAULT false,
  worker_confirmed boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_bookings_booked_by_booking_date ON bookings(booked_by, booking_date);
CREATE UNIQUE INDEX IF NOT EXISTS ux_bookings_booked_by_assigned_work_date ON bookings(booked_by, assigned_work_date);
CREATE INDEX IF NOT EXISTS idx_bookings_task ON bookings(task_request_id);
CREATE INDEX IF NOT EXISTS idx_bookings_assigned_work_date ON bookings(assigned_work_date);

-- Labor ledger tracks 1 farmer-day owed/settled per booking
CREATE TABLE IF NOT EXISTS labor_ledger (
  id bigserial PRIMARY KEY,
  booking_id bigint NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  from_farmer bigint NOT NULL REFERENCES users(id),
  to_farmer bigint NOT NULL REFERENCES users(id),
  labor_days integer NOT NULL DEFAULT 1 CHECK (labor_days = 1),
  status varchar(16) NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  settled_at timestamp
);

CREATE INDEX IF NOT EXISTS idx_labor_ledger_from ON labor_ledger(from_farmer);
CREATE INDEX IF NOT EXISTS idx_labor_ledger_to ON labor_ledger(to_farmer);

