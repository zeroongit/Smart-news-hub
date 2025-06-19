import React from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

export default function ParticlesBackground() {
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        background: { color: { value: "#1a1a1a" } },
        particles: {
          number: { value: 60 },
          color: { value: "#ffffff" },
          shape: { type: "circle" },
          opacity: { value: 0.1 },
          size: { value: 3 },
          move: { enable: true, speed: 0.6 }
        },
      }}
    />
  );
}
