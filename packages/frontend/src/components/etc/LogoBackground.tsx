import { useMediaQuery, useTheme } from "@mui/material";
import { handleResponse } from "@rating-tracker/commons";
import { useEffect, useRef } from "react";

import logoBackgroundClient from "../../api/logobackground";

/**
 * The maximum number of logos to show.
 */
const MAX_COUNT = 50;

/**
 * The background of the page, showing stock logos.
 * @returns The component.
 */
export const LogoBackground = (): JSX.Element => {
  const theme = useTheme();
  const backgroundContainerRef = useRef<HTMLDivElement>(null);

  const count = 25 + 25 * +useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    logoBackgroundClient.index
      .$get({ query: { variant: theme.palette.mode, count: String(count) } })
      .then(handleResponse)
      .then((res) => {
        const logos = res.data as string[];
        Array.from(document.getElementsByClassName("backgroundlogo")).forEach((logoDiv, i) => {
          if (logoDiv instanceof HTMLElement && logos[i]) {
            logoDiv.style.backgroundImage = `url('data:image/svg+xml;base64,${btoa(logos[i])}')`;
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
          }
        });
        if (backgroundContainerRef.current) backgroundContainerRef.current.style.opacity = "1";
      })
      .catch(() => undefined); // Ignore errors since the background is not that important
  }, []);

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
