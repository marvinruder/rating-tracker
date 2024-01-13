import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import { Box } from "@mui/material";

/**
 * A component that displays a rating of 1 to 5 stars using full and empty star icons.
 *
 * @param {StarRatingProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const StarRating: React.FC<StarRatingProps> = (props: StarRatingProps): JSX.Element => {
  let value: 0 | 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;
  switch (Math.round(2 * props.value) / 2) {
    case 0.5:
      value = 0.5;
      break;
    case 1:
      value = 1;
      break;
    case 1.5:
      value = 1.5;
      break;
    case 2:
      value = 2;
      break;
    case 2.5:
      value = 2.5;
      break;
    case 3:
      value = 3;
      break;
    case 3.5:
      value = 3.5;
      break;
    case 4:
      value = 4;
      break;
    case 4.5:
      value = 4.5;
      break;
    case 5:
      value = 5;
      break;
    default:
      value = 0;
      break;
  }
  return (
    <Box sx={{ whiteSpace: "nowrap" }}>
      {[...Array(5).keys()].map((index) => {
        return value > index ? (
          value === index + 0.5 ? (
            <StarHalfIcon key={index} fontSize={props.size} />
          ) : (
            <StarIcon key={index} fontSize={props.size} />
          )
        ) : (
          <StarOutlineIcon key={index} fontSize={props.size} />
        );
      })}
    </Box>
  );
};

/**
 * Properties for the StarRating component.
 */
interface StarRatingProps {
  /**
   * The rating value.
   */
  value?: number;
  /**
   * The size of the stars.
   */
  size?: "small" | "medium" | "large" | "inherit";
}
