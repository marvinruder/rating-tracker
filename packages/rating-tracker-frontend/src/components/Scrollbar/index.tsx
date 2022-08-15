import { FC, ReactNode } from "react";
import PropTypes from "prop-types";
import { Scrollbars } from "react-custom-scrollbars-2";

interface ScrollbarProps {
  className?: string;
  children?: ReactNode;
}

const Scrollbar: FC<ScrollbarProps> = ({ children, ...rest }) => {
  return (
    <Scrollbars autoHide {...rest}>
      {children}
    </Scrollbars>
  );
};

Scrollbar.propTypes = {
  children: PropTypes.node,
};

export default Scrollbar;
