/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx,vue,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        border: 'var(--color-border)',
        ['border-light']: 'var(--color-border-light)',
        ['border-dark']: 'var(--color-border-dark)',
        ['target-bomb']: 'var(--color-target-bomb)',
        victory: 'var(--color-victory)',
        failure: 'var(--color-failure)',
        background: 'var(--color-background)',
        overlay: 'var(--color-overlay)',
        ['text-primary']: 'var(--color-text-primary)',
        ['text-secondary']: 'var(--color-text-secondary)',
        ['text-accent']: 'var(--color-text-accent)',
        ['hover-primary']: 'var(--color-hover-primary)',
      },
      fontSize: {
        ['sm-xl']: 12,
        ['sm-2xl']: 10,
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),

    // Adding all tw colors to :root
    function ({ addBase, theme }) {
      function extractColorVars(colorObj, colorGroup = '') {
        return Object.keys(colorObj).reduce((vars, colorKey) => {
          const value = colorObj[colorKey];
          const cssVariable =
            colorKey === 'DEFAULT'
              ? `-${colorGroup}`
              : `-${colorGroup}-${colorKey}`;

          const newVars =
            typeof value === 'string'
              ? { [cssVariable]: value }
              : extractColorVars(value, `-${colorKey}`);

          return { ...vars, ...newVars };
        }, {});
      }

      addBase({
        ':root': extractColorVars(theme('colors')),
      });
    },
  ],
};
