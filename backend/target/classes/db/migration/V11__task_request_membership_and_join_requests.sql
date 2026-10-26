-- Task request membership + join approval flow

CREATE TABLE IF NOT EXISTS task_request_members (
  id bigserial PRIMARY KEY,
  task_request_id bigint NOT NULL REFERENCES task_requests(id) ON DELETE CASCADE,
  user_id bigint NOT NULL REFERENCES users(id),
  role varchar(16) NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  UNIQUE (task_request_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_task_request_members_task ON task_request_members(task_request_id);
CREATE INDEX IF NOT EXISTS idx_task_request_members_user ON task_request_members(user_id);

CREATE TABLE IF NOT EXISTS task_request_join_requests (
  id bigserial PRIMARY KEY,
  task_request_id bigint NOT NULL REFERENCES task_requests(id) ON DELETE CASCADE,
  requested_by bigint NOT NULL REFERENCES users(id),
  farm_location text,
  status varchar(16) NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_request_join_requests_task ON task_request_join_requests(task_request_id);
CREATE INDEX IF NOT EXISTS idx_task_request_join_requests_requester ON task_request_join_requests(requested_by);

CREATE TABLE IF NOT EXISTS task_request_join_approvals (
  id bigserial PRIMARY KEY,
  join_request_id bigint NOT NULL REFERENCES task_request_join_requests(id) ON DELETE CASCADE,
  approver_id bigint NOT NULL REFERENCES users(id),
  decision varchar(16) NOT NULL,
  decided_at timestamp,
  UNIQUE (join_request_id, approver_id)
);

CREATE INDEX IF NOT EXISTS idx_task_request_join_approvals_join ON task_request_join_approvals(join_request_id);
CREATE INDEX IF NOT EXISTS idx_task_request_join_approvals_approver ON task_request_join_approvals(approver_id);

-- Backfill memberships for existing requests (owner + booked farmers)
INSERT INTO task_request_members (task_request_id, user_id, role, created_at)
SELECT tr.id, tr.created_by, 'OWNER', now()
FROM task_requests tr
ON CONFLICT (task_request_id, user_id) DO NOTHING;

INSERT INTO task_request_members (task_request_id, user_id, role, created_at)
SELECT DISTINCT b.task_request_id, b.booked_by, 'MEMBER', now()
FROM bookings b
ON CONFLICT (task_request_id, user_id) DO NOTHING;
