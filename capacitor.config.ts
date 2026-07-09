import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.stayproof.app',
  appName: 'StayProof',
  webDir: 'public',
  server: {
    url: 'https://bondproof.vercel.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
  },
}

export default config
