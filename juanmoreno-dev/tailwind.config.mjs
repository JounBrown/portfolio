/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'desktop-bg': '#007E84',
        'titlebar-active': '#0B10D6',
        'ui-light': '#D2D2D2',
        'ui-mid': '#BDBDBD',
        'ui-dark': '#6B6B6B',
        'panel-bg': '#F0F0F0',
        'panel-accent-green': '#D6F4E5',
        'panel-accent-blue': '#D3E1F4',
        link: '#1A4FE3',
        'status-green': '#1F8F2B',
        text: '#111111'
      },
      fontFamily: {
        base: ['Microsoft Sans Serif']
      },
      fontSize: {
        'win-12': ['12px', { lineHeight: '1.2' }],
        'win-14': ['14px', { lineHeight: '1.5' }],
        'win-16': ['16px', { lineHeight: '1.5' }],
        'win-18': ['18px', { lineHeight: '1.2' }],
        'win-20': ['20px', { lineHeight: '1.2' }],
        'win-22': ['22px', { lineHeight: '1.2' }]
      },
      lineHeight: {
        tight: '1.2',
        base: '1.5'
      },
      spacing: {
        'win-4': '4px',
        'win-8': '8px',
        'win-12': '12px',
        'win-16': '16px',
        'win-24': '24px',
        'win-32': '32px'
      },
      borderWidth: {
        win: '1px'
      },
      boxShadow: {
        emboss: '1px 1px 0 #FFFFFF, -1px -1px 0 #6B6B6B',
        'inset-emboss': 'inset 1px 1px 0 #6B6B6B, inset -1px -1px 0 #FFFFFF'
      },
      width: {
        sidebar: '260px'
      },
      maxWidth: {
        content: '1200px'
      }
    }
  }
};
