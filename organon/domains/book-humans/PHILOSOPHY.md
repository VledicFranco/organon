---
type: reasoning
scope: domain
domain: book-humans
version: "1.0"
summary: Design rationale for book-humans — why Markdown, why Typst, why manifest, why frontmatter
token_estimate: 1000
decisions_count: 4
trade_offs_count: 5
inherits_from: [organon-project, organon-book-systems]
audience: [llm, human, architecture]
related_files:
  - ETHOS.md
  - README.md
  - ../../book-humans/README.md
  - ../../CLAUDE.md
---

# book-humans Design Philosophy

> The reasoning behind architectural decisions for the book authoring system.

---

## Design Context

The **book-humans** project is a philosophical study of LLM nature, best practices, and the Organon methodology. It must:
1. Be authorable by humans and LLM agents
2. Support collaborative editing (git + PR workflow)
3. Produce publication-quality PDF output
4. Remain maintainable and versionable as the book evolves
5. Enable progressive disclosure (chapters can be drafted independently)

The design makes four core decisions about *how* to build this system.

---

## Decision 1: Markdown for Chapter Content (Not Native Typst, Not LaTeX)

### The Decision

Chapters are written in Markdown, compiled by Pandoc to Typst, then rendered to PDF.

### Rationale

**LLM output quality.** When asked to write prose, LLMs produce higher-quality Markdown than Typst or LaTeX. The cognitive distance between "natural writing" and "Typst syntax" is real and measurable. A paragraph in Markdown reads like prose; the same paragraph in Typst or LaTeX carries typesetting overhead that LLMs often handle incorrectly.

**Git readability.** Markdown diffs cleanly. A reviewer can see what changed in prose without parsing typesetting commands. LaTeX and Typst diffs are harder to reason about.

**Authoring freedom.** Markdown is writer-friendly. Typst and LaTeX are typesetter-friendly. We're optimizing for writers, not typesetters.

**Separation of concerns.** Chapter content focuses on *what to say*. The template (`_build/template.typ`) focuses on *how it looks*. This separation is clean and maintainable.

### Trade-offs

**Slowdown:** Markdown → Pandoc → Typst → PDF is three passes instead of one. Compile time is ~2-3 seconds per build (acceptable for an author workflow).

**Limited visual control:** Authors can't embed fine-grained visual instructions in markdown. If a section needs special formatting, it goes in the template. This is a feature (consistency), not a bug.

**Pandoc compatibility:** Not all Pandoc markdown extensions are supported by Typst. We stick to core markdown syntax to ensure compatibility.

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| **Native Typst content files** | LLM authoring would be slower; cognitive distance for writers is high |
| **LaTeX source** | Verbose, harder for LLMs to generate correctly, slower compilation |
| **GlyphJS (interactive/web)** | Excellent for interactive documents but not optimized for print narrative |
| **HTML + CSS** | Web-first, not print-optimized; requires additional conversion step to PDF |
| **Markdown directly to PDF (no template)** | No control over visual presentation; inconsistent chapter styling |

---

## Decision 2: Typst as the PDF Engine (Not LaTeX, Not PDFKit)

### The Decision

Pandoc uses `--pdf-engine=typst` to render the final PDF.

### Rationale

**Speed.** Typst compiles in milliseconds. LaTeX takes seconds. For an author workflow where you compile frequently to check progress, speed matters.

**Template clarity.** Typst templates are more readable than LaTeX packages. The `template.typ` file is straightforward and maintainable. LaTeX packages require deep knowledge of `\newcommand`, `\def`, and category codes.

**Modern architecture.** Typst was designed for 2020+ workflows (incremental compilation, better error messages, simpler syntax). LaTeX was designed for 1980s workflows.

**Part/chapter styling.** Typst makes it easy to distinguish visual hierarchy (H1 → Part, H2 → Chapter, H3 → Section). LaTeX requires wrestling with `\chapter`, `\section`, `\subsection` counters.

### Trade-offs

