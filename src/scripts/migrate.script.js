import database from "../config/database.config.js";

async function createTables() {
  try {
    const connection = await database.getConnection();

    await connection.execute(
      `CREATE TABLE IF NOT EXISTS countries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                capital VARCHAR(255),
                region VARCHAR(255),
                population BIGINT NOT NULL,
                currency_code VARCHAR(10),
                exchange_rate DECIMAL(15, 6),
                estimated_gdp DECIMAL(20, 2),
                flag_url TEXT,
                last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_name (name),
                INDEX idx_region (region),
                INDEX idx_currency_code (currency_code),
                INDEX idx_estimated_gdp (estimated_gdp)
            )`
    );
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS app_metadata (
        id INT AUTO_INCREMENT PRIMARY KEY,
        total_countries INT DEFAULT 0,
        last_refreshed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert initial metadata
    await connection.execute(`
      INSERT IGNORE INTO app_metadata (id, total_countries, last_refreshed_at) 
      VALUES ( 0, NULL)
    `);

    connection.release();
    console.log("Database tables created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error creating database tables:", error);
    process.exit(1);
  }
}

createTables();
