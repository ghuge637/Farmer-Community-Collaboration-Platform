-- Allow multiple booking commitments per day for the same worker
DROP INDEX IF EXISTS ux_bookings_booked_by_booking_date;
