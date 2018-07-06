// @flow
module.exports = {
  extends: [
    "eslint-config-airbnb",
  ],
  env: {
    browser: true,
    es6: true,
  },
  parser: "babel-eslint",
  plugins: [
    "flowtype",
    "jest",
    "react-hooks",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  globals: {
    fetch: false,
    __DEV__: true,
    __PROD__: true,
    requestAnimationFrame: true,
    navigator: true,
    FormData: true,
    WebSocket: true,
  },
  rules: {
    "arrow-parens": ["error", "as-needed"],
    "flowtype/boolean-style": ["error", "boolean"],
    "flowtype/define-flow-type": "warn",
    "flowtype/delimiter-dangle": ["error", "always-multiline"],
    "flowtype/generic-spacing": ["error", "never"],
    "flowtype/no-primitive-constructor-types": "error",
    "flowtype/no-weak-types": "off",
    "flowtype/object-type-delimiter": ["error", "comma"],
    "flowtype/require-parameter-type": "off",
    "flowtype/require-return-type": "off",
    "flowtype/require-valid-file-annotation": ["error", "never", {
      annotationStyle: "line",
    }],
    "flowtype/semi": ["error", "always"],
    "flowtype/space-after-type-colon": ["error", "always"],
    "flowtype/space-before-generic-bracket": ["error", "never"],
    "flowtype/space-before-type-colon": ["error", "never"],
    "flowtype/union-intersection-spacing": ["error", "always"],
    "flowtype/use-flow-type": "error",
    "flowtype/valid-syntax": "error",
    "generator-star-spacing": ["error", "after"],
    "import/extensions": ["error", "ignorePackages", {
      js: "never",
      json: "always",
      jsx: "never",
    }],
    "import/no-unresolved": "error",
    "import/prefer-default-export": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "jsx-a11y/interactive-supports-focus": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "lines-between-class-members": ["error", "always", {
      exceptAfterSingleLine: true,
    }],
    "max-len": ["error", 140, 2, {
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreUrls: true,
    }],
    "no-console": ["warn", {
      allow: ["warn", "error"],
    }],
    "no-param-reassign": ["error", {
      props: false,
    }],
    "no-plusplus": ["error", {
      allowForLoopAfterthoughts: true,
    }],
    "no-underscore-dangle": "off",
    "no-use-before-define": "off",
    quotes: ["error", "single", {
      avoidEscape: true,
    }],
    "react/destructuring-assignment": "off",
    "react-hooks/rules-of-hooks": "error",
    "react/default-props-match-prop-types": "off",
    "react/jsx-filename-extension": ["error", {
      extensions: [".js", ".jsx"],
    }],
    "react/jsx-handler-names": "error",
    "react/sort-comp": ["error", {
      groups: {
        rendering: [
          "/^render.+$/",
          "render",
        ],
      },
      order: [
        "type-annotations",
        "static-methods",
        "instance-variables",
        "lifecycle",
        "getters",
        "setters",
        "/^handle.+$/",
        "instance-methods",
        "everything-else",
        "rendering",
      ],
    }],
  },
};
