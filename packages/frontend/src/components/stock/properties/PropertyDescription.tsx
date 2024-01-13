import { Typography } from "@mui/material";

/**
 * A property of a stock for which a description text exists.
 */
type DescribedProperty =
  | "amount"
  | "country"
  | "size"
  | "style"
  | "sector"
  | "industry"
  | "totalScore"
  | "financialScore"
  | "esgScore"
  | "starRating"
  | "morningstarFairValue"
  | "analystConsensus"
  | "analystTargetPrice"
  | "analystCount"
  | "msciESGRating"
  | "msciTemperature"
  | "lsegESGScore"
  | "lsegEmissions"
  | "spESGScore"
  | "sustainalyticsESGRisk"
  | "positionIn52w"
  | "dividendYieldPercent"
  | "priceEarningRatio"
  | "marketCap";

/**
 * A component that displays the description of a stock property. To be used in tooltips of table headers.
 *
 * @param {{property: DescribedProperty}} props The properties of the component.
 * @param {keyof WeightedStock} props.property The property to display the description of.
 * @returns {JSX.Element} A component that displays the description of a stock property.
 */
export const PropertyDescription = (props: { property: DescribedProperty }): JSX.Element => {
  switch (props.property) {
    case "amount":
      return (
        <Typography variant="body1">The amount of currency associated with the stock in this portfolio.</Typography>
      );
    case "country":
      return <Typography variant="body1">The Country of the company’s operational headquarters.</Typography>;
    case "size":
      return (
        <>
          <Typography variant="body1" paddingBottom={1}>
            The Size of a company based on its market capitalization and geographic area.
          </Typography>
          <Typography variant="body2">
            Large-cap stocks are defined as the group that accounts for the top 70% of the capitalization of each
            geographic area; mid-cap stocks represent the next 20%; and small-cap stocks represent the balance.
          </Typography>
        </>
      );
    case "style":
      return (
        <Typography variant="body1">
          The Style category based on the value and growth characteristics of a company.
        </Typography>
      );
    case "sector":
      return <Typography variant="body1">The general sphere in which a company does business.</Typography>;
    case "industry":
      return <Typography variant="body1">A fine-grained categorization of a company’s business.</Typography>;
    case "totalScore":
      return (
        <>
          <Typography variant="body1" paddingBottom={1}>
            An overall score that combines the financial and ESG scores, computed as the harmonic mean of both, so that
            a stock has to perform well in both financial and ESG ratings to obtain a good total score.
          </Typography>
          <Typography variant="body2">
            Values range from 0 to 100, where a score of 0 indicates an average-performing company and a score of 100
            indicates a company with perfect overall performance.
          </Typography>
        </>
      );
    case "financialScore":
      return (
        <>
          <Typography variant="body1" paddingBottom={1}>
            A score that measures the financial strength of a company.
          </Typography>
          <Typography variant="body2">
            Values range from 0 to 100, where a score of 0 indicates an average-performing company and a score of 100
            indicates a company with perfect financial performance.
          </Typography>
        </>
      );
    case "esgScore":
      return (
        <>
          <Typography variant="body1" paddingBottom={1}>
            A score that measures the environmental, social, and governance (ESG) behavior of a company.
          </Typography>
          <Typography variant="body2">
            Values range from 0 to 100, where a score of 0 indicates an average-behaving company and a score of 100
            indicates a company with perfect ESG behavior.
          </Typography>
        </>
      );
    case "starRating":
      return (
        <>
          <Typography variant="body1" paddingBottom={1}>
            The Morningstar star rating is determined by a stock’s current price, Morningstar’s estimate of the stock’s
            fair value, and the uncertainty rating of the fair value. The bigger the discount, the higher the star
            rating.
          </Typography>
          <Typography variant="body2">
            Four- and 5-star ratings mean the stock is undervalued, while a 3-star rating means it’s fairly valued, and
            1- and 2-star stocks are overvalued. When looking for investments, a 5-star stock is generally a better
            opportunity than a 1-star stock.
          </Typography>
        </>
      );
    case "morningstarFairValue":
      return (
        <>
          <Typography variant="body1" paddingBottom={1}>
            The Morningstar Fair Value Estimate tells investors what the long-term intrinsic value of a stock is. It is
            calculated using a proprietary model that combines the company’s financial statements, analyst estimates,
            and other factors to determine the company’s fair value.
          </Typography>
          <Typography variant="body2">
            The percentage difference between the stock’s current price and the fair value estimate indicates the
            stock’s discount (negative percentage) or premium (positive percentage) to its fair value. A stock that is
            trading at a discount to its fair value is considered undervalued, while a stock trading at a premium to its
            fair value is considered overvalued.
          </Typography>
        </>
      );
    case "analystConsensus":
      return (
        <>
          <Typography variant="body1" paddingBottom={1}>
            The consensus of analyst recommendations for a stock is calculated by aggregating the recommendations of
            analysts who cover the stock and then normalizing the data to a scale of 0 to 10.
          </Typography>
          <Typography variant="body2">
            A score of 0 indicates a strong sell recommendation, while a score of 10 indicates a strong buy
            recommendation.
          </Typography>
        </>
      );
    case "analystTargetPrice":
      return (
        <>
          <Typography variant="body1" paddingBottom={1}>
            The average analyst target price is the average of the estimated price targets of analysts who cover a
            stock.
          </Typography>
          <Typography variant="body2">
            The percentage difference between the stock’s current price and the average analyst target price indicates
            the stock’s discount (negative percentage) or premium (positive percentage) to its average analyst target
            price. A stock that is trading at a discount to its average analyst target price is considered undervalued,
            while a stock trading at a premium to its average analyst target price is considered overvalued.
          </Typography>
        </>
      );
    case "analystCount":
      return <Typography variant="body1">The number of analysts that cover a stock.</Typography>;
    case "msciESGRating":
      return (
        <>
          <Typography variant="body1" paddingBottom={1}>
            The MSCI ESG Rating aims to measure a company’s management of financially relevant ESG risks and
            opportunities. MSCI uses a rules-based methodology to identify industry leaders and laggards according to
            their exposure to ESG risks and how well they manage those risks relative to peers.
          </Typography>
          <Typography variant="body2">
            The ESG Ratings range from leader (AAA, AA), average (A, BBB, BB) to laggard (B, CCC).
          </Typography>
        </>
      );
    case "msciTemperature":
      return (
        <Typography variant="body1">
          The MSCI Implied Temperature Rise is a forward-looking metric designed to show the temperature alignment of a
          company with global temperature goals.
        </Typography>
      );
    case "lsegESGScore":
      return (
        <>
          <Typography variant="body1" paddingBottom={1}>
            The LSEG ESG Score measures a company’s ESG performance based on verifiable reported data in the public
            domain.
          </Typography>
          <Typography variant="body2">
            Its values range from 0 to 100, with 0 being the lowest, indicating a poor ESG performance, and 100 being
            the highest, indicating an excellent ESG performance.
          </Typography>
        </>
      );
    case "lsegEmissions":
      return (
        <>
          <Typography variant="body1" paddingBottom={1}>
            The LSEG ESG emissions reduction score measures a company’s commitment and effectiveness towards reducing
            environmental emissions in its production and operational processes.
          </Typography>
          <Typography variant="body2">
            Its values range from 0 to 100, with 0 being the lowest, indicating poor emission reduction efforts, and 100
            being the highest, indicating excellent emission reduction efforts.
          </Typography>
        </>
      );
    case "spESGScore":
      return (
        <>
          <Typography variant="body1" paddingBottom={1}>
            The S&P Global ESG Score measures a companies’ exposure to and performance on key ESG risks and
            opportunities, the quality and completeness of their public disclosures, and their awareness of emerging but
            underreported ESG issues.
          </Typography>
          <Typography variant="body2">
            Its values range from 0 to 100, with 0 being the lowest, indicating a poor ESG performance, and 100 being
            the highest, indicating an excellent ESG performance.
          </Typography>
        </>
      );
    case "sustainalyticsESGRisk":
      return (
        <>
          <Typography variant="body1" paddingBottom={1}>
            The Sustainalytics ESG Risk Rating measures the degree to which a company’s economic value is at risk driven
            by ESG factors.
          </Typography>
          <Typography variant="body2">
            Its values are distributed across five categories, where values below 10 indicate a negligible risk, and
            values above 40 indicate a severe risk.
          </Typography>
        </>
      );
    case "positionIn52w":
      return (
        <Typography variant="body1">
          This range represents the lowest and highest price at which the stock has traded in the last 52 weeks, as well
          as the last price at the end of a trading day.
        </Typography>
      );
    case "dividendYieldPercent":
      return <Typography variant="body1">The annual dividend per share divided by the current stock price.</Typography>;
    case "priceEarningRatio":
      return (
        <Typography variant="body1">The company’s current market capitalization divided by its earnings.</Typography>
      );
    case "marketCap":
      return (
        <Typography variant="body1">
          The current price of a stock multiplied by the number of all its shares.
        </Typography>
      );
  }
};
