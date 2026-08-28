import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages 项目页部署在子路径 /agent-notebook/ 下
export default defineConfig({
  base: "/agent-notebook/",
  plugins: [react()],
});
