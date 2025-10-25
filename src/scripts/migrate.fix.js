import database from "../config/database.config.js";

async function fixSchema() {
  let connection;
  try {
    connection = await database.getConnection();

    // Update estimated_gdp to ensure proper numeric storage
    await connection.execute(`
      ALTER TABLE countries 
      MODIFY estimated_gdp DECIMAL(20,2) NULL
    `);

    // Update exchange_rate for proper numeric storage
    await connection.execute(`
      ALTER TABLE countries 
      MODIFY exchange_rate DECIMAL(15,6) NULL
    `);

    console.log("Schema updated for proper numeric storage");

    // Update existing data to ensure numbers are stored as numbers
    await connection.execute(`
      UPDATE countries 
      SET estimated_gdp = CAST(estimated_gdp AS DECIMAL(20,2)),
          exchange_rate = CAST(exchange_rate AS DECIMAL(15,6))
    `);

    console.log("Existing data converted to proper numeric format");

    connection.release();
    process.exit(0);
  } catch (error) {
    console.error("Schema fix failed:", error);
    if (connection) connection.release();
    process.exit(1);
  }
}

fixSchema();
