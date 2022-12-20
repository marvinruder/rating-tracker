import { Currency } from "../Currency.js";
import { Country } from "../geo/Country.js";
import { Industry } from "../gics/Industry.js";
import { MSCIESGRating } from "../ratings/MSCI.js";
import { Size } from "../stylebox/Size.js";
import { Style } from "../stylebox/Style.js";

export class Stock {
  ticker: string;
  name: string;
  isin: string;
  country: Country;
  industry?: Industry;
  size?: Size;
  style?: Style;
  morningstarId?: string;
  morningstarLastFetch?: Date;
  starRating?: number;
  dividendYieldPercent?: number;
  priceEarningRatio?: number;
  currency?: Currency;
  lastClose?: number;
  morningstarFairValue?: number;
  marketCap?: number;
  low52w?: number;
  high52w?: number;
  marketScreenerId?: string;
  marketScreenerLastFetch?: Date;
  analystConsensus?: number;
  analystCount?: number;
  analystTargetPrice?: number;
  msciId?: string;
  msciLastFetch?: Date;
  msciESGRating?: MSCIESGRating;
  msciTemperature?: number;
  ric?: string;
  refinitivLastFetch?: Date;
  refinitivESGScore?: number;
  refinitivEmissions?: number;
  spId?: number;
  spLastFetch?: Date;
  spESGScore?: number;
  sustainalyticsId?: string;
  sustainalyticsESGRisk?: number;

  constructor(stock?: Partial<Stock>) {
    if (stock) {
      Object.assign(this, stock);
    }
  }

  private getStarRatingScore(): number {
    switch (this.starRating) {
      case 1:
        return -1;
      case 2:
        return -0.5;
      case 3:
        return 0;
      case 4:
        return 0.5;
      case 5:
        return 1;
      default:
        return 0;
    }
  }

  private getMorningstarFairValueScore(): number | undefined {
    const percentageToLastClose = this.getPercentageToLastClose(
      "morningstarFairValue"
    );
    return percentageToLastClose !== undefined
      ? -percentageToLastClose / 50
      : undefined;
  }

  private getAnalystConsensusScore(): number | undefined {
    if (this.analystCount && this.analystConsensus !== undefined) {
      if (this.analystCount >= 10) {
        return (this.analystConsensus - 5) / 5;
      } else {
        return (this.analystCount / 10) * ((this.analystConsensus - 5) / 5);
      }
    } else {
      return undefined;
    }
  }

  private getAnalystTargetPriceScore(): number | undefined {
    const percentageToLastClose =
      this.getPercentageToLastClose("analystTargetPrice");
    if (this.analystCount && percentageToLastClose !== undefined) {
      if (this.analystCount >= 10) {
        return -percentageToLastClose / 50;
      } else {
        return (this.analystCount / 10) * (-percentageToLastClose / 50);
      }
    } else {
      return undefined;
    }
  }

  public getFinancialScore(): number {
    const starRatingScore = this.getStarRatingScore();
    const morningstarFairValueScore = this.getMorningstarFairValueScore();
    const analystConsensusScore = this.getAnalystConsensusScore();
    const analystTargetPriceScore = this.getAnalystTargetPriceScore();

    let financialScore = 0;
    let count = 0;

    if (starRatingScore !== undefined) {
      financialScore += starRatingScore;
      count += 1;
    }
    if (morningstarFairValueScore !== undefined) {
      financialScore += Math.min(morningstarFairValueScore, 1);
      count += 1;
    }
    if (analystConsensusScore !== undefined) {
      financialScore += analystConsensusScore;
      count += 1;
    }
    if (analystTargetPriceScore !== undefined) {
      financialScore += Math.min(analystTargetPriceScore, 1);
      count += 1;
    }

    return financialScore / Math.max(3, count);
  }

  private getMSCIESGRatingScore(): number | undefined {
    if (!this.msciESGRating) {
      return undefined;
    }
    switch (this.msciESGRating) {
      case "AAA":
        return 1;
      case "AA":
        return 0.5;
      case "A":
        return 0;
      case "BBB":
        return -0.5;
      case "BB":
        return -1;
      case "B":
        return -1.5;
      case "CCC":
        return -2;
    }
  }

  private getMSCITemperatureScore(): number | undefined {
    return this.msciTemperature ? 2 - this.msciTemperature : undefined;
  }

  private getRefinitivESGScore(): number | undefined {
    return this.refinitivESGScore !== undefined
      ? (this.refinitivESGScore - 50) / 50
      : undefined;
  }

  private getRefinitivEmissionsScore(): number | undefined {
    return this.refinitivEmissions !== undefined
      ? (this.refinitivEmissions - 50) / 50
      : undefined;
  }

  private getSPESGScore(): number | undefined {
    return this.spESGScore !== undefined
      ? (this.spESGScore - 50) / 50
      : undefined;
  }

  private getSustainalyticsESGRiskScore(): number | undefined {
    return this.sustainalyticsESGRisk !== undefined
      ? 1 - this.sustainalyticsESGRisk / 20
      : undefined;
  }

  public getESGScore(): number {
    const msciESGRatingScore = this.getMSCIESGRatingScore();
    const msciTemperatureScore = this.getMSCITemperatureScore();
    const refinitivESGScore = this.getRefinitivESGScore();
    const refinitivEmissionsScore = this.getRefinitivEmissionsScore();
    const spESGScore = this.getSPESGScore();
    const sustainalyticsESGRiskScore = this.getSustainalyticsESGRiskScore();

    let esgScore = 0;
    let count = 0;

    if (msciESGRatingScore !== undefined) {
      esgScore += msciESGRatingScore;
      count += 1;
    }
    if (msciTemperatureScore !== undefined) {
      esgScore += msciTemperatureScore;
      count += 1;
    }
    if (refinitivESGScore !== undefined) {
      esgScore += refinitivESGScore;
      count += 1;
    }
    if (refinitivEmissionsScore !== undefined) {
      esgScore += refinitivEmissionsScore;
      count += 1;
    }
    if (spESGScore !== undefined) {
      esgScore += spESGScore;
      count += 1;
    }
    if (sustainalyticsESGRiskScore !== undefined) {
      esgScore += sustainalyticsESGRiskScore;
      count += 1;
    }

    return esgScore / Math.max(4, count);
  }

  public getTotalScore(): number {
    return this.getFinancialScore() * 0.5 + this.getESGScore() * 0.5;
  }

  public getPercentageToLastClose(
    attribute: "morningstarFairValue" | "analystTargetPrice"
  ): number | undefined {
    return this[attribute] && this.lastClose
      ? 100 * (this.lastClose / this[attribute] - 1)
      : undefined;
  }
}
