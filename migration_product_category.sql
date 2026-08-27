ALTER TABLE products ADD COLUMN category TEXT;

UPDATE products SET category = 'เสื้อผ้า' WHERE name = 'เสื้อวิ่ง Buddy Run';
UPDATE products SET category = 'อุปกรณ์เสริม' WHERE name = 'หมวกวิ่ง Buddy Run';
UPDATE products SET category = 'อุปกรณ์เสริม' WHERE name = 'กระบอกน้ำ Buddy Run';
