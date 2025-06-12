// models/BaseModel.js
const { query } = require('../config/db');

class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  // Generic CRUD operations
  async findAll(conditions = {}, options = {}) {
    try {
      let sqlQuery = `SELECT * FROM ${this.tableName}`;
      const queryParams = [];
      
      // Add WHERE conditions
      if (Object.keys(conditions).length > 0) {
        const whereClause = Object.keys(conditions).map((key, index) => {
          queryParams.push(conditions[key]);
          return `${key} = $${index + 1}`;
        }).join(' AND ');
        sqlQuery += ` WHERE ${whereClause}`;
      }
      
      // Add ORDER BY
      if (options.orderBy) {
        sqlQuery += ` ORDER BY ${options.orderBy}`;
        if (options.orderDirection) {
          sqlQuery += ` ${options.orderDirection}`;
        }
      }
      
      // Add LIMIT and OFFSET
      if (options.limit) {
        queryParams.push(parseInt(options.limit));
        sqlQuery += ` LIMIT $${queryParams.length}`;
      }
      
      if (options.offset) {
        queryParams.push(parseInt(options.offset));
        sqlQuery += ` OFFSET $${queryParams.length}`;
      }
      
      const result = await query(sqlQuery, queryParams);
      return result.rows;
    } catch (error) {
      throw new Error(`Error in ${this.tableName} findAll: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const result = await query(
        `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error in ${this.tableName} findById: ${error.message}`);
    }
  }

  async create(data) {
    try {
      const fields = Object.keys(data);
      const values = Object.values(data);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
      
      const sqlQuery = `
        INSERT INTO ${this.tableName} (${fields.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;
      
      const result = await query(sqlQuery, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error in ${this.tableName} create: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const fields = Object.keys(data);
      const values = Object.values(data);
      
      const setClause = fields.map((field, index) => 
        `${field} = $${index + 1}`
      ).join(', ');
      
      values.push(id);
      
      const sqlQuery = `
        UPDATE ${this.tableName}
        SET ${setClause}
        WHERE ${this.primaryKey} = $${values.length}
        RETURNING *
      `;
      
      const result = await query(sqlQuery, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error in ${this.tableName} update: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const result = await query(
        `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = $1 RETURNING *`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error in ${this.tableName} delete: ${error.message}`);
    }
  }

  async count(conditions = {}) {
    try {
      let sqlQuery = `SELECT COUNT(*) FROM ${this.tableName}`;
      const queryParams = [];
      
      if (Object.keys(conditions).length > 0) {
        const whereClause = Object.keys(conditions).map((key, index) => {
          queryParams.push(conditions[key]);
          return `${key} = $${index + 1}`;
        }).join(' AND ');
        sqlQuery += ` WHERE ${whereClause}`;
      }
      
      const result = await query(sqlQuery, queryParams);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw new Error(`Error in ${this.tableName} count: ${error.message}`);
    }
  }
}

module.exports = BaseModel;