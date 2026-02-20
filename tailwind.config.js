/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        anchor: {
          primary: '#7A9A8A',
          primaryDark: '#5E7B6D',
          text: '#000000',
          body: '#374151',
          cream: '#F8F6F1',
          surface: '#FFFFFF',
          border: '#D9DED9',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        heading: ['"Times New Roman"', 'Georgia', 'serif'],
        sans: ['"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
