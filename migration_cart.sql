CREATE TABLE cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  size TEXT,
  quantity INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

ALTER TABLE orders ADD COLUMN size TEXT;
