ALTER TABLE events ADD COLUMN end_date TEXT;

INSERT INTO events (title, event_date, end_date, location, distance, image, description) VALUES
('Bangkok Marathon 2027', '2027-01-15', '2027-01-16', 'Bangkok', '5K / 10K / 21K / 42K', 'https://picsum.photos/600/400?random=1', 'One of the biggest marathon events in Thailand.'),
('Chiangmai Night Run', '2027-02-05', '2027-02-05', 'Chiangmai', '5K / 10K', 'https://picsum.photos/600/400?random=2', 'Enjoy running through Chiangmai at night.'),
('Pattaya Fun Run', '2027-03-10', '2027-03-10', 'Pattaya', '5K', 'https://picsum.photos/600/400?random=3', 'Family friendly running event.'),
('Hua Hin Beach Run 2026', '2026-06-20', '2026-06-21', 'Hua Hin', '5K / 10K', 'https://picsum.photos/600/400?random=4', 'A scenic beach run that already took place.');

ALTER TABLE registrations ADD COLUMN event_end_date TEXT;
