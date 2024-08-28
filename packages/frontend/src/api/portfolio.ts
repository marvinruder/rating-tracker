import type PortfolioController from "@rating-tracker/backend/api/portfolios";
import { portfoliosAPIPath, baseURL } from "@rating-tracker/commons";
import { hc } from "hono/client";

const portfolioClient = hc<typeof PortfolioController.prototype.router>(`${baseURL}${portfoliosAPIPath}`);

export default portfolioClient;
