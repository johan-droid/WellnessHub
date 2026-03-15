import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wellnessPink: '#FF85B8', // Softer Pink
        wellnessLavender: '#E6E6FA',
        wellnessRose: '#FFD1DC',
        travelTeal: '#4FD1C5', // Softer Teal
        memoryPurple: '#B19CD9', // Light Lavender
        budgetGold: '#F0E68C', // Khaki/Soft Gold
        deepNavy: '#1A2F4B',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-poppins)', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(45deg, #FF69B4, #9966CC, #1D9E75)',
        'cta-gradient': 'linear-gradient(to right, #1D9E75, #FF69B4)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'gradient-move': 'gradientBG 15s ease infinite',
        'framer-entry': 'fmotionEntry 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'timeline-line-grow': 'drawLine linear forwards',
        'pulse-glow': 'pulseGlow 3s infinite',
        'smooth-float': 'smoothFloat 8s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradientBG: {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
        fmotionEntry: {
          '0%': { opacity: '0', transform: 'translateY(30px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        drawLine: {
          '0%': { transform: 'scaleY(0)', 'transformOrigin': 'top' },
          '100%': { transform: 'scaleY(1)', 'transformOrigin': 'top' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 105, 180, 0.4)' },
          '50%': { boxShadow: '0 0 20px 10px rgba(255, 105, 180, 0.2)' },
        },
        smoothFloat: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-25px) rotate(2deg)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
};
export default config;
