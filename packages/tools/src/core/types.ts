/**
 * Shared types for the Organon tools core.
 *
 * All core functions depend on these types. The FileSystem interface
 * enables dependency injection for testability (in-memory fs for tests,
 * NodeFileSystem for real I/O).
 */

// ---------------------------------------------------------------------------
// FileSystem abstraction
// ---------------------------------------------------------------------------

export interface FileStat {
  mtime: Date;
  size: number;
}

export interface FileSystem {
  readFile(path: string): Promise<string>;
  readDir(path: string): Promise<string[]>;
  exists(path: string): Promise<boolean>;
  glob(pattern: string, options?: { cwd: string; ignore?: string[] }): Promise<string[]>;
  stat(path: string): Promise<FileStat>;
}

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------

export type Severity = 'error' | 'warning' | 'info';

export interface DiagnosticMessage {
  severity: Severity;
  code: string;
  message: string;
  file?: string;
  line?: number;
  suggestion?: string;
}

// ---------------------------------------------------------------------------
// Frontmatter types
// ---------------------------------------------------------------------------

export type FrontmatterType =
  | 'navigation'
  | 'constraints'
  | 'rationale'
  | 'procedures'
  | 'mapping';

export type FrontmatterScope =
  | 'product'
  | 'domain'
  | 'feature'
  | 'component'
  | 'meta'
  | 'methodology';

export type AutomationTier = 'automated' | 'semi-automated' | 'manual';
export type LoadPriority = 'high' | 'medium' | 'low';
export type Complexity = 'high' | 'medium' | 'low';
export type Audience = 'llm' | 'human' | 'tooling';
export type EpistemicCategory = 'constraint' | 'assertion' | 'rule';

export interface ProtocolEntry {
  id: string;
  name: string;
  steps: number;
  automation_tier: AutomationTier;
  workflow?: string;
  tools?: string[];
  complexity: Complexity;
}

export interface InvariantEntry {
  id: string;
  name: string;
  judgment_call?: boolean;
}

/**
 * Union of all possible frontmatter fields.
 * Not every file will have every field — type-specific fields
 * are validated based on the `type` value.
 */
export interface Frontmatter {
  // Core required fields
  type: FrontmatterType;
  scope: FrontmatterScope;
  name: string;
  version: string;
  summary: string;
  token_estimate: number;

  // ETHOS-specific (type: constraints)
  invariants_count?: number;
  principles_count?: number;
  heuristics_count?: number;
  invariants?: InvariantEntry[];

  // PHILOSOPHY-specific (type: rationale)
  decision_count?: number;
  explains_invariants?: string[];

  // PROTOCOL-specific (type: procedures)
  protocols_count?: number;
  protocols?: ProtocolEntry[];

  // README-specific (type: navigation)
  provides?: string[];
  parent?: string;

  // components.md-specific (type: mapping)
  file_count?: number;
  last_generated?: string;

  // Relationship fields
  inherits_from?: string[];
  related_domains?: string[];
  related_features?: string[];
  primary_rfcs?: number[];
  secondary_rfcs?: number[];

  // Context management
  load_priority?: LoadPriority;
  required_for?: string[];
  audience?: Audience[];

  // Freshness tracking
  last_reviewed?: string;
  methodology_version?: string;

