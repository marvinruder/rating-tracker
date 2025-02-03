import type { PortfolioAPI } from "@rating-tracker/backend/api/portfolios";
import { portfoliosAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const portfolioClient = hc<PortfolioAPI>(`${basePath}${portfoliosAPIPath}`);

export default portfolioClient;
