import typescriptEslint from "@typescript-eslint/eslint-plugin";
import jsdoc from "eslint-plugin-jsdoc";
import _import from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";

export default [
    {
        files: ["**/*.ts"],

        plugins: {
            "@typescript-eslint": typescriptEslint,
            jsdoc: (jsdoc),
            import: (_import),
            prettier: (prettier),
        },

        languageOptions: {
            globals: {
                ...globals.node,
            },

            parser: tsParser,
            ecmaVersion: "latest",
            sourceType: "module",

            parserOptions: {
                project: "./tsconfig.json",
            },
        },

        rules: {
            "require-await": ["warn"],
            "no-unused-vars": "off",
            "prefer-template": "warn",
            "@typescript-eslint/await-thenable": ["warn"],
            "@typescript-eslint/consistent-type-imports": ["warn", {}],
            "@typescript-eslint/no-import-type-side-effects": ["warn"],
            "@typescript-eslint/no-floating-promises": ["warn", {}],

            "@typescript-eslint/no-unused-vars": ["warn", {
                caughtErrors: "none",
            }],

            "import/extensions": "off",
            // // import-js/eslint-plugin-import#2147
            // "import/extensions": ["warn", "never", {
            //     json: "always",
            // }],
            "import/first": ["warn"],
            "import/namespace": "off",
            "import/no-unresolved": "off",
            "import/no-cycle": "off",

            "import/order": ["warn", {
                "newlines-between": "always",

                alphabetize: {
                    order: "asc",
                    orderImportKind: "asc",
                    caseInsensitive: true,
                },

                warnOnUnassignedImports: true,
            }],

            "new-cap": ["warn", {
                capIsNewExceptions: ["Endpoint", "ClientSecretPost"],
            }],

            quotes: ["warn", "double", {
                avoidEscape: true,
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