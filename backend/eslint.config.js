export default [
  {
    ignores: ["node_modules", "dist", "coverage"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: true,
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": ["warn", { allow: ["warn", "error", "log"] }],
    },
  },
];
