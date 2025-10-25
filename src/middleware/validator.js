import { body, param, query, validationResult } from "express-validator";

// Validation rules
export const refreshCountriesValidation = [];

export const getCountriesValidation = [
  query("region")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Region must be between 1 and 100 characters"),

  query("currency")
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage("Currency code must be between 1 and 10 characters"),

  query("sort")
    .optional()
    .isIn([
      "gdp_desc",
      "gdp_asc",
      "name_asc",
      "name_desc",
      "population_desc",
      "population_asc",
    ])
    .withMessage("Invalid sort parameter"),
];

export const countryNameValidation = [
  param("name")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage(
      "Country name is required and must be between 1 and 255 characters"
    )
    .matches(/^[a-zA-Z\s\-()',.]+$/)
    .withMessage(
      "Country name can only contain letters, spaces, hyphens, and common punctuation"
    ),
];

export const statusValidation = [];

export const imageValidation = [];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorDetails = {};
    errors.array().forEach((error) => {
      // Extract field name from param or query
      const field = error.type === "field" ? error.path : error.param;
      errorDetails[field] = error.msg;
    });

    return res.status(400).json({
      error: "Validation failed",
      details: errorDetails,
    });
  }

  next();
};

// Custom validation for country existence
export const validateCountryExists = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const CountryModel = (await import("../model/countryModel.js")).default;
    const country = await CountryModel.findByName(req.params.name);

    if (!country) {
      return res.status(404).json({ error: "Country not found" });
    }

    req.country = country;
    next();
  } catch (error) {
    console.error("Country validation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const validateCountryNameOnly = [
  param("name")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage(
      "Country name is required and must be between 1 and 255 characters"
    )
    .matches(/^[a-zA-Z\s\-()',.]+$/)
    .withMessage(
      "Country name can only contain letters, spaces, hyphens, and common punctuation"
    ),
];
