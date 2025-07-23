import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // rules: {
    //   "@typescript-eslint/no-explicit-any": "warn",
    // },
    rules: {
      "@typescript-eslint/no-explicit-any": [
        "error",
        {
          fixToUnknown: false, // Don't auto-fix to `unknown`
          ignoreRestArgs: true, // Allow `...args: any[]`
          allowInArray: true, // Allow `any[]`
        },
      ],
    },
  },
];

export default eslintConfig;
