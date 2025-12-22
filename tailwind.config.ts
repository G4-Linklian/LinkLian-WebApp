// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        primary: {
          900: "#7A2310",
          800: "#93381B",
          700: "#B7552B",
          600: "#DB763F",
          500: "#FF9C57",
          400: "#FFBC81",
          300: "#FFCF9A",
          200: "#FFE3BB",
          100: "#FFF2DD",
        },
      },
    },
  },
};

export default config;
