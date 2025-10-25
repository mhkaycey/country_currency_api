import { Router } from "express";

import countryController from "../controllers/countryController.js";
import {
  refreshCountriesValidation,
  getCountriesValidation,
  statusValidation,
  handleValidationErrors,
  validateCountryExists,
  countryNameValidation,
  imageValidation,
} from "../middleware/validator.js";

const countryRouter = Router();

countryRouter.post(
  "/refresh",
  refreshCountriesValidation,
  handleValidationErrors,
  countryController.refreshCountries
);
countryRouter.get(
  "/",
  getCountriesValidation,
  handleValidationErrors,
  countryController.getCountries
);
countryRouter.get(
  "/image",
  imageValidation,
  handleValidationErrors,
  countryController.getImage
);
countryRouter.get(
  "/status",
  statusValidation,
  handleValidationErrors,
  countryController.getStatus
);
countryRouter.get(
  "/:name",
  countryNameValidation,
  handleValidationErrors,
  validateCountryExists,
  countryController.getCountry
);
countryRouter.delete(
  "/:name",
  countryNameValidation,
  handleValidationErrors,
  validateCountryExists,
  countryController.deleteCountry
);

export default countryRouter;
