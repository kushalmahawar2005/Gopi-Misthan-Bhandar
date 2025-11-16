import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          red: '#ba0606',
          darkRed: '#b71a1a',
          brown: '#331818',
          yellow: '#ffd901',
        },
        text: {
          primary: '#000000',
          secondary: '#6a6a6a',
          price: '#505050',
        },
      },
      fontFamily: {
        serif: ['Averia Serif Libre', 'serif'],
        sans: ['Inter', 'sans-serif'],
        inder: ['Inder', 'sans-serif'],
        roboto: ['Roboto Slab', 'serif'],
        jost: ['Jost', 'sans-serif'],
        'general-sans': ['General Sans', 'sans-serif'],
        'general-sans-variable': ['General Sans Variable', 'sans-serif'],
      },
      fontWeight: {
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
  },
  plugins: [],
}
export default config
