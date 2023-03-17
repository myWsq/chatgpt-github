import { defineConfig } from "astro/config";
import unocss from "unocss/astro";
import { presetUno } from "unocss";
import presetAttributify from "@unocss/preset-attributify";
import presetTypography from "@unocss/preset-typography";
import solidJs from "@astrojs/solid-js";
import vercelDisableBlocks from "./plugins/vercelDisableBlocks";
import vercel from "@astrojs/vercel/edge";

// https://astro.build/config
export default defineConfig({
  integrations: [
    unocss({
      presets: [presetAttributify(), presetUno(), presetTypography()],
    }),
    solidJs(),
  ],
  output: process.env.OUTPUT == "vercel" ? "server" : "static",
  adapter: process.env.OUTPUT == "vercel" ? vercel() : undefined,
  vite: {
    plugins: [process.env.OUTPUT == "vercel" && vercelDisableBlocks()],
  },
});
