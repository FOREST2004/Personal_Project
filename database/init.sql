-- updated-init.sql
-- Script khởi tạo cơ sở dữ liệu dựa theo ERD mới

-- Kết nối tới database
\c xu_pet_shop

-- Tạo extension cần thiết
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Xóa các bảng cũ nếu tồn tại
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS product_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Các ENUM types
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'banned');
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'out_of_stock');
CREATE TYPE user_role AS ENUM ('admin', 'commercial_user', 'user');

-- Bảng User
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Category
CREATE TABLE categories (
    id_category SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Product
CREATE TABLE products (
    id_product SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(15, 2) NOT NULL CHECK (price >= 0),
    description TEXT,
    image VARCHAR(255),
    status product_status DEFAULT 'active',
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    id_user INTEGER REFERENCES users(id_user) ON DELETE CASCADE,
    id_category INTEGER REFERENCES categories(id_category) ON DELETE SET NULL
);

-- Tạo dữ liệu mẫu cho User
INSERT INTO users (username, password, name_display, email, numberphone, location, wallet, role) VALUES 
('admin1', crypt('admin123', gen_salt('bf')), 'Admin Hệ Thống', 'admin1@xupetshop.com', '0912345678', 'Hà Nội', 5000000, 'admin'),
('admin2', crypt('admin234', gen_salt('bf')), 'Quản Trị Viên', 'admin2@xupetshop.com', '0923456789', 'Hồ Chí Minh', 4000000, 'admin'),
('admin3', crypt('admin345', gen_salt('bf')), 'Moderator', 'admin3@xupetshop.com', '0934567890', 'Đà Nẵng', 3000000, 'admin'),
('seller1', crypt('seller123', gen_salt('bf')), 'Người Bán Pet 1', 'seller1@example.com', '0945678901', 'Hải Phòng', 8000000, 'commercial_user'),
('seller2', crypt('seller234', gen_salt('bf')), 'Người Bán Pet 2', 'seller2@example.com', '0956789012', 'Cần Thơ', 12000000, 'commercial_user'),
('shop_cho', crypt('shop123', gen_salt('bf')), 'Shop Chó Cưng', 'shop.cho@example.com', '0967890123', 'Thủ Dầu Một', 20000000, 'commercial_user'),
('shop_meo', crypt('shop234', gen_salt('bf')), 'Shop Mèo Xinh', 'shop.meo@example.com', '0978901234', 'Vũng Tàu', 15000000, 'commercial_user'),
('petcare', crypt('care123', gen_salt('bf')), 'Pet Care Center', 'petcare@example.com', '0989012345', 'Huế', 18000000, 'commercial_user'),
('user1', crypt('user123', gen_salt('bf')), 'Người Dùng 1', 'user1@example.com', '0990123456', 'Nha Trang', 2000000, 'user'),
('user2', crypt('user234', gen_salt('bf')), 'Người Dùng 2', 'user2@example.com', '0901234567', 'Quy Nhơn', 3000000, 'user'),
('petlover', crypt('pet123', gen_salt('bf')), 'Pet Lover', 'petlover@example.com', '0912345670', 'Đà Lạt', 1500000, 'user'),
('animalfriend', crypt('animal123', gen_salt('bf')), 'Animal Friend', 'animal.friend@example.com', '0923456780', 'Bắc Ninh', 2500000, 'user'),
('dogcat', crypt('dogcat123', gen_salt('bf')), 'Dog & Cat', 'dogcat@example.com', '0934567801', 'Long Xuyên', 4000000, 'user');

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

-- Tạo dữ liệu mẫu cho Product
INSERT INTO products (name, price, description, image, status, id_user, id_category) VALUES
-- Sản phẩm thuộc danh mục Chó
('Chó Labrador Retriever', 15000000, 'Chó Labrador Retriever thuần chủng, 3 tháng tuổi, đã tiêm phòng đầy đủ, rất thân thiện và thông minh.', 'labrador.jpg', 'active', 4, 1),
('Chó Poodle Toy', 12000000, 'Chó Poodle Toy, 2 tháng tuổi, màu nâu đỏ, đã tiêm 2 mũi vaccine, rất xinh xắn và lanh lợi.', 'poodle_toy.jpg', 'active', 4, 1),
('Chó Corgi', 20000000, 'Chó Corgi đực, 4 tháng tuổi, màu vàng trắng, chân ngắn đáng yêu, rất vui vẻ và năng động.', 'corgi.jpg', 'active', 6, 1),
('Chó Husky Siberian', 18000000, 'Chó Husky Siberian cái, 5 tháng tuổi, lông dày, mắt xanh, đã huấn luyện cơ bản.', 'husky.jpg', 'active', 6, 1),
('Chó Golden Retriever', 16000000, 'Chó Golden Retriever, 3 tháng tuổi, màu vàng gold, tính cách hiền lành, thích hợp cho gia đình có trẻ em.', 'golden.jpg', 'active', 8, 1),

-- Sản phẩm thuộc danh mục Mèo
('Mèo Anh lông ngắn', 8000000, 'Mèo Anh lông ngắn (British Shorthair), 4 tháng tuổi, màu xám xanh, béo tròn đáng yêu.', 'british_shorthair.jpg', 'active', 5, 2),
('Mèo Ba Tư', 10000000, 'Mèo Ba Tư lông dài, 3 tháng tuổi, màu trắng, mặt tịt đặc trưng, rất sang chảnh.', 'persian_cat.jpg', 'active', 5, 2),
('Mèo Ragdoll', 15000000, 'Mèo Ragdoll thuần chủng, 6 tháng tuổi, màu point, mắt xanh, rất hiền và thân thiện.', 'ragdoll.jpg', 'active', 7, 2),
('Mèo Maine Coon', 20000000, 'Mèo Maine Coon, 5 tháng tuổi, màu tabby, kích thước lớn, đuôi dài đặc trưng.', 'maine_coon.jpg', 'active', 7, 2),
('Mèo Exotic', 9000000, 'Mèo Exotic lông ngắn, 4 tháng tuổi, màu cream, mặt tròn phúng phính, rất ngoan.', 'exotic_cat.jpg', 'active', 7, 2),

-- Sản phẩm thuộc danh mục Cá
('Cá Betta Halfmoon', 200000, 'Cá Betta Halfmoon đực, màu xanh đỏ rực rỡ, đuôi dài đẹp, khoảng 4 tháng tuổi.', 'betta_halfmoon.jpg', 'active', 8, 3),
('Cá Vàng Oranda', 500000, 'Cá Vàng Oranda cap đỏ, kích thước 10-12cm, rất khỏe mạnh và bắt mắt.', 'oranda_goldfish.jpg', 'active', 8, 3),
('Cá Koi Nhật', 2000000, 'Cá Koi Nhật Bản nhập khẩu, kích thước 20-25cm, hoa văn đẹp, phù hợp nuôi hồ lớn.', 'koi_fish.jpg', 'active', 4, 3),
('Cá Đĩa Wild', 1500000, 'Cá Đĩa (Discus) hoang dã, màu đỏ tự nhiên, kích thước 12-15cm, đã thuần hóa.', 'discus_fish.jpg', 'active', 5, 3),
('Cá Rồng', 5000000, 'Cá Rồng Bạch Kim (Platinum Arowana), dài 30cm, đã có giấy CITES, rất quý hiếm.', 'arowana.jpg', 'out_of_stock', 8, 3),

-- Sản phẩm thuộc danh mục Chim
('Chim Vẹt Sun Conure', 15000000, 'Chim Vẹt Sun Conure 1 tuổi, màu sắc rực rỡ, đã thuần, biết nói vài từ đơn giản.', 'sun_conure.jpg', 'active', 5, 4),
('Chim Sáo Đen', 2000000, 'Chim Sáo Đen 8 tháng tuổi, đã biết hót và nói chuyện, rất thông minh.', 'mynah_bird.jpg', 'active', 4, 4),
('Chim Yến Phụng', 1000000, 'Chim Yến Phụng, màu vàng đỏ, hót hay, khoảng 6 tháng tuổi.', 'canary.jpg', 'active', 7, 4),
('Chim Họa Mi', 1500000, 'Chim Họa Mi trống, hót cực hay, đã được huấn luyện kỹ, khoảng 1 năm tuổi.', 'nightingale.jpg', 'active', 8, 4),
('Chim Vành Khuyên', 800000, 'Chim Vành Khuyên mái, giọng hót trong trẻo, khoảng 9 tháng tuổi.', 'finch_bird.jpg', 'active', 8, 4),

-- Sản phẩm thuộc danh mục Sóc
('Sóc Bay Úc', 2500000, 'Sóc Bay Úc (Sugar Glider), 6 tháng tuổi, rất dễ thương và đã thuần hóa.', 'sugar_glider.jpg', 'active', 4, 5),
('Sóc Nhật', 1200000, 'Sóc Nhật Bản, màu xám trắng, rất tăng động và dễ nuôi.', 'japanese_squirrel.jpg', 'active', 4, 5),
('Sóc Đất', 900000, 'Sóc Đất, màu nâu vàng, hiền lành, đã được huấn luyện cơ bản.', 'ground_squirrel.jpg', 'active', 5, 5),
('Sóc Siberia', 1800000, 'Sóc Siberia lông dày, màu xám bạc, rất quý hiếm, khoảng 8 tháng tuổi.', 'siberian_squirrel.jpg', 'inactive', 5, 5),
('Sóc Flying Squirrel', 2200000, 'Sóc Bay (Flying Squirrel), có màng bay, màu đen tuyền, rất hiếm.', 'flying_squirrel.jpg', 'out_of_stock', 6, 5),

-- Sản phẩm thuộc danh mục Thức ăn thú cưng
('Thức ăn hạt cho chó Royal Canin', 850000, 'Thức ăn hạt cao cấp cho chó Royal Canin, bao 10kg, dành cho chó trưởng thành mọi giống.', 'royal_canin.jpg', 'active', 6, 6),
('Pate cho mèo Whiskas', 25000, 'Pate Whiskas cho mèo vị cá ngừ, gói 85g, giàu dinh dưỡng.', 'whiskas.jpg', 'active', 7, 6),
('Thức ăn chim cảnh', 75000, 'Thức ăn hỗn hợp dành cho chim cảnh, túi 500g, giàu vitamin.', 'bird_food.jpg', 'active', 4, 6),
('Cám cá Tropical', 120000, 'Cám cá Tropical nhập khẩu, hộp 250g, phù hợp cho cá cảnh nhiệt đới.', 'fish_food.jpg', 'active', 5, 6),
('Thức ăn cho sóc', 150000, 'Thức ăn hỗn hợp dành cho sóc, bao gồm các loại hạt và trái cây khô, túi 500g.', 'squirrel_food.jpg', 'active', 5, 6),

-- Sản phẩm thuộc danh mục Phụ kiện
('Vòng cổ chó có khắc tên', 200000, 'Vòng cổ chó bằng da thật, có thể khắc tên theo yêu cầu, nhiều kích cỡ.', 'dog_collar.jpg', 'active', 6, 7),
('Cát vệ sinh cho mèo', 150000, 'Cát vệ sinh cho mèo, túi 8kg, hút mùi tốt, ít bụi.', 'cat_litter.jpg', 'active', 7, 7),
('Lồng chim inox', 500000, 'Lồng chim inox cao cấp, kích thước 40x60cm, thiết kế hiện đại.', 'bird_cage.jpg', 'active', 4, 7),
('Bể cá mini', 350000, 'Bể cá mini thông minh, tích hợp đèn LED và bơm lọc, dung tích 5 lít.', 'mini_aquarium.jpg', 'active', 8, 7),
('Lồng sóc', 450000, 'Lồng sóc lớn, kích thước 60x40x80cm, đầy đủ phụ kiện.', 'squirrel_cage.jpg', 'active', 5, 7),

-- Sản phẩm thuộc danh mục Dịch vụ
('Dịch vụ spa cho chó', 500000, 'Dịch vụ spa cao cấp cho chó, bao gồm tắm, sấy, cắt tỉa lông và móng.', 'dog_spa.jpg', 'active', 6, 8),
('Dịch vụ khám bệnh tại nhà', 800000, 'Dịch vụ khám bệnh tại nhà cho thú cưng, do bác sĩ thú y có chứng chỉ hành nghề thực hiện.', 'vet_service.jpg', 'active', 8, 8),
('Huấn luyện chó cơ bản', 5000000, 'Khóa huấn luyện chó cơ bản 10 buổi, dạy các lệnh căn bản và sửa hành vi xấu.', 'dog_training.jpg', 'active', 6, 8),
('Trông giữ mèo', 300000, 'Dịch vụ trông giữ mèo theo ngày, môi trường sạch sẽ, an toàn, có camera theo dõi.', 'cat_boarding.jpg', 'active', 7, 8),
('Dịch vụ cắt tỉa lông thú cưng', 250000, 'Dịch vụ cắt tỉa lông chuyên nghiệp cho chó, mèo theo yêu cầu.', 'grooming.jpg', 'active', 8, 8),

-- Sản phẩm thuộc danh mục Y tế & Thuốc
('Thuốc xổ giun cho chó', 80000, 'Thuốc xổ giun cho chó, tuýp 10 viên, phù hợp cho chó từ 5kg trở lên.', 'dewormer.jpg', 'active', 8, 9),
('Thuốc nhỏ gáy chống ve rận', 200000, 'Thuốc nhỏ gáy Frontline chống ve rận cho chó mèo, hộp 3 ống.', 'frontline.jpg', 'active', 8, 9),
('Vitamin tổng hợp cho mèo', 350000, 'Vitamin tổng hợp cho mèo dạng paste, tuýp 100g, bổ sung dinh dưỡng.', 'cat_vitamin.jpg', 'active', 7, 9),
('Thuốc điều trị nấm da', 120000, 'Thuốc điều trị nấm da cho chó mèo, chai xịt 100ml.', 'antifungal.jpg', 'active', 8, 9),
('Bộ sơ cứu thú cưng', 500000, 'Bộ dụng cụ sơ cứu cho thú cưng, bao gồm băng gạc, kẹp, kéo và các loại thuốc cơ bản.', 'pet_first_aid.jpg', 'active', 8, 9),

-- Sản phẩm thuộc danh mục Chuồng, nhà & giường  
('Chuồng chó inox', 2500000, 'Chuồng chó inox cao cấp, kích thước 100x80x90cm, bền đẹp.', 'dog_kennel.jpg', 'active', 6, 10),
('Nhà gỗ cho mèo', 1500000, 'Nhà gỗ thiết kế 2 tầng cho mèo, kích thước 60x40x80cm, có cầu thang và góc nghỉ.', 'cat_house.jpg', 'active', 7, 10),
('Giường nệm cho chó', 800000, 'Giường nệm êm ái cho chó, chất liệu cotton, kích thước 80x60cm, có thể giặt được.', 'dog_bed.jpg', 'active', 6, 10),
('Hammock cho mèo', 400000, 'Hammock treo tường cho mèo, chất liệu canvas chắc chắn, thiết kế hiện đại.', 'cat_hammock.jpg', 'active', 7, 10);
-- ('Lều vải cho thú cưng', 350000, 'Lều vải di động cho thú cưng, dễ dàng gấp gọn, kích thước 50x50x60cm.', 'pet_tent.jpg', 'active', 4, 10);
