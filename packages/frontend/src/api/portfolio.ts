import type PortfolioController from "@rating-tracker/backend/api/portfolios";
import { portfoliosAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const portfolioClient = hc<typeof PortfolioController.prototype.router>(`${basePath}${portfoliosAPIPath}`);

export default portfolioClient;
