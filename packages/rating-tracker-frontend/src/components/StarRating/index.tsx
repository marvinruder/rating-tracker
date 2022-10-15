import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";

const StarRating: React.FC<StarRatingProps> = (props: StarRatingProps) => {
  let value: 0 | 1 | 2 | 3 | 4 | 5;
  switch (props.value) {
    case 1:
      value = 1;
      break;
    case 2:
      value = 2;
      break;
    case 3:
      value = 3;
      break;
    case 4:
      value = 4;
      break;
    case 5:
      value = 5;
      break;
    default:
      value = 0;
      break;
  }
  return (
    <>
      {[...Array(5).keys()].map((index) => {
        return (value as number) > index ? (
          <StarIcon key={index} />
        ) : (
          <StarOutlineIcon key={index} />
        );
      })}
    </>
  );
};

interface StarRatingProps {
  value?: number;
}

export default StarRating;
