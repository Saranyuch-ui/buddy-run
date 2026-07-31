CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  birthdate TEXT,
  gender TEXT,
  shirt_size TEXT,
  house_no TEXT,
  moo TEXT,
  soi TEXT,
  road TEXT,
  sub_district TEXT,
  district TEXT,
  province TEXT,
  postal_code TEXT,
  phone TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  event_date TEXT NOT NULL,
  location TEXT,
  distance TEXT,
  image TEXT,
  description TEXT
);

CREATE TABLE packages (
  id TEXT PRIMARY KEY,
  event_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  detail TEXT,
  price INTEGER NOT NULL,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  package_id TEXT NOT NULL,
  slip_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (package_id) REFERENCES packages(id)
);
