CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  image TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  total INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now'))
);

INSERT INTO products (name, price, description, image) VALUES
('เสื้อวิ่ง Buddy Run', 350, 'เสื้อวิ่งระบายอากาศ ลาย Buddy Run', 'https://picsum.photos/400/400?random=11'),
('หมวกวิ่ง Buddy Run', 150, 'หมวกกันแดดน้ำหนักเบา', 'https://picsum.photos/400/400?random=12'),
('กระบอกน้ำ Buddy Run', 199, 'กระบอกน้ำพกพา ขนาด 500ml', 'https://picsum.photos/400/400?random=13');
