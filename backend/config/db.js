const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USERNAME || 'xu_pet_shop_user',
  password: process.env.DB_PASSWORD || '123',
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'xu_pet_shop'
});

// Log khi kết nối thành công hoặc thất bại
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

// Hàm query tiện ích
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };