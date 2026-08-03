CREATE TABLE registrations_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  package_id TEXT NOT NULL,
  slip_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now')),
  event_title TEXT,
  package_name TEXT,
  price INTEGER
);

INSERT INTO registrations_new
SELECT id, user_id, event_id, package_id, slip_url, status, created_at, event_title, package_name, price
FROM registrations;

DROP TABLE registrations;

ALTER TABLE registrations_new RENAME TO registrations;
