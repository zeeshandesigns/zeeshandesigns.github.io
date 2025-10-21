-- Sample Data for PakGifts Platform
-- Run this after the main schema.sql to populate initial data

-- Insert Sample Categories
INSERT INTO categories (name, slug, description, icon_url, display_order) VALUES
('Gaming', 'gaming', 'Game gift cards and gaming credits', '🎮', 1),
('Entertainment', 'entertainment', 'Streaming services and digital media', '🎬', 2),
('Shopping', 'shopping', 'Online shopping vouchers', '🛍️', 3),
('Mobile Top-up', 'mobile', 'Mobile credit and packages', '📱', 4),
('Software', 'software', 'Software licenses and subscriptions', '💻', 5);

-- Insert Sample Subcategories
INSERT INTO subcategories (category_id, name, slug, description, display_order)
SELECT category_id, 'Steam', 'steam', 'Steam platform gift cards', 1
FROM categories WHERE slug = 'gaming';

INSERT INTO subcategories (category_id, name, slug, description, display_order)
SELECT category_id, 'PlayStation', 'playstation', 'PlayStation Network cards', 2
FROM categories WHERE slug = 'gaming';

INSERT INTO subcategories (category_id, name, slug, description, display_order)
SELECT category_id, 'Xbox', 'xbox', 'Xbox gift cards', 3
FROM categories WHERE slug = 'gaming';

INSERT INTO subcategories (category_id, name, slug, description, display_order)
SELECT category_id, 'PUBG', 'pubg', 'PUBG UC and vouchers', 4
FROM categories WHERE slug = 'gaming';

INSERT INTO subcategories (category_id, name, slug, description, display_order)
SELECT category_id, 'Netflix', 'netflix', 'Netflix subscription cards', 1
FROM categories WHERE slug = 'entertainment';

INSERT INTO subcategories (category_id, name, slug, description, display_order)
SELECT category_id, 'Spotify', 'spotify', 'Spotify premium cards', 2
FROM categories WHERE slug = 'entertainment';

INSERT INTO subcategories (category_id, name, slug, description, display_order)
SELECT category_id, 'Amazon', 'amazon', 'Amazon gift cards', 1
FROM categories WHERE slug = 'shopping';

INSERT INTO subcategories (category_id, name, slug, description, display_order)
SELECT category_id, 'Daraz', 'daraz', 'Daraz vouchers', 2
FROM categories WHERE slug = 'shopping';

-- Insert Sample Products
INSERT INTO products (category_id, subcategory_id, name, slug, description, price, discount_percentage, delivery_type, region, min_stock_threshold, is_featured)
SELECT 
    c.category_id,
    sc.subcategory_id,
    'Steam Gift Card - PKR 1000',
    'steam-gift-card-1000',
    'Add PKR 1000 to your Steam Wallet. Use for games, software, and in-game items.',
    1100.00,
    0,
    'automatic',
    'Global',
    20,
    true
FROM categories c
JOIN subcategories sc ON c.category_id = sc.category_id
WHERE c.slug = 'gaming' AND sc.slug = 'steam';

INSERT INTO products (category_id, subcategory_id, name, slug, description, price, discount_percentage, delivery_type, region, min_stock_threshold, is_featured)
SELECT 
    c.category_id,
    sc.subcategory_id,
    'Steam Gift Card - PKR 2500',
    'steam-gift-card-2500',
    'Add PKR 2500 to your Steam Wallet. Perfect for purchasing multiple games.',
    2650.00,
    5,
    'automatic',
    'Global',
    15,
    true
FROM categories c
JOIN subcategories sc ON c.category_id = sc.category_id
WHERE c.slug = 'gaming' AND sc.slug = 'steam';

INSERT INTO products (category_id, subcategory_id, name, slug, description, price, discount_percentage, delivery_type, region, min_stock_threshold, is_featured)
SELECT 
    c.category_id,
    sc.subcategory_id,
    'PlayStation Network - PKR 1500',
    'psn-gift-card-1500',
    'PlayStation Network gift card for games, add-ons, and subscriptions.',
    1650.00,
    0,
    'automatic',
    'Pakistan',
    15,
    true
FROM categories c
JOIN subcategories sc ON c.category_id = sc.category_id
WHERE c.slug = 'gaming' AND sc.slug = 'playstation';

INSERT INTO products (category_id, subcategory_id, name, slug, description, price, discount_percentage, delivery_type, region, min_stock_threshold, is_featured)
SELECT 
    c.category_id,
    sc.subcategory_id,
    'PUBG UC 600',
    'pubg-uc-600',
    '600 UC for PUBG Mobile. Get the latest skins and items.',
    1200.00,
    5,
    'automatic',
    'Global',
    25,
    true
