import mysql from "mysql2/promise";
import {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_URL,
} from "./env.config.js";

const dbConfig = {
  host: DB_HOST,
  port: DB_PORT || 3306,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  reconnect: true,
};
// console.log("Database config:", dbConfig);

// if (DB_URL) {
//   dbConfig.url = DB_URL;
// }

class Database {
  constructor() {
    this.db = mysql.createPool(dbConfig);
  }

  async query(sql, params = []) {
    try {
      const [results] = await this.db.execute(sql, params);
      console.log("Query results", results);
      return results;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  async getConnection() {
    try {
      const connection = await this.db.getConnection();
      return connection;
    } catch (error) {
      console.error("Database connection error:", error);
      throw error;
    }
  }
}

export default new Database();
