CREATE TABLE addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  label TEXT,
  recipient_name TEXT,
  phone TEXT,
  house_no TEXT,
  moo TEXT,
  soi TEXT,
  road TEXT,
  sub_district TEXT,
  district TEXT,
  province TEXT,
  postal_code TEXT,
  is_default INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ย้ายที่อยู่เดิมของแต่ละสมาชิก (ถ้ามี) เข้าสมุดที่อยู่ เป็นค่าเริ่มต้น
INSERT INTO addresses (user_id, label, recipient_name, phone, house_no, moo, soi, road, sub_district, district, province, postal_code, is_default)
SELECT id, 'ที่อยู่หลัก', (first_name || ' ' || last_name), phone, house_no, moo, soi, road, sub_district, district, province, postal_code, 1
FROM users
WHERE house_no IS NOT NULL OR province IS NOT NULL;

ALTER TABLE registrations ADD COLUMN shipping_name TEXT;
ALTER TABLE registrations ADD COLUMN shipping_phone TEXT;
ALTER TABLE registrations ADD COLUMN shipping_address TEXT;

ALTER TABLE orders ADD COLUMN shipping_name TEXT;
ALTER TABLE orders ADD COLUMN shipping_phone TEXT;
ALTER TABLE orders ADD COLUMN shipping_address TEXT;