FROM categories c
JOIN subcategories sc ON c.category_id = sc.category_id
WHERE c.slug = 'gaming' AND sc.slug = 'pubg';

INSERT INTO products (category_id, subcategory_id, name, slug, description, price, discount_percentage, delivery_type, region, min_stock_threshold)
SELECT 
    c.category_id,
    sc.subcategory_id,
    'PUBG UC 1800',
    'pubg-uc-1800',
    '1800 UC for PUBG Mobile. Best value pack.',
    3400.00,
    10,
    'automatic',
    'Global',
    20
FROM categories c
JOIN subcategories sc ON c.category_id = sc.category_id
WHERE c.slug = 'gaming' AND sc.slug = 'pubg';

INSERT INTO products (category_id, subcategory_id, name, slug, description, price, discount_percentage, delivery_type, region, min_stock_threshold, is_featured)
SELECT 
    c.category_id,
    sc.subcategory_id,
    'Netflix Premium 1 Month',
    'netflix-premium-1m',
    'Netflix Premium subscription for 1 month. Watch on up to 4 devices.',
    2500.00,
    10,
    'manual',
    'Pakistan',
    10,
    true
FROM categories c
JOIN subcategories sc ON c.category_id = sc.category_id
WHERE c.slug = 'entertainment' AND sc.slug = 'netflix';

INSERT INTO products (category_id, subcategory_id, name, slug, description, price, discount_percentage, delivery_type, region, min_stock_threshold)
SELECT 
    c.category_id,
    sc.subcategory_id,
    'Netflix Premium 3 Months',
    'netflix-premium-3m',
    'Netflix Premium subscription for 3 months. Best value!',
    7000.00,
    15,
    'manual',
    'Pakistan',
    5
FROM categories c
JOIN subcategories sc ON c.category_id = sc.category_id
WHERE c.slug = 'entertainment' AND sc.slug = 'netflix';

INSERT INTO products (category_id, subcategory_id, name, slug, description, price, discount_percentage, delivery_type, region, min_stock_threshold)
SELECT 
    c.category_id,
    sc.subcategory_id,
    'Spotify Premium 1 Month',
    'spotify-premium-1m',
    'Spotify Premium subscription for 1 month. Ad-free music.',
    800.00,
    0,
    'manual',
    'Pakistan',
    10
FROM categories c
JOIN subcategories sc ON c.category_id = sc.category_id
WHERE c.slug = 'entertainment' AND sc.slug = 'spotify';

INSERT INTO products (category_id, subcategory_id, name, slug, description, price, discount_percentage, delivery_type, region, min_stock_threshold)
SELECT 
    c.category_id,
    sc.subcategory_id,
    'Amazon Gift Card - USD 10',
    'amazon-gift-card-10',
    'Amazon.com gift card worth $10. Use for millions of products.',
    3000.00,
    5,
    'manual',
    'USA',
    10
FROM categories c
JOIN subcategories sc ON c.category_id = sc.category_id
WHERE c.slug = 'shopping' AND sc.slug = 'amazon';

INSERT INTO products (category_id, subcategory_id, name, slug, description, price, discount_percentage, delivery_type, region, min_stock_threshold)
SELECT 
    c.category_id,
    sc.subcategory_id,
    'Daraz Voucher - PKR 500',
    'daraz-voucher-500',
    'Daraz shopping voucher worth PKR 500.',
    550.00,
    0,
    'automatic',
    'Pakistan',
    30
FROM categories c
JOIN subcategories sc ON c.category_id = sc.category_id
WHERE c.slug = 'shopping' AND sc.slug = 'daraz';

-- Insert Sample Admin User (password: admin123)
-- Note: In production, use a proper password hashing function
INSERT INTO users (email, password_hash, full_name, role, email_verified)
VALUES 
('admin@pakgifts.com', '$2a$10$YourHashedPasswordHere', 'Admin User', 'admin', true);

-- Insert Sample Customer (password: customer123)
INSERT INTO users (email, password_hash, full_name, phone_number, wallet_balance, email_verified)
VALUES 
('customer@example.com', '$2a$10$YourHashedPasswordHere', 'Test Customer', '+923001234567', 5000.00, true);

-- Note: Replace password hashes with actual bcrypt hashes in production
-- You can generate them using: bcrypt.hash('password', 10)

COMMIT;
