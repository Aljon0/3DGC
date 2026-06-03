/** @type {import('tailwindcss').Config} */
export default {
    content: [
      './index.html',
      './src/**/*.{js,jsx,ts,tsx}',
    ],
  
    theme: {
      extend: {
        // ── Brand Color Palette ──────────────────────────────
        colors: {
          // Primary brand: deep charcoal
          brand: {
            50:  '#f6f6f7',
            100: '#e2e3e6',
            200: '#c5c7cc',
            300: '#9ea2ab',
            400: '#767c88',
            500: '#5c6170',
            600: '#494e5c',
            700: '#3b3f4b',
            800: '#2e3038', // Main dark surface
            900: '#1a1c21', // Darkest bg
            950: '#0f1013',
          },
          // Accent: warm stone gold
          accent: {
            50:  '#fdf8ee',
            100: '#f9edd0',
            200: '#f2d89d',
            300: '#eabf63',
            400: '#e4a93b',
            500: '#d8901f', // Primary accent
            600: '#be7018',
            700: '#9d5217',
            800: '#80401a',
            900: '#6a3519',
            950: '#3c1a0b',
          },
          // Status colors
          status: {
            new:        '#3b82f6', // blue
            processing: '#f59e0b', // amber
            finished:   '#10b981', // emerald
            cancelled:  '#ef4444', // red
          },
        },
  
        // ── Typography ────────────────────────────────────────
        fontFamily: {
          // Display: cinzel for monument/lapida theme
          display: ['"Cinzel"', 'Georgia', 'serif'],
          // Body: DM Sans — clean, modern, readable
          sans:    ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
          // Mono: for numeric data
          mono:    ['"JetBrains Mono"', 'monospace'],
        },
  
        // ── Spacing & Layout ──────────────────────────────────
        borderRadius: {
          'xs': '0.25rem',
          'sm': '0.375rem',
          DEFAULT: '0.5rem',
          'md': '0.625rem',
          'lg': '0.75rem',
          'xl': '1rem',
          '2xl': '1.25rem',
        },
  
        // ── Shadows ───────────────────────────────────────────
        boxShadow: {
          'card':  '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
          'panel': '0 4px 16px 0 rgb(0 0 0 / 0.10)',
          'float': '0 8px 32px 0 rgb(0 0 0 / 0.14)',
          'glow':  '0 0 24px 0 rgb(216 144 31 / 0.25)',
        },
  
        // ── Animations ────────────────────────────────────────
        keyframes: {
          'fade-in': {
            '0%':   { opacity: '0', transform: 'translateY(8px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          'slide-in-right': {
            '0%':   { opacity: '0', transform: 'translateX(24px)' },
            '100%': { opacity: '1', transform: 'translateX(0)' },
          },
          'slide-in-left': {
            '0%':   { opacity: '0', transform: 'translateX(-24px)' },
            '100%': { opacity: '1', transform: 'translateX(0)' },
          },
          'scale-in': {
            '0%':   { opacity: '0', transform: 'scale(0.95)' },
            '100%': { opacity: '1', transform: 'scale(1)' },
          },
          'shimmer': {
            '0%':   { backgroundPosition: '-200% 0' },
            '100%': { backgroundPosition: '200% 0' },
          },
        },
        animation: {
          'fade-in':         'fade-in 0.3s ease-out both',
          'slide-in-right':  'slide-in-right 0.3s ease-out both',
          'slide-in-left':   'slide-in-left 0.3s ease-out both',
          'scale-in':        'scale-in 0.2s ease-out both',
          'shimmer':         'shimmer 1.8s linear infinite',
        },
  
        // ── Screen breakpoints (matching design plan) ─────────
        screens: {
          'xs': '480px',
          'sm': '640px',
          'md': '768px',
          'lg': '1024px',
          'xl': '1280px',
          '2xl': '1536px',
        },
      },
    },
  
    plugins: [],
  }