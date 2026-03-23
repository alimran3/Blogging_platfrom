/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f3f9',
          100: '#d9e2f1',
          200: '#b3c5e3',
          300: '#8da8d5',
          400: '#678bc7',
          500: '#416eb9',
          600: '#345894',
          700: '#27426f',
          800: '#1a2c4a',
          900: '#0d1625',
          950: '#060b12'
        },
        gold: {
          50: '#fefbf3',
          100: '#fdf4d9',
          200: '#fbe9b3',
          300: '#f9de8d',
          400: '#f7d367',
          500: '#f5c841',
          600: '#c4a034',
          700: '#937827',
          800: '#62501a',
          900: '#31280d',
          950: '#181406'
        },
        cream: {
          50: '#fefdfb',
          100: '#fdfaf5',
          200: '#fbf5eb',
          300: '#f9f0e1',
          400: '#f7ebd7',
          500: '#f5e6cd'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        alinur: ['AlinurAtithi', 'serif']
      },
      boxShadow: {
        'elegant': '0 4px 20px -2px rgba(13, 22, 37, 0.1), 0 2px 8px -2px rgba(13, 22, 37, 0.06)',
        'elegant-lg': '0 10px 40px -4px rgba(13, 22, 37, 0.15), 0 4px 16px -4px rgba(13, 22, 37, 0.08)',
        'gold': '0 4px 20px -2px rgba(245, 200, 65, 0.3)',
        'card': '0 2px 15px -3px rgba(13, 22, 37, 0.07), 0 10px 20px -2px rgba(13, 22, 37, 0.04)',
        'card-hover': '0 20px 40px -4px rgba(13, 22, 37, 0.12), 0 8px 16px -4px rgba(13, 22, 37, 0.06)'
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-elegant': 'linear-gradient(135deg, var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
      }
    }
  },
  plugins: []
}
