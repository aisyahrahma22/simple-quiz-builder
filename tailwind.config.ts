import type { Config } from "tailwindcss";
import tailwindcssRtl from "tailwindcss-rtl"; // Menggunakan tailwindcss-rtl

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [tailwindcssRtl], // Menambahkan plugin tailwindcss-rtl
};

export default config;
