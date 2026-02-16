/**
 * organon.config.json template for organon init.
 */

export const CONFIG_TEMPLATE = `{
  "methodology_version": "0.5.0",
  "organonPaths": ["organon", "."],
  "organonGlobs": [
    "**/ETHOS.md",
    "**/PHILOSOPHY.md",
    "**/PROTOCOL.md",
    "**/PROTOCOLS.md",
    "**/README.md",
    "**/PRIMER.md",
    "**/methodology-reference.md",
    "**/components.md",
    "**/observations/*.md",
    "**/rfcs/*.md"
  ],
  "ignorePatterns": [
    "**/node_modules/**",
    "**/dist/**",
    "**/.git/**",
    "**/coverage/**"
  ],
  "workflowPaths": {
    "claudeCode": ".claude/skills",
    "cursor": ".cursor/rules",
    "generic": "organon/workflows"
  },
  "freshnessThresholdHours": 720,
  "testGlobs": [
    "**/*.test.ts",
    "**/*.test.js",
    "**/*.spec.ts",
    "**/*.spec.js"
  ],
  "testIgnorePatterns": [
    "**/node_modules/**",
    "**/dist/**"
  ]
}
`;

export const METHODOLOGY_VERSION = '0.5.0';
