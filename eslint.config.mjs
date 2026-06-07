import nextConfig from "eslint-config-next/core-web-vitals";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = [
  ...nextConfig,
  prettierConfig,
  {
    // useEffect(() => setState(true), []) is the standard Next.js SSR hydration
    // guard pattern. react-hooks 7's new set-state-in-effect rule flags it
    // incorrectly as a cascade risk; disable globally.
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
