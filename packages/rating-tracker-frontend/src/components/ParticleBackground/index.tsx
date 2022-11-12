import { useCallback } from "react";
import type { Engine } from "tsparticles-engine";
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import { useTheme } from "@mui/material";

const ParticleBackground = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);
  const theme = useTheme();
  return (
    <Particles
      height="100vh"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
        filter: "blur(1px)",
      }}
      init={particlesInit}
      options={{
        fullScreen: false,
        background: {
          color: {
            value: theme.palette.background.default,
          },
        },
        fpsLimit: 120,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "repulse",
            },
          },
          modes: {
            repulse: {
              distance: 100,
              speed: 0.1,
            },
          },
        },
        particles: {
          color: {
            value: theme.palette.primary.main,
          },
          links: {
            color: theme.palette.primary.light,
            distance: 150,
            enable: true,
            opacity: 0.5,
            width: 1,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: false,
            speed: 0.5,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 80,
          },
          opacity: {
            value: 0.25,
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 6 },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default ParticleBackground;
