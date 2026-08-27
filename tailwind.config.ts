import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#090B10",
          900: "#10131A",
          850: "#151922",
          800: "#1B202B",
          700: "#293140"
        },
        signal: {
          green: "#3DDC97",
          amber: "#F4B860",
          red: "#F07167",
          cyan: "#64D2FF"
        }
      },
      boxShadow: {
        panel: "0 18px 50px rgba(0,0,0,.28)"
      }
    }
  },
  plugins: []
};

export default config;
