import { defineConfig, presetAttributify, presetWind4, transformerAttributifyJsx } from 'unocss';

export default defineConfig({
  presets: [
    presetWind4(),
    presetAttributify(),
  ],
  transformers: [
    transformerAttributifyJsx(),
  ],
  theme: {
    colors: {
      primary: '#3498db',
      secondary: '#3854b4',
      error: '#e74c3c',
    },
  },
});
