export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1e3a8a',
        accent: '#c8841a',
        teal: '#0f766e',
      },
      boxShadow: {
        soft: '0 22px 60px rgba(15,23,42,0.08)',
        premium: '0 18px 45px rgba(15,23,42,0.075)',
        lift: '0 26px 70px rgba(15,23,42,0.14)',
      },
      borderRadius: {
        premium: '1.65rem',
      },
    },
  },
  plugins: [],
};