  // Allow additional fields for extensibility
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Parsed organon file
// ---------------------------------------------------------------------------

export interface ParsedOrganonFile {
  /** Absolute or project-relative path */
  path: string;
  /** Parsed frontmatter, or null if missing/invalid */
  frontmatter: Frontmatter | null;
  /** Raw YAML string (between --- delimiters) */
  rawFrontmatter: string;
  /** File content after frontmatter */
  body: string;
  /** Full file content */
  content: string;
}

// ---------------------------------------------------------------------------
// Result types for core functions
// ---------------------------------------------------------------------------

export interface ValidateFrontmatterResult {
  success: boolean;
  filesChecked: number;
  filesWithErrors: number;
  filesWithWarnings: number;
  results: FileValidationResult[];
  errors: DiagnosticMessage[];
  warnings: DiagnosticMessage[];
}

export interface FileValidationResult {
  file: string;
  valid: boolean;
  errors: DiagnosticMessage[];
  warnings: DiagnosticMessage[];
}

export interface GenerateFrontmatterResult {
  success: boolean;
  file: string;
  generated: Partial<Frontmatter>;
  errors: DiagnosticMessage[];
  warnings: DiagnosticMessage[];
}

export interface QueryResult {
  success: boolean;
  files: ParsedOrganonFile[];
  totalTokens: number;
  errors: DiagnosticMessage[];
  warnings: DiagnosticMessage[];
}

export interface HealthResult {
  success: boolean;
  score: number; // 0-100
  coverage: {
    totalFiles: number;
    withFrontmatter: number;
    percentage: number;
  };
  validation: {
    passing: number;
    failing: number;
    warnings: number;
  };
  tokens: {
    total: number;
    average: number;
    largest: { file: string; tokens: number };
    smallest: { file: string; tokens: number };
  };
  freshness: {
    fresh: number;
    stale: number;
    unknown: number;
    stalestFile?: { file: string; lastModified: Date };
  };
  issues: DiagnosticMessage[];
  errors: DiagnosticMessage[];
  warnings: DiagnosticMessage[];
}

export interface FindResult {
  success: boolean;
  mode: 'by-file' | 'by-scope' | 'by-type' | 'by-name';
  matches: FindMatch[];
  errors: DiagnosticMessage[];
  warnings: DiagnosticMessage[];
}

export interface FindMatch {
  file: string;
  frontmatter: Frontmatter | null;
  relevance: string;
}

export interface VerifyTripletsResult {
  success: boolean;
  bindings: TripletBinding[];
  orphanedWorkflows: string[];
  phantomAutomation: string[];
  errors: DiagnosticMessage[];
  warnings: DiagnosticMessage[];
}

export interface TripletBinding {
  protocolId: string;
  protocolFile: string;
  automationTier: AutomationTier;
  workflowName?: string;
  workflowFile?: string;
  tools?: string[];
  valid: boolean;
  issues: DiagnosticMessage[];
}

export interface WorkflowValidationResult {
  success: boolean;
  workflowsChecked: number;
  workflowsWithErrors: number;
  workflowsWithWarnings: number;
  results: WorkflowFileResult[];
  errors: DiagnosticMessage[];
  warnings: DiagnosticMessage[];
}

export interface WorkflowFileResult {
  file: string;
  valid: boolean;
  errors: DiagnosticMessage[];
  warnings: DiagnosticMessage[];
}

export interface SuggestToolsResult {
  success: boolean;
  suggestions: ToolSuggestion[];
  errors: DiagnosticMessage[];
  warnings: DiagnosticMessage[];
}

export interface ToolSuggestion {
  protocolId: string;
  protocolFile: string;
  currentTier: AutomationTier;
  suggestedTier: AutomationTier;
  reason: string;
  steps: number;
  complexity: Complexity;
}

// ---------------------------------------------------------------------------
// Export types
// ---------------------------------------------------------------------------

export interface ExportEntity {
  id: string;
  kind: string;
  name: string;
  scope: string;
  type: string;
  category: EpistemicCategory | null;
}

export interface ExportAssertion {
  id: string;
  category: EpistemicCategory;
  source: string;
  predicate: string;
  content: string;
}

export interface ExportRelationship {
  source: string;
  predicate: string;
  target: string;
}

export interface ExportRule {
  id: string;
  predicate: string;
  targets: string[];
  type: string;
}

export interface ExportResult {
  version: string;
  exported_at: string;
  entities: ExportEntity[];
  assertions: ExportAssertion[];
  relationships: ExportRelationship[];
  rules: ExportRule[];
}

// ---------------------------------------------------------------------------
// Verify (orchestrator) types
// ---------------------------------------------------------------------------

export interface VerifyGateResult {
  gate: string;
  passed: boolean;
  errors: DiagnosticMessage[];
  warnings: DiagnosticMessage[];
}

export interface VerifyResult {
  success: boolean;
  gates: VerifyGateResult[];
  errors: DiagnosticMessage[];
  warnings: DiagnosticMessage[];
}

export type VerifyGateFn = (options: {
  projectRoot: string;
  config: OrganonConfig;
  fs: FileSystem;
}) => Promise<VerifyGateResult>;

// ---------------------------------------------------------------------------
// Invariant coverage
// ---------------------------------------------------------------------------

export interface InvariantCoverageResult {
  success: boolean;
  invariants: InvariantCoverageEntry[];
  summary: {
    total: number;
    covered: number;
    uncovered: number;
    judgment_call: number;
  };
  errors: DiagnosticMessage[];
  warnings: DiagnosticMessage[];
}

export interface InvariantCoverageEntry {
  id: string;
  name: string;
  file: string;
  status: 'covered' | 'uncovered' | 'judgment_call';
  tests: string[];
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface WorkflowPaths {
  claudeCode?: string;
  cursor?: string;
  generic?: string;
}

export interface OrganonConfig {
  projectRoot: string;
  organonPaths: string[];
  organonGlobs: string[];
  ignorePatterns: string[];
  workflowPaths: WorkflowPaths;
  freshnessThresholdHours: number;
  testGlobs?: string[];
  testIgnorePatterns?: string[];
}
