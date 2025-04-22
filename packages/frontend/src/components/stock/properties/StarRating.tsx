import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import { Box } from "@mui/material";

/**
 * A component that displays a rating of 1 to 5 stars using full and empty star icons.
 * @param props The properties of the component.
 * @returns The component.
 */
export const StarRating: React.FC<StarRatingProps> = (props: StarRatingProps): React.JSX.Element => {
  let value: 0 | 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;
  switch (Math.round(2 * (props.value ?? 0)) / 2) {
    case 0.5:
    case 1:
    case 1.5:
    case 2:
    case 2.5:
    case 3:
    case 3.5:
    case 4:
    case 4.5:
    case 5:
      value = Math.round(2 * (props.value ?? 0)) / 2;
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
  value: number | null;
  /**
   * The size of the stars.
   */
  size?: "small" | "medium" | "large" | "inherit";
}
