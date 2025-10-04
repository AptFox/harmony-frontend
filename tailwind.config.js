import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export const content = [
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
  "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
  "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
  extend: {},
};
export const darkMode = "class";
export const plugins = [heroui({
  themes: {
    light: {
      colors: {
        primary: { 
          DEFAULT: '#5d2452', // purple
          foreground: '#f3f3f2', // white
        },
        secondary: '#b6b6b6', // light gray
        background: '#f3f3f2', // white
      },
    },
    // dark: {
    //   colors: {
    //     primary: {
    //       DEFAULT: '#d8b4fe', // light purple
    //       foreground: '#595858', // dark gray
    //     },
    //     secondary: '#808080', // gray
    //     background: '#595858', // dark gray
    //   },
    // },
  }
})];
