// models/Product.js
const BaseModel = require('./BaseModel');
const { query } = require('../config/db');

class Product extends BaseModel {
  constructor() {
    super('products');
    this.primaryKey = 'id_product';
  }

  // Lấy tất cả sản phẩm với filter và join
  async findAllWithDetails(filters = {}, options = {}) {
    try {
      const { page = 1, limit = 10, category, search, minPrice, maxPrice, status, sellerId, buyerId } = filters;
      const { sort = 'newest' } = options;
      const offset = (page - 1) * limit;

  
      // Xây dựng câu truy vấn SQL cơ bản
      let sqlQuery = `
        SELECT p.*, c.name as category_name, 
               seller.name_display as seller_name, seller.location as seller_location,
               buyer.name_display as buyer_name
        FROM products p
        LEFT JOIN categories c ON p.id_category = c.id_category
        LEFT JOIN users seller ON p.id_user_sell = seller.id_user
        LEFT JOIN users buyer ON p.id_user_buy = buyer.id_user
        WHERE 1=1
      `;
  
      const queryParams = [];
  
      // Thêm điều kiện tìm kiếm
      if (status) {
        queryParams.push(status);
        sqlQuery += ` AND p.status = $${queryParams.length}`;
      }
  
      if (category) {
        queryParams.push(category);
        sqlQuery += ` AND p.id_category = $${queryParams.length}`;
      }
  
      if (search) {
        queryParams.push(`%${search}%`);
        sqlQuery += ` AND (p.name ILIKE $${queryParams.length} OR p.description ILIKE $${queryParams.length})`;
      }
  
      if (minPrice) {
        queryParams.push(minPrice);
        sqlQuery += ` AND p.price >= $${queryParams.length}`;
      }
  
      if (maxPrice) {
        queryParams.push(maxPrice);
        sqlQuery += ` AND p.price <= $${queryParams.length}`;
      }
  
      // Tìm theo seller - loại bỏ userId fallback
      if (sellerId) {
        queryParams.push(sellerId);
        sqlQuery += ` AND p.id_user_sell = $${queryParams.length}`;
      }
      
      // Tìm theo buyer
      if (buyerId) {
        queryParams.push(buyerId);
        sqlQuery += ` AND p.id_user_buy = $${queryParams.length}`;
      }
      
  
      // Đếm tổng số sản phẩm
      const countQuery = `SELECT COUNT(*) FROM (${sqlQuery}) AS count_table`;
      const countResult = await query(countQuery, queryParams);
      const totalCount = parseInt(countResult.rows[0].count);
      
  
      // Thêm ORDER BY
      switch(sort) {
        case 'price_asc':
          sqlQuery += ` ORDER BY p.price ASC`;
          break;
        case 'price_desc':
          sqlQuery += ` ORDER BY p.price DESC`;
          break;
        case 'name_asc':
          sqlQuery += ` ORDER BY p.name ASC`;
          break;
        case 'name_desc':
          sqlQuery += ` ORDER BY p.name DESC`;
          break;
        case 'newest':
          sqlQuery += ` ORDER BY p.date DESC`;
          break;
        case 'oldest':
          sqlQuery += ` ORDER BY p.date ASC`;
          break;
        default:
          sqlQuery += ` ORDER BY p.date DESC`;
      }
  
      // Thêm LIMIT và OFFSET
      queryParams.push(parseInt(limit));
      sqlQuery += ` LIMIT $${queryParams.length}`;
      
      queryParams.push(parseInt(offset));
      sqlQuery += ` OFFSET $${queryParams.length}`;
  
      const result = await query(sqlQuery, queryParams);
  
      // Format dữ liệu trả về
      const products = result.rows.map(row => ({
        id_product: row.id_product,
        name: row.name,
        price: parseFloat(row.price),
        description: row.description,
        image: row.image,
        status: row.status,
        date: row.date,
        id_user_sell: row.id_user_sell,
        id_user_buy: row.id_user_buy,
        id_category: row.id_category,
        category: {
          id_category: row.id_category,
          name: row.category_name
        },
        seller: {
          id_user: row.id_user_sell,
          name_display: row.seller_name,
          location: row.seller_location
        },
        buyer: row.id_user_buy ? {
          id_user: row.id_user_buy,
          name_display: row.buyer_name
        } : null
      }));
  
      return {
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new Error(`Error in findAllWithDetails: ${error.message}`);
    }
  }

  // Lấy chi tiết sản phẩm
  async findByIdWithDetails(id) {
    try {
      const result = await query(`
        SELECT p.*, c.name as category_name, 
               seller.name_display as seller_name, seller.email as seller_email, 
               seller.numberphone as seller_numberphone, seller.location as seller_location,
               buyer.name_display as buyer_name
        FROM products p
        LEFT JOIN categories c ON p.id_category = c.id_category
        LEFT JOIN users seller ON p.id_user_sell = seller.id_user
        LEFT JOIN users buyer ON p.id_user_buy = buyer.id_user
        WHERE p.id_product = $1
      `, [id]);
  
      if (result.rows.length === 0) {
        return null;
      }
  
      const row = result.rows[0];
      return {
        id_product: row.id_product,
        name: row.name,
        price: parseFloat(row.price),
        description: row.description,
        image: row.image,
        status: row.status,
        date: row.date,
        id_user_sell: row.id_user_sell,
        id_user_buy: row.id_user_buy,
        id_category: row.id_category,
        category: {
          id_category: row.id_category,
          name: row.category_name
        },
        seller: {
          id_user: row.id_user_sell,
          name_display: row.seller_name,
          email: row.seller_email,
          numberphone: row.seller_numberphone,
          location: row.seller_location
        },
        buyer: row.id_user_buy ? {
          id_user: row.id_user_buy,
          name_display: row.buyer_name
        } : null
      };
    } catch (error) {
      throw new Error(`Error in findByIdWithDetails: ${error.message}`);
    }
  }

  // Lấy sản phẩm của seller
  async findBySeller(sellerId, options = {}) {
    try {
      return await this.findAllWithDetails({ sellerId, ...options.filters }, options);
    } catch (error) {
      throw new Error(`Error in findBySeller: ${error.message}`);
    }
  }

  // Tạo sản phẩm mới
  async createProduct(productData, sellerId) {
    try {
      const { name, price, description, image, id_category } = productData;
  
      const newProduct = await this.create({
        name,
        price: parseFloat(price),
        description,
        image,
        id_category: parseInt(id_category),
        id_user_sell: sellerId,
        id_user_buy: null,
        status: 'active',
        date: new Date()
      });
  
      return newProduct;
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  // Cập nhật sản phẩm
  async updateProduct(id, productData, sellerId = null, userRole = null) {
    try {
      const existingProduct = await this.findById(id);
      if (!existingProduct) {
        throw new Error('Sản phẩm không tìm thấy');
      }
  
      // Kiểm tra quyền cập nhật (chỉ seller hoặc admin)
      if (sellerId && userRole !== 'admin' && existingProduct.id_user_sell !== sellerId) {
        throw new Error('Bạn không có quyền cập nhật sản phẩm này');
      }
    
      // Chuẩn bị dữ liệu cập nhật
      const updateData = {};
      if (productData.name !== undefined) updateData.name = productData.name;
      if (productData.price !== undefined) updateData.price = parseFloat(productData.price);
      if (productData.description !== undefined) updateData.description = productData.description;
      if (productData.image !== undefined) updateData.image = productData.image;
      if (productData.id_category !== undefined) updateData.id_category = parseInt(productData.id_category);
      if (productData.status !== undefined) updateData.status = productData.status;
      if (productData.id_user_buy !== undefined) updateData.id_user_buy = productData.id_user_buy;
  
      const updatedProduct = await this.update(id, updateData);
      return updatedProduct;
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  // Xóa sản phẩm
  async deleteProduct(id, sellerId = null, userRole = null) {
    try {
      const existingProduct = await this.findById(id);
      if (!existingProduct) {
        throw new Error('Sản phẩm không tìm thấy');
      }
  
      // Kiểm tra quyền xóa (chỉ seller hoặc admin)
      if (sellerId && userRole !== 'admin' && existingProduct.id_user_sell !== sellerId) {
        throw new Error('Bạn không có quyền xóa sản phẩm này');
      }
    
      const deletedProduct = await this.delete(id);
      return deletedProduct;
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  // Cập nhật người mua sản phẩm
  async updateProductBuyer(productId, buyerId) {
    try {
      const product = await this.findById(productId);
      if (!product) {
        throw new Error('Sản phẩm không tồn tại');
      }
      
      if (product.id_user_buy) {
        throw new Error('Sản phẩm đã được bán');
      }
      
      const updatedProduct = await this.update(productId, {
        id_user_buy: buyerId,
        status: 'sold'
      });
      
      return updatedProduct;
    } catch (error) {
      throw new Error(`Error updating product buyer: ${error.message}`);
    }
  }

  // Thống kê sản phẩm
  async getProductStats() {
    try {
      const statsQuery = `
        SELECT 
          c.name as category_name,
          COUNT(p.id_product) as product_count,
          AVG(p.price) as avg_price,
          MIN(p.price) as min_price,
          MAX(p.price) as max_price
        FROM products p
        RIGHT JOIN categories c ON p.id_category = c.id_category
        WHERE p.status = 'active' OR p.status IS NULL
        GROUP BY c.id_category, c.name
        ORDER BY product_count DESC
      `;

      const result = await query(statsQuery);
      return result.rows.map(row => ({
        category_name: row.category_name,
        product_count: parseInt(row.product_count),
        avg_price: row.avg_price ? parseFloat(row.avg_price) : 0,
        min_price: row.min_price ? parseFloat(row.min_price) : 0,
        max_price: row.max_price ? parseFloat(row.max_price) : 0
      }));
    } catch (error) {
      throw new Error(`Error getting product stats: ${error.message}`);
    }
  }

  // Tìm kiếm sản phẩm nâng cao
  async searchProducts(searchTerm, options = {}) {
    try {
      const { category, priceRange, sortBy } = options;
      
      return await this.findAllWithDetails({
        search: searchTerm,
        category,
        minPrice: priceRange?.min,
        maxPrice: priceRange?.max,
        ...options
      }, { sort: sortBy });
    } catch (error) {
      throw new Error(`Error searching products: ${error.message}`);
    }
  }

  // Lấy sản phẩm theo danh mục
  async findByCategory(categoryId, options = {}) {
    try {
      const { page = 1, limit = 10, sort = 'newest', status = 'active' } = options;
      
      return await this.findAllWithDetails({
        category: categoryId,
        status,
        page,
        limit
      }, { sort });
    } catch (error) {
      throw new Error(`Error in findByCategory: ${error.message}`);
    }
  }

  async findByBuyer(buyerId, options = {}) {
    try {
      return await this.findAllWithDetails({ 
        buyerId, 
        status: 'sold', // Chỉ lấy sản phẩm đã bán
        ...options.filters 
      }, options);
    } catch (error) {
      throw new Error(`Error in findByBuyer: ${error.message}`);
    }
  }
}

module.exports = new Product();