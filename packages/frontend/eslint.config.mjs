import react from "eslint-plugin-react";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import jsdoc from "eslint-plugin-jsdoc";
import _import from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";

export default [
    {
        files: ["**/*.ts", "**/*.tsx"],

        plugins: {
            react: react,
            "@typescript-eslint": typescriptEslint,
            jsdoc: jsdoc,
            import: _import,
            prettier: prettier,
        },

        languageOptions: {
            globals: {
                ...globals.browser,
            },

            parser: tsParser,
            ecmaVersion: "latest",
            sourceType: "module",

            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },

                project: "./tsconfig.json",
            },
        },

        settings: {
            react: {
                version: "detect",
            },
        },

        rules: {
            "no-unused-vars": "off",
            "prefer-template": "warn",
            "@typescript-eslint/await-thenable": ["warn"],
            "@typescript-eslint/consistent-type-imports": ["warn", {}],
            "@typescript-eslint/no-import-type-side-effects": ["warn"],
            "@typescript-eslint/no-floating-promises": ["warn", {}],

            "@typescript-eslint/no-unused-vars": ["warn", {
                caughtErrors: "none",
            }],

            "react/react-in-jsx-scope": "off",
            "react/jsx-curly-brace-presence": ["warn", "never"],
            "require-jsdoc": "off",
            "valid-jsdoc": "off",

            "import/extensions": ["warn", "never", {
                json: "always",
            }],

            "import/first": ["warn"],
            "import/namespace": "off",
            "import/no-unresolved": "off",
            "import/no-nodejs-modules": ["warn"],

            "import/no-cycle": ["warn", {
                ignoreExternal: true,
            }],

            "import/order": ["warn", {
                "newlines-between": "always",

                alphabetize: {
                    order: "asc",
                    orderImportKind: "asc",
                    caseInsensitive: true,
                },

                warnOnUnassignedImports: true,
            }],

            "max-len": ["warn", {
                code: 120,
            }],

            "prettier/prettier": ["warn", {
                printWidth: 120,
                tabWidth: 2,
                useTabs: false,
            }],
        },
    }
];