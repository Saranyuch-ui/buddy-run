ALTER TABLE registrations ADD COLUMN paid_at TEXT;

CREATE TABLE admin_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  registration_id INTEGER NOT NULL,
  review_type TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
