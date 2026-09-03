CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

INSERT INTO categories (name) VALUES ('เสื้อผ้า'), ('อุปกรณ์เสริม');
