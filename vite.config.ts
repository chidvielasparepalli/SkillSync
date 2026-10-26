import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  // GitHub Pages hosts this project under /SkillSync/, while Vercel serves it at /.
  base: mode === "github-pages" ? "/SkillSync/" : "/",
  plugins: [react()],
}));
