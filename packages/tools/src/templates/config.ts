/**
 * organon.config.json template for organon init.
 */

export const CONFIG_TEMPLATE = `{
  "methodology_version": "0.3.0",
  "organonPaths": ["organon", "."],
  "organonGlobs": [
    "**/ETHOS.md",
    "**/PHILOSOPHY.md",
    "**/PROTOCOL.md",
    "**/PROTOCOLS.md",
    "**/README.md",
    "**/components.md"
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
  "freshnessThresholdHours": 720
}
`;

export const METHODOLOGY_VERSION = '0.3.0';
