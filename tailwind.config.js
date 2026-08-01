/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vyr: {
          purple: '#2D1B69',
          purpleDeep: '#1A0F42',
          purpleMid: '#38256E',
          magenta: '#C2185B',
          magentaLite: '#E91E8C',
          lavender: '#B39DDB',
          lavenderLt: '#D1C4E9',
          lavenderPl: '#EDE7F6',
          bg: '#F8F5FF',
          textMute: '#5E5080',
          textMute2: '#6E6088',
          teal: '#02C39A',
          violet: '#7C4DFF',
        },
      },
      fontSize: {
        heading: ['18px', { lineHeight: '1.3' }],
        subhead: ['15px', { lineHeight: '1.3' }],
        body: ['13px', { lineHeight: '1.4' }],
        label: ['11px', { lineHeight: '1.3' }],
        caption: ['10px', { lineHeight: '1.3' }],
      },
      borderRadius: {
        card: '12px',
        control: '8px',
        pill: '20px',
      },
    },
  },
  plugins: [],
}
