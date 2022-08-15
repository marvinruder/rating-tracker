import { Typography, TypographyProps } from "@mui/material";
import { FC } from "react";

interface IconTypographyProps extends TypographyProps {
  imageUrl: string;
}

const IconTypography: FC<TypographyProps & IconTypographyProps> = ({
  imageUrl,
  children,
  ...typographyProps
}: IconTypographyProps) => {
  return (
    <Typography
      {...typographyProps}
      sx={{
        paddingLeft: "1.8em",
        backgroundImage: `url(${imageUrl})`,
        backgroundRepeat: "no-repeat",
      }}
    >
      {children}
    </Typography>
  );
};

export default IconTypography;
