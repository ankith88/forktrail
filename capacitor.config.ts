import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.palatero.app',
  appName: 'Palatero',
  webDir: 'out',
  server: {
    // Allows testing live Next.js dev server on physical Android phone over local WiFi
    // Change host IP if running on a different network interface
    url: process.env.CAP_SERVER_URL || 'http://192.168.0.84:3000',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
