import { useMediaQuery, useTheme } from "@mui/material";
import { handleResponse } from "@rating-tracker/commons";
import { useEffect, useRef, useState } from "react";

import logoBackgroundClient from "../../api/logobackground";

/**
 * The maximum number of logos to show.
 */
const MAX_COUNT = 50;

/**
 * The background of the page, showing stock logos.
 * @returns The component.
 */
export const LogoBackground = (): React.JSX.Element => {
  const [logos, setLogos] = useState<string[]>([]);

  const theme = useTheme();

  const backgroundContainerRef = useRef<HTMLDivElement>(null);

  const count = 25 + 25 * +useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    Array.from(document.getElementsByClassName("backgroundlogo")).forEach((logoDiv) => {
      if (logoDiv instanceof HTMLElement)
        logoDiv.animate(
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

  useEffect(() => {
    if (theme.palette.mode)
      logoBackgroundClient.index
        .$get({ query: { variant: theme.palette.mode, count: String(count) } })
        .then(handleResponse)
        .then((res) => {
          setLogos(res.data);
          if (backgroundContainerRef.current) backgroundContainerRef.current.style.opacity = "1";
        })
        .catch(() => undefined); // Ignore errors since the background is not that important
  }, [theme.palette.mode]);

  return (
    <div
      ref={backgroundContainerRef}
      style={{
        position: "fixed",
        width: "100vw",
        height: "200dvh", // background shall still be visible with overscroll
        overflow: "scroll",
        background: theme.palette.background.default,
        zIndex: -2,
        filter: "blur(1px)",
        opacity: 0,
        transition: "opacity 2s",
      }}
    >
      {[...Array(MAX_COUNT)].map((_, i) => (
        <div
          key={i}
          className="backgroundlogo"
          style={{
            ...(i > count ? { display: "none" } : {}),
            ...(logos[i] ? { backgroundImage: `url('data:image/svg+xml;base64,${btoa(logos[i])}')` } : {}),
            position: "absolute",
            height: `${80 - (30 * i) / count}px`,
            width: `${80 - (30 * i) / count}px`,
            maxHeight: "12.5vmin",
            maxWidth: "12.5vmin",
            backgroundSize: "contain",
          }}
        />
      ))}
    </div>
  );
};
