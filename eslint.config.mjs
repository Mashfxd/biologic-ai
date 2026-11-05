import nextVitals from 'eslint-config-next/core-web-vitals';
const config = [...nextVitals, {
  ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
}, {
  rules: {
    'react-hooks/set-state-in-effect': 'warn',
    'react-hooks/refs': 'warn',
    '@next/next/no-img-element': 'warn',
  },
}];
export default config;
