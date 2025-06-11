const { Sequelize } = require('sequelize');

// Khởi tạo kết nối Sequelize
const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'xu_pet_shop',
  username: process.env.DB_USERNAME || 'xu_pet_shop_user',
  password: process.env.DB_PASSWORD || '123',
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

// Import các model
const User = require('./User')(sequelize);
const Category = require('./Category')(sequelize);
const Product = require('./Product')(sequelize);

// Thiết lập các mối quan hệ
Product.belongsTo(User, { foreignKey: 'id_user' });
User.hasMany(Product, { foreignKey: 'id_user' });

Product.belongsTo(Category, { foreignKey: 'id_category' });
Category.hasMany(Product, { foreignKey: 'id_category' });

module.exports = {
  sequelize,
  User,
  Category,
  Product
};