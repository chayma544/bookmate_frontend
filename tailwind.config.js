/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'ui-serif', 'serif'],
      },
      colors: {
        primary: '#8B3A0F',
        secondary: '#F5EDE0',
        accent: '#A56A43',
        ink: '#1A1008',
      },
      boxShadow: {
        soft: '0 20px 50px rgba(26, 16, 8, 0.08)',
      },
      backgroundImage: {
        'bookmate-gradient': 'linear-gradient(135deg, #f5ede0 0%, #fdf4e7 55%, #efe0cf 100%)',
      },
    },
  },
  plugins: [],
};
