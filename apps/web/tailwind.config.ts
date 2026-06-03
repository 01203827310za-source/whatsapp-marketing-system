import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2933",
        paper: "#f7f8fb",
        accent: "#0f766e",
        berry: "#be123c",
        amber: "#d97706"
      }
    }
  },
  plugins: []
} satisfies Config;