**Ecosystem maturity.** LaTeX has been around for 40+ years. Typst is 3 years old. If something breaks, LaTeX has more Stack Overflow answers. (But Typst's better design means fewer things break.)

**Font availability.** LaTeX supports more fonts out of the box. Typst supports all system fonts + Google Fonts, but not the obscure academic fonts LaTeX collectors love. We use "New Computer Modern" (clean, available everywhere).

**Markdown conversion.** Pandoc → Typst is newer than Pandoc → LaTeX. We're on the bleeding edge slightly. (But in 2026, Typst is stable and well-supported.)

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| **LaTeX (pdflatex)** | Slower, verbose templates, steeper learning curve, dated syntax |
| **wkhtmltopdf** | Designed for web-to-PDF (HTML → PDF), not optimal for narrative prose |
| **Prince XML** | Commercial, expensive, overkill for our use case |
| **pandoc → PDF directly** | No intermediate template, no visual control |

---

## Decision 3: `_book.yaml` Manifest for Chapter Order (Not Filesystem Glob)

### The Decision

Chapter order is declared explicitly in `_book.yaml`, not inferred from filesystem ordering (e.g., `ls *.md`).

### Rationale

**Explicit > implicit.** The manifest makes chapter order a first-class citizen. Renaming a directory, reordering files, or moving chapters doesn't require filesystem juggling.

**LLM-readable.** An LLM can read `_book.yaml` and understand "what chapters exist and in what order" without filesystem queries or glob patterns. This matters when agents are generating build commands or understanding the book structure.

**Resilient to refactoring.** If you reorganize the directory structure, `_book.yaml` survives intact. Filesystem glob ordering breaks with minor moves.

**Unwritten chapters are explicit.** The manifest lists all 20 planned chapters. Unwritten ones are commented with `# `. LLMs (and humans) can see the complete outline and know which chapters are missing.

### Trade-offs

**Extra file to maintain.** When adding a chapter, you update both the `.md` file and `_book.yaml`. Two places to update instead of one. (But this is a feature: it forces intentionality. You can't accidentally add a chapter; you must declare it.)

**Sync drift.** If `_book.yaml` and the filesystem get out of sync (file deleted but manifest not updated), Makefile silently filters to existing files. The build still works, but the drift is silent. We mitigate this with a comment: "Makefile reads this for compilation," and through review discipline.

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| **Filesystem glob (`*.md` in order)** | Fragile to renames/moves, opaque to LLMs, implicit ordering |
| **Sort by filename prefix (01-chapter.md, 02-chapter.md)** | Forces sequential numbering; reorganizing chapters becomes painful |
| **Table in README.md** | Duplicates information; easy to drift out of sync with reality |

---

## Decision 4: YAML Frontmatter Per Chapter (Organon Compliance)

### The Decision

Every chapter markdown file opens with YAML frontmatter declaring: `type`, `part`, `chapter`, `title`, `status`, `summary`, `sources`, `token_estimate`, `audience`.

### Rationale

**Organon compliance.** The Organon methodology (from `book-llms/ETHOS.md`) mandates that every organon file has YAML frontmatter with progressive disclosure metadata. The book-humans project is itself an Organon implementation, so we follow this discipline.

**Progressive disclosure.** An agent can read the frontmatter (~25 tokens) and decide whether the chapter is relevant before loading the full content (potentially 2000+ tokens). This is critical for agents working on the book.

**Workflow tracking.** The `status` field (planned | draft | review | final) enables version control. You can grep all chapters and see what's complete.

**Empirical grounding.** The `sources` field forces authors to declare what sources ground the chapter's claims. This enforces P3 (empirical grounding) from ETHOS.md.

**Token budgeting.** The `token_estimate` field helps agents plan their context usage. A chapter with `token_estimate: 3000` requires careful loading; a chapter with `token_estimate: 500` is cheap to include.

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| **No frontmatter** | No metadata for progressive disclosure; agents must load full chapters to decide relevance |
| **Metadata in separate YAML files** | Extra files to manage; easy to fall out of sync with chapter content |
| **Metadata in a central registry** | Single point of failure; harder to keep in sync as chapters evolve |
| **Markdown comments for metadata** | Non-standard, harder for tools to parse reliably |

---

## Trade-offs: System-Level

Across all four decisions, the design accepts these trade-offs:

### Trade-off 1: Flexibility vs. Enforced Structure

**We accept:** Limited control over visual formatting in favor of enforced consistency.

**Why:** Consistency > flexibility. Chapters written by different authors will look uniform; no author accidentally breaks the visual hierarchy.

### Trade-off 2: Speed vs. Features

**We accept:** Simpler templates (Typst) + simpler content format (Markdown) in favor of author throughput.

**Why:** We're optimizing for *getting chapters written*, not for exotic typesetting features.

### Trade-off 3: Extensibility vs. Simplicity

**We accept:** No plugin system, no custom filters. Pandoc and Typst do what they do out of the box.

**Why:** The book is philosophical narrative, not a technical reference. We don't need fancy footnotes, sidebars, or interactive elements.

### Trade-off 4: Automation vs. Manual Review

**We accept:** `make build` is semi-automated (filters to existing chapters, compiles, outputs to tmp/). No CI/CD pipeline.

**Why:** The book is a human project. Automation helps, but the final decision to include a chapter is human. We don't need GitHub Actions.

### Trade-off 5: Metadata Overhead vs. Information Quality

**We accept:** Every chapter requires frontmatter with 10 fields. This is ~50 tokens of overhead per chapter.

**Why:** The metadata enables progressive disclosure and workflow tracking. Organon design depends on it. The cost is negligible.

---

## Success Criteria

The design succeeds if:

1. **Authors can write chapters without learning Typst or LaTeX.** A writer with Markdown knowledge can draft a chapter in 2-3 hours without tooling friction.

2. **LLM agents can read and understand the book structure from `_book.yaml` and chapter frontmatter.** An agent shouldn't need to explore the filesystem; the manifest tells it what exists.

3. **The book compiles consistently.** `make build` produces a clean PDF every time, from any chapter combination.

4. **Chapters remain independent.** Reordering chapters (via `_book.yaml`), removing chapters, or adding new ones doesn't require other chapters to change.

5. **The system is maintainable.** A newcomer can read this PHILOSOPHY.md and understand why each decision was made.

---

## Future Evolution

If the design needs to change:

- **Adding interactivity?** Switch from Typst to a web-first format (GlyphJS or similar).
- **Adding rich diagrams?** Typst supports SVG; embed diagrams as SVG files.
- **Publishing to web?** Pandoc can output HTML. The Markdown source is conversion-agnostic.
- **Multi-language support?** Pandoc supports `lang` metadata. Translate chapter `.md` files; build in multiple languages.

The system is designed to evolve. Decisions are documented so future changes have context.
