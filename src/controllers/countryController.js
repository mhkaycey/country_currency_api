import countryService from "../services/countryService.js";
import imageService from "../services/imageService.js";
import fs from "fs/promises";

class CountryController {
  async refreshCountries(req, res) {
    try {
      await countryService.initializeMetadata();
      const result = await countryService.refreshCountries();
      res.json({
        message: "Countries refreshed successfully",
        processed: result.processed,
      });
    } catch (error) {
      console.error("Refresh countries error:", error, error.message);
      if (error.message.includes("External data source unavailable")) {
        res.status(503).json({
          error: "External data source unavailable",
          details: `Could not fetch data from [https://restcountries.com/v2/all],https://api.exchangerate-api.com/v4/latest/ `,
        });
      } else {
        console.error("Refresh countries error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async getCountries(req, res) {
    try {
      const countries = await countryService.getCountries(req.query);
      res.json(countries);
    } catch (error) {
      console.error("Get countries error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getCountry(req, res) {
    try {
      res.json(req.country);
    } catch (error) {
      console.error("Get country error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteCountry(req, res) {
    try {
      const result = await countryService.deleteCountry(req.params.name);

      if (result.deleted) {
        res.json({ message: "Country deleted successfully" });
      } else {
        res.status(404).json({ error: "Country not found" });
      }
    } catch (error) {
      console.error("Delete country error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getStatus(req, res) {
    try {
      const status = await countryService.getStatus();
      res.json(status);
    } catch (error) {
      console.error("Get status error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }

  async getImage(req, res) {
    try {
      const imagePath = await imageService.getImagePath();
      if (!imagePath) {
        return res.status(404).json({ error: "Image not found" });
      }
      const imageBuffer = await fs.readFile(imagePath);
      res.set("Content-Type", "image/png");
      res.send(imageBuffer);
    } catch (error) {
      console.error("Get image error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default new CountryController();
