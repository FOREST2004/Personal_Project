// models/Category.js
const BaseModel = require('./BaseModel');
const { query } = require('../config/db');

class Category extends BaseModel {
  constructor() {
    super('categories');
    this.primaryKey = 'id_category';
  }

  // Lấy tất cả categories với số lượng sản phẩm
  async findAllWithProductCount() {
    try {
      const sqlQuery = `
        SELECT 
          c.*,
          COUNT(p.id_product) as product_count,
          COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_product_count
        FROM categories c
        LEFT JOIN products p ON c.id_category = p.id_category
        GROUP BY c.id_category, c.name, c.created_at, c.updated_at
        ORDER BY c.name ASC
      `;

      const result = await query(sqlQuery);
      return result.rows.map(row => ({
        id_category: row.id_category,
        name: row.name,
        created_at: row.created_at,
        updated_at: row.updated_at,
        product_count: parseInt(row.product_count),
        active_product_count: parseInt(row.active_product_count)
      }));
    } catch (error) {
      throw new Error(`Error in findAllWithProductCount: ${error.message}`);
    }
  }

  // Lấy category theo ID với thông tin sản phẩm
  async findByIdWithDetails(id) {
    try {
      const categoryQuery = `
        SELECT 
          c.*,
          COUNT(p.id_product) as product_count,
          COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_product_count,
          AVG(p.price) as avg_price,
          MIN(p.price) as min_price,
          MAX(p.price) as max_price
        FROM categories c
        LEFT JOIN products p ON c.id_category = p.id_category
        WHERE c.id_category = $1
        GROUP BY c.id_category, c.name, c.created_at, c.updated_at
      `;

      const result = await query(categoryQuery, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id_category: row.id_category,
        name: row.name,
        created_at: row.created_at,
        updated_at: row.updated_at,
        product_count: parseInt(row.product_count),
        active_product_count: parseInt(row.active_product_count),
        avg_price: row.avg_price ? parseFloat(row.avg_price) : 0,
        min_price: row.min_price ? parseFloat(row.min_price) : 0,
        max_price: row.max_price ? parseFloat(row.max_price) : 0
      };
    } catch (error) {
      throw new Error(`Error in findByIdWithDetails: ${error.message}`);
    }
  }

