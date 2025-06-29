-- updated-init.sql
-- Script khởi tạo cơ sở dữ liệu KHÔNG DÙNG INHERITANCE

-- Kết nối tới database
\c xu_pet_shop

-- Tạo extension cần thiết
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Xóa các bảng cũ nếu tồn tại
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS commercial_users CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS product_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;

-- Các ENUM types
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'banned');
CREATE TYPE product_status AS ENUM ('active', 'sold', 'inactive');
CREATE TYPE user_role AS ENUM ('admin', 'commercial_user', 'user');
CREATE TYPE order_status AS ENUM ('pending', 'ordered', 'shipping', 'cancelled', 'delivered');

-- Bảng User chính (chứa TẤT CẢ users)
CREATE TABLE users (
    id_user SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name_display VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    numberphone VARCHAR(15),
    location TEXT,
    wallet DECIMAL(15, 2) DEFAULT 0 CHECK (wallet >= 0),
    role user_role DEFAULT 'user',
    status user_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Thêm các cột cho commercial users (sẽ là NULL với regular users)
    total_revenue DECIMAL(15, 2) DEFAULT NULL,
    total_products_sold INTEGER DEFAULT NULL,
    total_active_products INTEGER DEFAULT NULL,
    total_inactive_products INTEGER DEFAULT NULL
);

