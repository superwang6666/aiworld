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
      // 禁止使用 any 类型
      "@typescript-eslint/no-explicit-any": "error",
      // 禁止使用 alert()，用 Toast 组件（lib/utils/toast-store）替代
      // 注意：不用内置 no-alert，因为它连 confirm()/prompt() 一起禁掉了，
      // 而 confirm() 目前还在用于删除等需要阻塞式确认的场景，不在这次替换范围内
      "no-restricted-globals": [
        "error",
        {
          name: "alert",
          message: "使用 lib/utils/toast-store 的 toast.error()/toast.success() 代替 alert()",
        },
      ],
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
    // jest --coverage 生成的报告目录，不是源码
    "coverage/**",
  ]),
]);

export default eslintConfig;
