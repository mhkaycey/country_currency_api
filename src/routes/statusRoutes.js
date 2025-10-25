import { Router } from "express";

import countryController from "../controllers/countryController.js";

const statusRoute = Router();

statusRoute.get(
  "/",

  countryController.getStatus
);

export default statusRoute;