-- Bảng Category
CREATE TABLE categories (
    id_category SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Product với foreign keys HOẠT ĐỘNG
CREATE TABLE products (
    id_product SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(15, 2) NOT NULL CHECK (price >= 0),
    description TEXT,
    image VARCHAR(255),
    status product_status DEFAULT 'active',
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    id_user_sell INTEGER REFERENCES users(id_user) ON DELETE CASCADE,
    id_user_buy INTEGER REFERENCES users(id_user) ON DELETE CASCADE,
    id_category INTEGER REFERENCES categories(id_category) ON DELETE SET NULL
);

CREATE TABLE orders (
    id_order SERIAL PRIMARY KEY,
    status order_status DEFAULT 'pending',
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    id_buyer INTEGER REFERENCES users(id_user) ON DELETE CASCADE,
    id_seller INTEGER REFERENCES users(id_user) ON DELETE CASCADE,
    id_product INTEGER REFERENCES products(id_product) ON DELETE CASCADE
);









-- Function để cập nhật thống kê cho commercial users
CREATE OR REPLACE FUNCTION update_commercial_user_stats(user_id INTEGER)
RETURNS VOID AS $$
BEGIN
    -- Chỉ cập nhật cho commercial users
    IF EXISTS (SELECT 1 FROM users WHERE id_user = user_id AND role = 'commercial_user') THEN
        UPDATE users SET
            -- Tính tổng số sản phẩm đang active
            total_active_products = (
                SELECT COUNT(*)
                FROM products
                WHERE id_user_sell = user_id AND status = 'active'
            ),
            -- Tính tổng số sản phẩm đã bán (có buyer)
            total_products_sold = (
                SELECT COUNT(*)
                FROM products
                WHERE id_user_sell = user_id AND status = 'sold'
            ),
            -- Tính tổng số sản phẩm đã inactive
            total_inactive_products = (
                SELECT COUNT(*)
                FROM products
                WHERE id_user_sell = user_id AND status = 'inactive'
            ),
            -- Tính tổng doanh thu từ các sản phẩm đã bán
            total_revenue = (
                SELECT COALESCE(SUM(price), 0)
                FROM products
                WHERE id_user_sell = user_id AND status = 'sold'
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE id_user = user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger function cho khi thêm/sửa/xóa sản phẩm
CREATE OR REPLACE FUNCTION trigger_update_seller_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Khi INSERT hoặc UPDATE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Cập nhật stats cho seller
        PERFORM update_commercial_user_stats(NEW.id_user_sell);
        
        -- Nếu là UPDATE và seller thay đổi, cập nhật cả seller cũ
        IF TG_OP = 'UPDATE' AND OLD.id_user_sell != NEW.id_user_sell THEN
            PERFORM update_commercial_user_stats(OLD.id_user_sell);
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- Khi DELETE
    IF TG_OP = 'DELETE' THEN
        PERFORM update_commercial_user_stats(OLD.id_user_sell);
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger cho bảng products
DROP TRIGGER IF EXISTS products_stats_trigger ON products;
CREATE TRIGGER products_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_seller_stats();

-- Function để cập nhật stats khi user role thay đổi
CREATE OR REPLACE FUNCTION trigger_update_user_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Nếu user được chuyển thành commercial_user, tính toán stats
    IF NEW.role = 'commercial_user' AND OLD.role != 'commercial_user' THEN
        PERFORM update_commercial_user_stats(NEW.id_user);
    END IF;
    
    -- Nếu user không còn là commercial_user, reset stats về NULL
    IF NEW.role != 'commercial_user' AND OLD.role = 'commercial_user' THEN
        UPDATE users SET
            total_revenue = NULL,
            total_products_sold = NULL,
            total_active_products = NULL,
            total_inactive_products = NULL,  -- Thêm dòng này
            updated_at = CURRENT_TIMESTAMP
        WHERE id_user = NEW.id_user;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger cho bảng users
DROP TRIGGER IF EXISTS users_role_trigger ON users;
CREATE TRIGGER users_role_trigger
    AFTER UPDATE OF role ON users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_user_role();

-- Cập nhật lại stats cho tất cả commercial users hiện tại
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id_user FROM users WHERE role = 'commercial_user' LOOP
        PERFORM update_commercial_user_stats(user_record.id_user);
    END LOOP;
END;
$$;





















-- Tạo dữ liệu mẫu cho TẤT CẢ users (regular + commercial)
INSERT INTO users (username, password, name_display, email, numberphone, location, wallet, role, total_revenue, total_products_sold, total_active_products) VALUES 
-- Regular users (admin + user)
('admin1', crypt('admin123', gen_salt('bf')), 'Admin Hệ Thống', 'admin1@xupetshop.com', '0912345678', 'Hà Nội', 5000000, 'admin', NULL, NULL, NULL),
('admin2', crypt('admin234', gen_salt('bf')), 'Quản Trị Viên', 'admin2@xupetshop.com', '0923456789', 'Hồ Chí Minh', 4000000, 'admin', NULL, NULL, NULL),
('admin3', crypt('admin345', gen_salt('bf')), 'Moderator', 'admin3@xupetshop.com', '0934567890', 'Đà Nẵng', 3000000, 'admin', NULL, NULL, NULL),
('user1', crypt('user123', gen_salt('bf')), 'Người Dùng 1', 'user1@example.com', '0990123456', 'Nha Trang', 2000000, 'user', NULL, NULL, NULL),
('user2', crypt('user234', gen_salt('bf')), 'Người Dùng 2', 'user2@example.com', '0901234567', 'Quy Nhơn', 3000000, 'user', NULL, NULL, NULL),
('petlover', crypt('pet123', gen_salt('bf')), 'Pet Lover', 'petlover@example.com', '0912345670', 'Đà Lạt', 1500000, 'user', NULL, NULL, NULL),
('animalfriend', crypt('animal123', gen_salt('bf')), 'Animal Friend', 'animal.friend@example.com', '0923456780', 'Bắc Ninh', 2500000, 'user', NULL, NULL, NULL),
('dogcat', crypt('dogcat123', gen_salt('bf')), 'Dog & Cat', 'dogcat@example.com', '0934567801', 'Long Xuyên', 4000000, 'user', NULL, NULL, NULL),

-- Commercial users (với thống kê)
('seller1', crypt('seller123', gen_salt('bf')), 'Người Bán Pet 1', 'seller1@example.com', '0945678901', 'Hải Phòng', 8000000, 'commercial_user', NULL, NULL, NULL),
('seller2', crypt('seller234', gen_salt('bf')), 'Người Bán Pet 2', 'seller2@example.com', '0956789012', 'Cần Thơ', 12000000, 'commercial_user', NULL, NULL, NULL),
('shop_cho', crypt('shop123', gen_salt('bf')), 'Shop Chó Cưng', 'shop.cho@example.com', '0967890123', 'Thủ Dầu Một', 20000000, 'commercial_user', NULL, NULL, NULL),
('shop_meo', crypt('shop234', gen_salt('bf')), 'Shop Mèo Xinh', 'shop.meo@example.com', '0978901234', 'Vũng Tàu', 15000000, 'commercial_user', NULL, NULL, NULL),
('petcare', crypt('care123', gen_salt('bf')), 'Pet Care Center', 'petcare@example.com', '0989012345', 'Huế', 18000000, 'commercial_user', NULL, NULL, NULL);

-- Tạo dữ liệu mẫu cho Category
INSERT INTO categories (name) VALUES
('Chó'),
('Mèo'),
('Cá'),
('Chim'),
('Sóc'),
('Thức ăn thú cưng'),
('Phụ kiện'),
('Dịch vụ'),
('Y tế & Thuốc'),
('Chuồng, nhà & giường');

-- INSERT products với foreign keys HOẠT ĐỘNG BÌNH THƯỜNG
INSERT INTO products (name, price, description, image, status, id_user_sell, id_user_buy, id_category) VALUES
-- Sản phẩm thuộc danh mục Chó
('Chó Labrador Retriever', 15000000, 'Chó Labrador Retriever thuần chủng, 3 tháng tuổi, đã tiêm phòng đầy đủ, rất thân thiện và thông minh.', 'labrador.jpg', 'active', 9, NULL, 1),  -- seller1
('Chó Poodle Toy', 12000000, 'Chó Poodle Toy, 2 tháng tuổi, màu nâu đỏ, đã tiêm 2 mũi vaccine, rất xinh xắn và lanh lợi.', 'poodle_toy.jpg', 'active', 9, 4, 1),  -- seller1 -> user1
('Chó Corgi', 20000000, 'Chó Corgi đực, 4 tháng tuổi, màu vàng trắng, chân ngắn đáng yêu, rất vui vẻ và năng động.', 'corgi.jpg', 'sold', 11, 10, 1),  -- shop_cho
('Chó Husky Siberian', 18000000, 'Chó Husky Siberian cái, 5 tháng tuổi, lông dày, mắt xanh, đã huấn luyện cơ bản.', 'husky.jpg', 'active', 11, 5, 1),  -- shop_cho -> user2
('Chó Golden Retriever', 16000000, 'Chó Golden Retriever, 3 tháng tuổi, màu vàng gold, tính cách hiền lành, thích hợp cho gia đình có trẻ em.', 'golden.jpg', 'sold', 13, 5, 1),  -- petcare

-- Sản phẩm thuộc danh mục Mèo
('Mèo Anh lông ngắn', 8000000, 'Mèo Anh lông ngắn (British Shorthair), 4 tháng tuổi, màu xám xanh, béo tròn đáng yêu.', 'british_shorthair.jpg', 'sold', 10, 5, 2),  -- seller2
('Mèo Ba Tư', 10000000, 'Mèo Ba Tư lông dài, 3 tháng tuổi, màu trắng, mặt tịt đặc trưng, rất sang chảnh.', 'persian_cat.jpg', 'active', 10, 6, 2),  -- seller2 -> petlover
('Mèo Ragdoll', 15000000, 'Mèo Ragdoll thuần chủng, 6 tháng tuổi, màu point, mắt xanh, rất hiền và thân thiện.', 'ragdoll.jpg', 'active', 12, NULL, 2),  -- shop_meo
('Mèo Maine Coon', 20000000, 'Mèo Maine Coon, 5 tháng tuổi, màu tabby, kích thước lớn, đuôi dài đặc trưng.', 'maine_coon.jpg', 'active', 12, 7, 2),  -- shop_meo -> animalfriend
('Mèo Exotic', 9000000, 'Mèo Exotic lông ngắn, 4 tháng tuổi, màu cream, mặt tròn phúng phính, rất ngoan.', 'exotic_cat.jpg', 'active', 12, NULL, 2),  -- shop_meo

-- Sản phẩm thuộc danh mục Cá
('Cá Betta Halfmoon', 200000, 'Cá Betta Halfmoon đực, màu xanh đỏ rực rỡ, đuôi dài đẹp, khoảng 4 tháng tuổi.', 'betta_halfmoon.jpg', 'active', 13, NULL, 3),  -- petcare
('Cá Vàng Oranda', 500000, 'Cá Vàng Oranda cap đỏ, kích thước 10-12cm, rất khỏe mạnh và bắt mắt.', 'oranda_goldfish.jpg', 'active', 13, 8, 3),  -- petcare -> dogcat
('Cá Koi Nhật', 2000000, 'Cá Koi Nhật Bản nhập khẩu, kích thước 20-25cm, hoa văn đẹp, phù hợp nuôi hồ lớn.', 'koi_fish.jpg', 'inactive', 9, NULL, 3),  -- seller1
('Cá Đĩa Wild', 1500000, 'Cá Đĩa (Discus) hoang dã, màu đỏ tự nhiên, kích thước 12-15cm, đã thuần hóa.', 'discus_fish.jpg', 'active', 10, NULL, 3),  -- seller2
('Cá Rồng', 5000000, 'Cá Rồng Bạch Kim (Platinum Arowana), dài 30cm, đã có giấy CITES, rất quý hiếm.', 'arowana.jpg', 'active', 13, NULL, 3),  -- petcare

-- Sản phẩm thuộc danh mục Chim
('Chim Vẹt Sun Conure', 15000000, 'Chim Vẹt Sun Conure 1 tuổi, màu sắc rực rỡ, đã thuần, biết nói vài từ đơn giản.', 'sun_conure.jpg', 'active', 10, NULL, 4),  -- seller2
('Chim Sáo Đen', 2000000, 'Chim Sáo Đen 8 tháng tuổi, đã biết hót và nói chuyện, rất thông minh.', 'mynah_bird.jpg', 'sold', 9, 4, 4),  -- seller1 -> user1
('Chim Yến Phụng', 1000000, 'Chim Yến Phụng, màu vàng đỏ, hót hay, khoảng 6 tháng tuổi.', 'canary.jpg', 'active', 12, NULL, 4),  -- shop_meo
('Chim Họa Mi', 1500000, 'Chim Họa Mi trống, hót cực hay, đã được huấn luyện kỹ, khoảng 1 năm tuổi.', 'nightingale.jpg', 'sold', 13, 10, 4),  -- petcare
('Chim Vành Khuyên', 800000, 'Chim Vành Khuyên mái, giọng hót trong trẻo, khoảng 9 tháng tuổi.', 'finch_bird.jpg', 'active', 13, 5, 4),  -- petcare -> user2

-- Sản phẩm thuộc danh mục Sóc
('Sóc Bay Úc', 2500000, 'Sóc Bay Úc (Sugar Glider), 6 tháng tuổi, rất dễ thương và đã thuần hóa.', 'sugar_glider.jpg', 'sold', 9, 10, 5),  -- seller1
('Sóc Nhật', 1200000, 'Sóc Nhật Bản, màu xám trắng, rất tăng động và dễ nuôi.', 'japanese_squirrel.jpg', 'active', 9, 6, 5),  -- seller1 -> petlover
('Sóc Đất', 900000, 'Sóc Đất, màu nâu vàng, hiền lành, đã được huấn luyện cơ bản.', 'ground_squirrel.jpg', 'active', 10, NULL, 5),  -- seller2
('Sóc Siberia', 1800000, 'Sóc Siberia lông dày, màu xám bạc, rất quý hiếm, khoảng 8 tháng tuổi.', 'siberian_squirrel.jpg', 'inactive', 10, NULL, 5),  -- seller2
('Sóc Flying Squirrel', 2200000, 'Sóc Bay (Flying Squirrel), có màng bay, màu đen tuyền, rất hiếm.', 'flying_squirrel.jpg', 'active', 11, NULL, 5),  -- shop_cho

-- Sản phẩm thuộc danh mục Thức ăn thú cưng
('Thức ăn hạt cho chó Royal Canin', 850000, 'Thức ăn hạt cao cấp cho chó Royal Canin, bao 10kg, dành cho chó trưởng thành mọi giống.', 'royal_canin.jpg', 'active', 11, NULL, 6),  -- shop_cho
('Pate cho mèo Whiskas', 25000, 'Pate Whiskas cho mèo vị cá ngừ, gói 85g, giàu dinh dưỡng.', 'whiskas.jpg', 'active', 12, NULL, 6),  -- shop_meo
('Thức ăn chim cảnh', 75000, 'Thức ăn hỗn hợp dành cho chim cảnh, túi 500g, giàu vitamin.', 'bird_food.jpg', 'active', 9, NULL, 6),  -- seller1
('Cám cá Tropical', 120000, 'Cám cá Tropical nhập khẩu, hộp 250g, phù hợp cho cá cảnh nhiệt đới.', 'fish_food.jpg', 'active', 10, NULL, 6),  -- seller2
('Thức ăn cho sóc', 150000, 'Thức ăn hỗn hợp dành cho sóc, bao gồm các loại hạt và trái cây khô, túi 500g.', 'squirrel_food.jpg', 'active', 10, NULL, 6),  -- seller2

-- Sản phẩm thuộc danh mục Phụ kiện
('Vòng cổ chó có khắc tên', 200000, 'Vòng cổ chó bằng da thật, có thể khắc tên theo yêu cầu, nhiều kích cỡ.', 'dog_collar.jpg', 'active', 11, NULL, 7),  -- shop_cho
('Cát vệ sinh cho mèo', 150000, 'Cát vệ sinh cho mèo, túi 8kg, hút mùi tốt, ít bụi.', 'cat_litter.jpg', 'active', 12, 7, 7),  -- shop_meo -> animalfriend
('Lồng chim inox', 500000, 'Lồng chim inox cao cấp, kích thước 40x60cm, thiết kế hiện đại.', 'bird_cage.jpg', 'active', 9, NULL, 7),  -- seller1
('Bể cá mini', 350000, 'Bể cá mini thông minh, tích hợp đèn LED và bơm lọc, dung tích 5 lít.', 'mini_aquarium.jpg', 'active', 13, NULL, 7),  -- petcare
('Lồng sóc', 450000, 'Lồng sóc lớn, kích thước 60x40x80cm, đầy đủ phụ kiện.', 'squirrel_cage.jpg', 'active', 10, NULL, 7),  -- seller2

-- Sản phẩm thuộc danh mục Dịch vụ
('Dịch vụ spa cho chó', 500000, 'Dịch vụ spa cao cấp cho chó, bao gồm tắm, sấy, cắt tỉa lông và móng.', 'dog_spa.jpg', 'active', 11, NULL, 8),  -- shop_cho
('Dịch vụ khám bệnh tại nhà', 800000, 'Dịch vụ khám bệnh tại nhà cho thú cưng, do bác sĩ thú y có chứng chỉ hành nghề thực hiện.', 'vet_service.jpg', 'active', 13, NULL, 8),  -- petcare
('Huấn luyện chó cơ bản', 5000000, 'Khóa huấn luyện chó cơ bản 10 buổi, dạy các lệnh căn bản và sửa hành vi xấu.', 'dog_training.jpg', 'active', 11, 8, 8),  -- shop_cho -> dogcat
('Trông giữ mèo', 300000, 'Dịch vụ trông giữ mèo theo ngày, môi trường sạch sẽ, an toàn, có camera theo dõi.', 'cat_boarding.jpg', 'active', 12, NULL, 8),  -- shop_meo
('Dịch vụ cắt tỉa lông thú cưng', 250000, 'Dịch vụ cắt tỉa lông chuyên nghiệp cho chó, mèo theo yêu cầu.', 'grooming.jpg', 'active', 13, NULL, 8),  -- petcare

-- Sản phẩm thuộc danh mục Y tế & Thuốc
('Thuốc xổ giun cho chó', 80000, 'Thuốc xổ giun cho chó, tuýp 10 viên, phù hợp cho chó từ 5kg trở lên.', 'dewormer.jpg', 'active', 13, NULL, 9),  -- petcare
('Thuốc nhỏ gáy chống ve rận', 200000, 'Thuốc nhỏ gáy Frontline chống ve rận cho chó mèo, hộp 3 ống.', 'frontline.jpg', 'active', 13, NULL, 9),  -- petcare
('Vitamin tổng hợp cho mèo', 350000, 'Vitamin tổng hợp cho mèo dạng paste, tuýp 100g, bổ sung dinh dưỡng.', 'cat_vitamin.jpg', 'active', 12, NULL, 9),  -- shop_meo
('Thuốc điều trị nấm da', 120000, 'Thuốc điều trị nấm da cho chó mèo, chai xịt 100ml.', 'antifungal.jpg', 'active', 13, NULL, 9),  -- petcare
('Bộ sơ cứu thú cưng', 500000, 'Bộ dụng cụ sơ cứu cho thú cưng, bao gồm băng gạc, kẹp, kéo và các loại thuốc cơ bản.', 'pet_first_aid.jpg', 'active', 13, 6, 9),  -- petcare -> petlover

-- Sản phẩm thuộc danh mục Chuồng, nhà & giường  
('Chuồng chó inox', 2500000, 'Chuồng chó inox cao cấp, kích thước 100x80x90cm, bền đẹp.', 'dog_kennel.jpg', 'active', 11, NULL, 10),  -- shop_cho
('Nhà gỗ cho mèo', 1500000, 'Nhà gỗ thiết kế 2 tầng cho mèo, kích thước 60x40x80cm, có cầu thang và góc nghỉ.', 'cat_house.jpg', 'active', 12, NULL, 10),  -- shop_meo
('Giường nệm cho chó', 800000, 'Giường nệm êm ái cho chó, chất liệu cotton, kích thước 80x60cm, có thể giặt được.', 'dog_bed.jpg', 'active', 11, NULL, 10),  -- shop_cho
('Hammock cho mèo', 400000, 'Hammock treo tường cho mèo, chất liệu canvas chắc chắn, thiết kế hiện đại.', 'cat_hammock.jpg', 'active', 12, NULL, 10),  -- shop_meo
('Lều vải cho thú cưng', 350000, 'Lều vải di động cho thú cưng, dễ dàng gấp gọn, kích thước 50x50x60cm.', 'pet_tent.jpg', 'active', 9, NULL, 10);  -- seller1

-- INSERT orders với foreign keys HOẠT ĐỘNG BÌNH THƯỜNG
INSERT INTO orders (status, order_date, id_buyer, id_seller, id_product) VALUES
-- Đơn hàng đã hoàn thành
('delivered', '2025-06-15 10:30:00', 4, 9, 2),   -- user1 mua Chó Poodle Toy từ seller1
('delivered', '2025-06-14 14:20:00', 5, 11, 4),  -- user2 mua Chó Husky từ shop_cho
('delivered', '2025-06-13 09:15:00', 6, 12, 7),  -- petlover mua Mèo Ba Tư từ shop_meo
('delivered', '2025-06-12 16:45:00', 7, 12, 9),  -- animalfriend mua Mèo Maine Coon từ shop_meo
('delivered', '2025-06-11 11:30:00', 8, 13, 12), -- dogcat mua Cá Vàng Oranda từ petcare

-- Đơn hàng đang vận chuyển
('shipping', '2025-06-20 08:00:00', 4, 9, 17),   -- user1 mua Chim Sáo Đen từ seller1
('shipping', '2025-06-19 13:30:00', 5, 9, 22),   -- user2 mua Sóc Nhật từ seller1
('shipping', '2025-06-21 10:15:00', 7, 12, 32),  -- animalfriend mua Cát vệ sinh mèo từ shop_meo

-- Đơn hàng đã đặt, chờ xử lý
('ordered', '2025-06-21 15:30:00', 6, 11, 35),   -- petlover mua Huấn luyện chó từ shop_cho
('ordered', '2025-06-22 09:00:00', 8, 13, 41),   -- dogcat mua Bộ sơ cứu từ petcare

-- Đơn hàng chờ thanh toán
('pending', '2025-06-22 11:30:00', 4, 12, 20),   -- user1 đang xem Chim Vành Khuyên từ shop_meo
('pending', '2025-06-22 12:00:00', 5, 13, 39),   -- user2 đang xem Thuốc điều trị nấm từ petcare

-- Đơn hàng bị hủy
('cancelled', '2025-06-18 14:00:00', 6, 10, 14),  -- petlover hủy đơn Cá Đĩa từ seller2
('cancelled', '2025-06-17 16:30:00', 7, 11, 26);  -- animalfriend hủy đơn Thức ăn Royal Canin từ shop_cho

-- Thêm vào cuối file init.sql, sau phần INSERT orders
