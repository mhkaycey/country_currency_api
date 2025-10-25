import CountryModel from "../model/countryModel.js";
import { externalApiService } from "./externalApiService.js";
import imageService from "./imageService.js";
import db from "../config/database.config.js";

class CountryService {
  async refreshCountries(batchSize = 100) {
    let countriesData, exchangeRates;

    try {
      // Fetch from external APIs
      countriesData = await externalApiService.fetchCountries();
      exchangeRates = await externalApiService.fetchExchangeRate();

      // console.log("countriesData:", countriesData);
      console.log("exchangeRatesService:", exchangeRates);
    } catch (error) {
      throw new Error(`External data source unavailable: ${error.message}`);
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      let processedCount = 0;
      let successfulCountries = 0;
      const batch = [];

      for (const country of countriesData) {
        try {
          const currencyCode = externalApiService.extractCurrencyCode(
            country.currencies
          );
          console.log("currencyCode:", currencyCode);
          const exchangeRate = exchangeRates[currencyCode];
          let estimatedGDP = externalApiService.calculateEstimatedGDP(
            country.population,
            exchangeRate
          );
          console.log("estimatedGDP:", estimatedGDP);

          if (currencyCode && exchangeRates[currencyCode]) {
            successfulCountries++;
          } else if (currencyCode === null) {
            estimatedGDP = 0;
          }

          batch.push([
            country.name ?? null,
            country.capital ?? null,
            country.region ?? null,
            country.population ?? null,
            currencyCode ?? null,
            exchangeRate ?? null,
            estimatedGDP ?? null,
            country.flag ?? null,
          ]);

          processedCount++;

          // When batch limit reached, insert
          if (batch.length === batchSize) {
            await this._insertBatch(connection, batch);
            batch.length = 0; // clear batch
          }
        } catch (countryError) {
          console.error(`Error processing ${country.name}:`, countryError);
          continue;
        }
      }

      // Insert any remaining batch
      if (batch.length > 0) {
        await this._insertBatch(connection, batch);
      }

      // Update metadata
      await connection.execute(
        `UPDATE app_metadata
         SET total_countries = ?, last_refreshed_at = CURRENT_TIMESTAMP
         WHERE id = 1`,
        [processedCount]
      );

      await connection.commit();

      // Optional: Generate summary image
      try {
        const totalCountries = processedCount;
        const topCountries = await CountryModel.getTopCountriesByGDP(5);
        const status = await this.getStatus();

        await imageService.generateSummaryImage(
          totalCountries,
          topCountries,
          status.last_refreshed_at
        );
      } catch (imageError) {
        console.error("Error generating summary image:", imageError);
      }

      return {
        processed: processedCount,
        successful: successfulCountries,
        failed: processedCount - successfulCountries,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Batch insert or update countries in a single query
   */
  async _insertBatch(connection, batch) {
    const query = `
      INSERT INTO countries (
        name, capital, region, population,
        currency_code, exchange_rate, estimated_gdp, flag_url
      )
      VALUES ?
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

    await connection.query(query, [batch]);
  }

  async getCountries(filters = {}) {
    try {
      return await CountryModel.findAll(filters);
    } catch (error) {
      console.error("Error getting countries:", error);
      throw new Error("Failed to fetch countries");
    }
  }

  async getCountryByName(name) {
    try {
      const country = await CountryModel.findByName(name);
      if (!country) throw new Error("Country not found");
      return country;
    } catch (error) {
      if (error.message === "Country not found") throw error;
      console.error("Error getting country by name:", error);
      throw new Error("Failed to fetch country");
    }
  }

  async deleteCountry(name) {
    try {
      const country = await CountryModel.findByName(name);
      if (!country) {
        return { deleted: false, message: "Country not found" };
      }

      const deleted = await CountryModel.deleteByName(name);
      return {
        deleted: deleted,
        message: deleted ? "Country deleted successfully" : "Country not found",
      };
    } catch (error) {
      console.error("Error deleting country:", error);
      throw new Error("Failed to delete country");
    }
  }

  async getStatus() {
    try {
      const [metadata] = await db.query(
        "SELECT total_countries, last_refreshed_at FROM app_metadata WHERE id = 1"
      );
      console.log("metadata:", metadata);

      if (!metadata) {
        console.log(
          "No metadata found" + metadata + metadata.length + metadata[0]
        );
        return { total_countries: 0, last_refreshed_at: null };
      }

      const status = metadata;
      console.log("Status:", status);
      return {
        total_countries: status.total_countries || 0,
        last_refreshed_at: status.last_refreshed_at || null,
      };
    } catch (error) {
      console.error("Error getting status:", error);
      return { total_countries: 0, last_refreshed_at: null };
    }
  }

  async initializeMetadata() {
    try {
      const [existingMetadata] = await db.query(
        "SELECT id FROM app_metadata WHERE id = 1"
      );

      if (!existingMetadata || existingMetadata.length === 0) {
        await db.query(
          "INSERT INTO app_metadata (id, total_countries, last_refreshed_at) VALUES (1, 0, NULL)"
        );
        console.log("App metadata initialized");
      }
    } catch (error) {
      console.error("Error initializing metadata:", error);
      throw error;
    }
  }
}

export default new CountryService();