  // Tìm category theo tên
  async findByName(name) {
    try {
      const result = await query('SELECT * FROM categories WHERE name ILIKE $1', [`%${name}%`]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding category by name: ${error.message}`);
    }
  }

  // Tạo category mới
  async createCategory(categoryData) {
    try {
      const { name } = categoryData;

      // Kiểm tra tên category đã tồn tại
      const existingCategory = await query('SELECT * FROM categories WHERE name = $1', [name]);
      if (existingCategory.rows.length > 0) {
        throw new Error('Tên danh mục đã tồn tại');
      }

      const newCategory = await this.create({
        name: name.trim(),
        created_at: new Date(),
        updated_at: new Date()
      });

      return newCategory;
    } catch (error) {
      throw new Error(`Error creating category: ${error.message}`);
    }
  }

  // Cập nhật category
  async updateCategory(id, categoryData) {
    try {
      const { name } = categoryData;

      // Kiểm tra category tồn tại
      const existingCategory = await this.findById(id);
      if (!existingCategory) {
        throw new Error('Danh mục không tìm thấy');
      }

      // Kiểm tra tên mới không trùng với category khác
      if (name && name !== existingCategory.name) {
        const duplicateCheck = await query(
          'SELECT * FROM categories WHERE name = $1 AND id_category != $2',
          [name, id]
        );
        if (duplicateCheck.rows.length > 0) {
          throw new Error('Tên danh mục đã tồn tại');
        }
      }

      const updateData = {
        updated_at: new Date()
      };
      
      if (name) updateData.name = name.trim();

      const updatedCategory = await this.update(id, updateData);
      return updatedCategory;
    } catch (error) {
      throw new Error(`Error updating category: ${error.message}`);
    }
  }

  // Xóa category
  async deleteCategory(id) {
    try {
      // Kiểm tra category tồn tại
      const existingCategory = await this.findById(id);
      if (!existingCategory) {
        throw new Error('Danh mục không tìm thấy');
      }

      // Kiểm tra có sản phẩm nào thuộc category này không
      const productCheck = await query('SELECT COUNT(*) FROM products WHERE id_category = $1', [id]);
      const productCount = parseInt(productCheck.rows[0].count);

      if (productCount > 0) {
        throw new Error(`Không thể xóa danh mục này vì có ${productCount} sản phẩm liên quan. Hãy xóa hoặc chuyển sản phẩm trước.`);
      }

      const deletedCategory = await this.delete(id);
      return deletedCategory;
    } catch (error) {
      throw new Error(`Error deleting category: ${error.message}`);
    }
  }

  // Lấy categories phổ biến (có nhiều sản phẩm nhất)
  async getPopularCategories(limit = 5) {
    try {
      const sqlQuery = `
        SELECT 
          c.*,
          COUNT(p.id_product) as product_count,
          COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_product_count
        FROM categories c
        LEFT JOIN products p ON c.id_category = p.id_category
        GROUP BY c.id_category, c.name, c.created_at, c.updated_at
        HAVING COUNT(p.id_product) > 0
        ORDER BY active_product_count DESC
        LIMIT $1
      `;

      const result = await query(sqlQuery, [limit]);
      return result.rows.map(row => ({
        id_category: row.id_category,
        name: row.name,
        created_at: row.created_at,
        updated_at: row.updated_at,
        product_count: parseInt(row.product_count),
        active_product_count: parseInt(row.active_product_count)
      }));
    } catch (error) {
      throw new Error(`Error getting popular categories: ${error.message}`);
    }
  }

  // Lấy thống kê chi tiết categories
  async getCategoryStats() {
    try {
      const sqlQuery = `
        SELECT 
          c.name,
          COUNT(p.id_product) as total_products,
          COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_products,
          COUNT(CASE WHEN p.status = 'inactive' THEN 1 END) as inactive_products,
          COUNT(CASE WHEN p.status = 'out_of_stock' THEN 1 END) as out_of_stock_products,
          COALESCE(AVG(CASE WHEN p.status = 'active' THEN p.price END), 0) as avg_price,
          COALESCE(MIN(CASE WHEN p.status = 'active' THEN p.price END), 0) as min_price,
          COALESCE(MAX(CASE WHEN p.status = 'active' THEN p.price END), 0) as max_price
        FROM categories c
        LEFT JOIN products p ON c.id_category = p.id_category
        GROUP BY c.id_category, c.name
        ORDER BY total_products DESC
      `;

      const result = await query(sqlQuery);
      return result.rows.map(row => ({
        category_name: row.name,
        total_products: parseInt(row.total_products),
        active_products: parseInt(row.active_products),
        inactive_products: parseInt(row.inactive_products),
        out_of_stock_products: parseInt(row.out_of_stock_products),
        avg_price: parseFloat(row.avg_price),
        min_price: parseFloat(row.min_price),
        max_price: parseFloat(row.max_price)
      }));
    } catch (error) {
      throw new Error(`Error getting category stats: ${error.message}`);
    }
  }

  // Tìm kiếm categories
  async searchCategories(searchTerm) {
    try {
      const sqlQuery = `
        SELECT 
          c.*,
          COUNT(p.id_product) as product_count,
          COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_product_count
        FROM categories c
        LEFT JOIN products p ON c.id_category = p.id_category
        WHERE c.name ILIKE $1
        GROUP BY c.id_category, c.name, c.created_at, c.updated_at
        ORDER BY c.name ASC
      `;

      const result = await query(sqlQuery, [`%${searchTerm}%`]);
      return result.rows.map(row => ({
        id_category: row.id_category,
        name: row.name,
        created_at: row.created_at,
        updated_at: row.updated_at,
        product_count: parseInt(row.product_count),
        active_product_count: parseInt(row.active_product_count)
      }));
    } catch (error) {
      throw new Error(`Error searching categories: ${error.message}`);
    }
  }

  // Chuyển sản phẩm từ category này sang category khác
  async transferProducts(fromCategoryId, toCategoryId) {
    try {
      // Kiểm tra cả 2 categories tồn tại
      const fromCategory = await this.findById(fromCategoryId);
      const toCategory = await this.findById(toCategoryId);

      if (!fromCategory) {
        throw new Error('Danh mục nguồn không tìm thấy');
      }
      if (!toCategory) {
        throw new Error('Danh mục đích không tìm thấy');
      }

      // Chuyển tất cả sản phẩm
      const result = await query(
        'UPDATE products SET id_category = $1 WHERE id_category = $2 RETURNING *',
        [toCategoryId, fromCategoryId]
      );

      return {
        transferred_count: result.rows.length,
        from_category: fromCategory.name,
        to_category: toCategory.name
      };
    } catch (error) {
      throw new Error(`Error transferring products: ${error.message}`);
    }
  }
}

module.exports = new Category();