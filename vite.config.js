import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        lifeInsurance: resolve(__dirname, 'services/life-insurance.html'),
        incomeProtection: resolve(__dirname, 'services/income-protection.html'),
        healthInsurance: resolve(__dirname, 'services/health-insurance.html'),
        solar: resolve(__dirname, 'services/solar.html'),
        realEstate: resolve(__dirname, 'services/real-estate.html'),
        mortgageLoans: resolve(__dirname, 'services/mortgage-loans.html'),
        tradies: resolve(__dirname, 'services/tradies.html'),
        builders: resolve(__dirname, 'services/builders.html'),
        comingSoon: resolve(__dirname, 'services/coming-soon.html')
      }
    }
  },
  server: {
    port: 5173,
    open: true
  }
});
