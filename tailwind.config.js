/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace']
      },
      colors: {
        'apple-blue': '#0071e3'
      },
      animation: {
        'aura-entrance': 'auraEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'glimmer-bloom': 'glimmer-bloom 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      },
      keyframes: {
        auraEntrance: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(15px) scale(0.995)', 
            filter: 'blur(10px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)', 
            filter: 'blur(0)' 
          }
        },
        'glimmer-bloom': {
          '0%': { 
            transform: 'translate(-50%, -50%) scale(0)', 
            opacity: '0.8' 
          },
          '100%': { 
            transform: 'translate(-50%, -50%) scale(3)', 
            opacity: '0' 
          }
        }
      }
    },
  },
  plugins: [],
}