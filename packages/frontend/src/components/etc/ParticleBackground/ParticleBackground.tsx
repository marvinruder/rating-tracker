import { useMediaQuery, useTheme } from "@mui/material";
import { stockLogoBackgroundEndpointPath } from "@rating-tracker/commons";
import { useEffect, useState } from "react";

import api from "../../../utils/api";

/**
 * The maximum number of logos to show.
 */
const MAX_COUNT = 60;

/**
 * The background of the page, showing particles.
 *
 * @returns {JSX.Element} The component.
 */
export const ParticleBackground = (): JSX.Element => {
  const [logos, setLogos] = useState<string[]>(new Array(MAX_COUNT).fill(""));
  const theme = useTheme();

  const count = 30 + 30 * +useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    api
      .get(`${stockLogoBackgroundEndpointPath}`, { params: { dark: theme.palette.mode === "dark" } })
      .then((res) => setLogos(res.data))
      .catch(() => undefined); // Ignore errors since the background is not that important
    Array.from(document.getElementsByClassName("backgroundlogo")).forEach((logo) => {
      logo.animate(
        {
          transform: [
            `translate(${Math.random() * 100}vw, ${Math.random() * 100}dvh)`,
            `translate(${Math.random() * 100}vw, ${Math.random() * 100}dvh)`,
          ],
          opacity: [0, 0.4, 0.4, 0.4, 0],
        },
        { delay: Math.random() * -60000, duration: 60000, easing: "ease-in-out", iterations: Infinity },
      );
    });
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        zIndex: -1,
        filter: "blur(1.5px)",
      }}
    >
      {[...Array(MAX_COUNT)].map((_, i) => (
        <div
          key={i}
          className="backgroundlogo"
          style={{
            ...(i > count ? { display: "none" } : {}),
            position: "absolute",
            height: `${80 - (40 * i) / count}px`,
            width: `${80 - (40 * i) / count}px`,
            maxHeight: "12.5vmin",
            maxWidth: "12.5vmin",
          }}
          dangerouslySetInnerHTML={{ __html: logos[i] }}
        />
      ))}
    </div>
  );
};
