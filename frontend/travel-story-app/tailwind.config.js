/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"], 
  theme: {
    fontFamily: {
      display: ["Poppins", "sans-serif"],
    },
    extend: {
      colors: {
        primary: "#0586D3",
        secondary: "#EF863E",
      },
      backgroundImage: {
        'login-bg-img': "url('/src/assets/images/bg-imgage.jpg')",
        'signup-bg-img': "url('/src/assets/images/bg-signup-image.png')",
      },
    },
  },
  plugins: [],
};
