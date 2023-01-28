import { FC } from "react";
import { Size, Style } from "rating-tracker-commons";

/**
 * A component that renders a Morningstar StyleBox.
 *
 * @param {StyleBoxProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const StyleBox: FC<StyleBoxProps> = (props: StyleBoxProps) => {
  /**
   * Provides the path for the correct square representing the given size and style.
   *
   * @param {Size} size The size of the company, to be represented by the square.
   * @param {Style} style The style of the company, to be represented by the square.
   * @returns {JSX.Element} The path for the square.
   */
  const getSquare = (size: Size, style: Style): JSX.Element => {
    switch (size) {
      case "Small":
        switch (style) {
          case "Value":
            return (
              <path
                d="M1.5,9.5H5.5v4H1.5v-4Z"
                vectorEffect="non-scaling-stroke"
              ></path>
            );
          case "Blend":
            return (
              <path
                d="M5.5,9.5h4v4H5.5v-4Z"
                vectorEffect="non-scaling-stroke"
              ></path>
            );
          case "Growth":
            return (
              <path
                d="M9.5,9.5h4v4h-4v-4Z"
                vectorEffect="non-scaling-stroke"
              ></path>
            );
        }

      case "Mid":
        switch (style) {
          case "Value":
            return (
              <path
                d="M1.5,5.5H5.5v4H1.5V5.5Z"
                vectorEffect="non-scaling-stroke"
              ></path>
            );
          case "Blend":
            return (
              <path
                d="M5.5,5.5h4v4H5.5V5.5Z"
                vectorEffect="non-scaling-stroke"
              ></path>
            );
          case "Growth":
            return (
              <path
                d="M9.5,5.5h4v4h-4V5.5Z"
                vectorEffect="non-scaling-stroke"
              ></path>
            );
        }

      case "Large":
        switch (style) {
          case "Value":
            return (
              <path
                d="M1.5,1.5H5.5V5.5H1.5V1.5Z"
                vectorEffect="non-scaling-stroke"
              ></path>
            );
          case "Blend":
            return (
              <path
                d="M5.5,1.5h4V5.5H5.5V1.5Z"
                vectorEffect="non-scaling-stroke"
              ></path>
            );
          case "Growth":
            return (
              <path
                d="M9.5,1.5h4V5.5h-4V1.5Z"
                vectorEffect="non-scaling-stroke"
              ></path>
            );
        }
    }
  };

  return (
    <svg
      fill={props.fill}
      stroke={props.stroke}
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 15 15"
      width={props.length}
      height={props.length}
    >
      <path
        d="M1.5,1.5H13.5V13.5H1.5V1.5Zm4,0V13.5M9.5,1.5V13.5M1.5,5.5H13.5M1.5,9.5H13.5"
        vectorEffect="non-scaling-stroke"
        fill="none"
      ></path>
      {getSquare(props.size, props.style)}
    </svg>
  );
};

/**
 * Properties for the StyleBox component.
 */
interface StyleBoxProps {
  /**
   * The size of the company, to be represented in the StyleBox.
   */
  size: Size;
  /**
   * The style of the company, to be represented in the StyleBox.
   */
  style: Style;
  /**
   * The color to fill the StyleBox with.
   */
  fill: React.CSSProperties["color"];
  /**
   * The color to be used for the stroke of the StyleBox.
   */
  stroke: React.CSSProperties["color"];
  /**
   * The width and height of the StyleBox.
   */
  length: number;
}

export default StyleBox;
