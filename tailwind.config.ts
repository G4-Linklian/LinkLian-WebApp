import type { Config } from "tailwindcss";
import { AppColors } from "./src/constants/colors"; 
// ❗ แนะนำใช้ relative path แทน @ alias ใน tailwind.config

const config: Config = {
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: AppColors.primaryPalette,
        button: AppColors.buttonPalette,
        success: AppColors.successPalette,
        warning: AppColors.warningPalette,
        danger: AppColors.dangerPalette,
      },
    },
  },
  plugins: [],
};

export default config;
