-- Personal tasks for collaboration schedule

CREATE TABLE IF NOT EXISTS collab_personal_tasks (
  id bigserial PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_date date NOT NULL,
  title varchar(200) NOT NULL,
  task_time varchar(16),
  note text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_collab_personal_tasks_user_date ON collab_personal_tasks(user_id, task_date);
