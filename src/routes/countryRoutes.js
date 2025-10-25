import { Router } from "express";

import countryController from "../controllers/countryController.js";
import {
  getCountriesValidation,
  countryNameValidation,
  refreshCountriesValidation,
  statusValidation,
  imageValidation,
  handleValidationErrors,
  validateCountryExists,
  validateCountryNameOnly,
} from "../middleware/validator.js";

const countryRouter = Router();

countryRouter.post(
  "/refresh",
  // refreshCountriesValidation,
  // handleValidationErrors,
  countryController.refreshCountries
);
countryRouter.get(
  "/image",
  // imageValidation,
  // handleValidationErrors,
  countryController.getImage
);
countryRouter.get(
  "/status",
  // statusValidation,
  // handleValidationErrors,
  countryController.getStatus
);
countryRouter.get(
  "/",
  getCountriesValidation,
  handleValidationErrors,
  countryController.getCountries
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
  validateCountryNameOnly,
  handleValidationErrors,
  // validateCountryExists,
  countryController.deleteCountry
);

export default countryRouter;
