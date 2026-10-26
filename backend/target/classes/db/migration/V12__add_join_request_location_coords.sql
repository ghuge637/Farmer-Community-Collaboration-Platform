-- Add lat/lng columns for join requests

ALTER TABLE task_request_join_requests ADD COLUMN IF NOT EXISTS farm_location_lat double precision;
ALTER TABLE task_request_join_requests ADD COLUMN IF NOT EXISTS farm_location_lng double precision;
