import axios from "axios";

class ExternalApiService {
  constructor() {
    this.countryApiUrl =
      "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies";
    this.exchangeRateApiUrl = "https://api.exchangerate-api.com/v4/latest/";
    this.timeout = parseInt(process.env.EXTERNAL_API_TIMEOUT) || 10000;

    this.cachedRates = null;
    this.lastFetchedBase = null;
    this.cacheTimestamp = null;
    this.cacheTTL = 1000 * 60 * 60 * 24 * 7;
  }

  async fetchCountries() {
    try {
      const response = await axios.get(this.countryApiUrl, {
        timeout: this.timeout,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching countries:", error);
      throw error;
    }
  }

  async fetchExchangeRate(currencyCode = "USD") {
    const now = new Date();

    if (
      this.cachedRates &&
      this.lastFetchedBase === currencyCode &&
      now - this.cacheTimestamp < this.cacheTTL
    ) {
      console.log(
        `Using cached exchange rates for base currency: ${currencyCode}`
      );
      return this.cachedRates;
    }
    try {
      const url = `${this.exchangeRateApiUrl}${currencyCode}`;
      console.log(`Fetched exchange rates for base currency: ${currencyCode}`);
      const response = await axios.get(url, {
        timeout: this.timeout,
      });
      console.log("Exchange API Response:", {
        status: response.status,
        dataKeys: Object.keys(response.data),
      });

      const data = response.data;
      if (data.rates) {
        this.cachedRates = data.rates;
        this.lastFetchedBase = currencyCode;
        this.cacheTimestamp = now;
        return this.cachedRates;
      } else if (data.conversion_rate) {
        this.cachedRates = data.conversion_rate;
        this.lastFetchedBase = currencyCode;
        this.cacheTimestamp = now;
        return this.cachedRates;
      } else {
        console.error("Error fetching exchange rate:", data);
        throw new Error("Error fetching exchange rate");
      }

      // return this.cachedRates;
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      throw error;
    }
  }

  extractCurrencyCode(currencies) {
    if (!currencies || currencies.length === 0) {
      return null;
    } else {
      return currencies[0].code || null;
    }
  }

  calculateEstimatedGDP(population, exchangeRate) {
    if (!population || exchangeRate === null || exchangeRate === undefined) {
      return exchangeRate === null ? 0 : null;
    }

    // Ensure population and exchangeRate are numbers
    const popNumber = Number(population);
    const rateNumber = Number(exchangeRate);

    if (isNaN(popNumber) || isNaN(rateNumber)) {
      return null;
    }

    const randomMultiplier = Math.floor(Math.random() * 1001) + 1000; // 1000-2000
    const gdp = popNumber * randomMultiplier + rateNumber;

    // Return as number, not string
    return Number(gdp.toFixed(2));
  }
}

export const externalApiService = new ExternalApiService();
