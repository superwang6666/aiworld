import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      // 导入顺序规则
      "import/order": [
        "error",
        {
          groups: [
            "builtin",   // Node.js 内置模块
            "external",  // 外部依赖
            "internal",  // 内部别名导入 (@/)
            "parent",    // 父级目录
            "sibling",   // 同级目录
            "index",     // index 文件
            "type",      // 类型导入
          ],
          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
            {
              pattern: "next/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "@/types",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@/config/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@/lib/**",
              group: "internal",
              position: "after",
            },
            {
              pattern: "@/components/**",
              group: "internal",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: ["react", "next"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      // 禁止未使用的导入
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // 禁止重复导入
      "import/no-duplicates": "error",
      // 禁止使用 any 类型（警告级别）
      "@typescript-eslint/no-explicit-any": "warn",
      // 要求一致的类型导入
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
  ]),
]);

export default eslintConfig;
