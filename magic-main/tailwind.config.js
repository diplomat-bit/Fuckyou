/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors derived from context
        'cyan-400': '#22d3ee',
        'cyan-500': '#06b6d4',
        'cyan-600': '#0891b2',
        'cyan-900': '#0c4a6e',
        'indigo-500': '#6366f1',
        'emerald-400': '#34d399',
        // Background/UI colors
        'gray-950': '#030712',
        'gray-900': '#111827',
        'gray-800': '#1f2937',
        'black-bg': '#050505', // Used for main background
      },
      keyframes: {
        // Keyframe matching the inline CSS definition in App.tsx
        flow: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      animation: {
        'progress-flow': 'flow 2s linear infinite',
        'spin-slow': 'spin-slow 10s linear infinite',
      },
    },
  },
  plugins: [
    // Required for classes like 'animate-in fade-in'
    require('tailwindcss-animate'),
  ],
}