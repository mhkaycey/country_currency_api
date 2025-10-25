import database from "../config/database.config.js";

class CountryModel {
  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT id, name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, last_refreshed_at
        FROM countries
        WHERE 1 = 1
        `;
      const params = [];

      if (filters.region) {
        query += ` AND region = ?`;
        params.push(filters.region);
      }

      if (filters.currency) {
        query += ` AND currency_code = ?`;
        params.push(filters.currency);
      }

      if (filters.sort) {
        const sortMapping = {
          gdp_desc: "estimated_gdp DESC",
          gdp_asc: "estimated_gdp ASC",
          name_asc: "name ASC",
          name_desc: "name DESC",
          population_desc: "population DESC",
          population_asc: "population ASC",
        };
        query += ` ORDER BY ${sortMapping[filters.sort] || "name ASC"}`;
      } else {
        query += ` ORDER BY name ASC`;
      }
      const results = await database.query(query, params);

      return Array.isArray(results) ? results : [];
    } catch (error) {
      console.error("Error in Country.findAll:", error);
      return [];
    }
  }

  static async findByName(name) {
    try {
      const results = await database.query(
        "SELECT * FROM countries WHERE LOWER(name) = LOWER(?)",
        [name]
      );

      if (Array.isArray(results) && results.length > 0) {
        return results[0];
      } else if (
        results &&
        typeof results === "object" &&
        !Array.isArray(results)
      ) {
        return results;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error in Country.findByName:", error);
      return null;
    }
  }

  static async createOrUpdate(countryData) {
    try {
      const {
        name,
        capital,
        region,
        population,
        currency_code,
        exchange_rate,
        estimated_gdp,
        flag_url,
      } = countryData;
      const query = `
        INSERT INTO countries (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        capital = VALUES(capital),
        region = VALUES(region),
        population = VALUES(population),
        currency_code = VALUES(currency_code),
        exchange_rate = VALUES(exchange_rate),
        estimated_gdp = VALUES(estimated_gdp),
        flag_url = VALUES(flag_url),
        last_refreshed_at = CURRENT_TIMESTAMP
    
        `;
      const params = [
        name ?? null,
        capital ?? null,
        region ?? null,
        population ?? null,
        currency_code ?? null,
        exchange_rate ?? null,
        estimated_gdp ?? null,
        flag_url ?? null,
      ];
      return await database.query(query, params);
    } catch (error) {
      console.error("Error in Country.createOrUpdate:", error);
      throw error;
    }
  }

  static async deleteByName(name) {
    const query = await database.query(
      "DELETE FROM countries WHERE LOWER(name) = LOWER(?)",
      [name]
    );

    return query.affectedRows > 0;
  }

  static async getCount() {
    const [rows] = await database.query(
      "SELECT COUNT(*) AS count FROM countries"
    );
    // rows should be an array with one object { count: <number> }
    return rows && rows.length > 0 ? Number(rows[0].count) : 0;
  }

  // static async getStatus() {
  //   const [rows] = await database.query(
  //     "SELECT * FROM app_metadata WHERE id = 0"
  //   );

  //   if (!rows || rows.length === 0) {
  //     console.warn("⚠️ No metadata record found — initializing default entry.");
  //     // Optionally insert a default entry so it exists next time
  //     await database.query(`
  //     INSERT INTO app_metadata (id, total_countries, last_refreshed_at)
  //     VALUES (1, 0, CURRENT_TIMESTAMP)
  //     ON DUPLICATE KEY UPDATE last_refreshed_at = CURRENT_TIMESTAMP
  //   `);
  //     return { id: 1, total_countries: 0, last_refreshed_at: new Date() };
  //   }

  //   return rows[0];
  // }

  static async getTopCountriesByGDP(limit = 5) {
    // Ensure limit is a number
    const safeLimit = Number(limit) || 5;

    const query = `
    SELECT name, estimated_gdp
    FROM countries
    ORDER BY estimated_gdp DESC
    LIMIT ${safeLimit}
  `;

    return await database.query(query);
  }
}

export default CountryModel;
