import type { SvgIconProps } from "@mui/material";
import { SvgIcon } from "@mui/material";

const OpenIDConnectIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <svg xmlns="http://www.w3.org/2000/svg" focusable="false" fill="currentColor" viewBox="0 0 25.6 25.6">
      <polygon points="12.036,24.589 12.036,3.296 15.391,0.983 15.391,22.74" />
      <path
        d={
          "M11.11,7.926v2.893c0,0-6.632,0.521-7.058,5.556c0,0-0.93,4.396,7.058," +
          "5.785v2.43c0,0-11.226-1.155-11.109-8.331C0.001,16.258-0.115,8.968,11.11,7.926z"
        }
      />
      <path
        d={
          "M16.2,7.926v2.702c0,0,2.142-0.029,3.934,1.463l-1.964,0.807l7.403," +
          "1.855V8.967l-2.527,1.43C23.046,10.397,20.889,8.13,16.2,7.926z"
        }
      />
    </svg>
  </SvgIcon>
);

export default OpenIDConnectIcon;
