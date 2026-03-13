---
type: constraints
scope: domain
name: book-humans
version: "1.0"
summary: Authoring constraints for book-humans — 5 invariants, 4 principles, 8-row decision heuristics
token_estimate: 2800
invariants:
  - id: INV-BKHU-1
    name: every-chapter-has-frontmatter
    judgment_call: true
  - id: INV-BKHU-2
    name: markdown-only-in-chapters
    judgment_call: true
  - id: INV-BKHU-3
    name: book-yaml-is-authoritative-manifest
    judgment_call: true
  - id: INV-BKHU-4
    name: pdfs-go-to-tmp
    judgment_call: true
  - id: INV-BKHU-5
    name: visual-changes-in-template-only
    judgment_call: true
heuristics_count: 8
inherits_from: [organon-project]
audience: [llm, human]
related_files:
  - PHILOSOPHY.md
  - README.md
  - ../../book-humans/README.md
---

# book-humans Authoring Ethos

> Behavioral constraints for authors and agents drafting chapters of "On Governing Minds That Don't Remember."

---

## Identity

### What This Domain IS

- The governance and authoring constraints for a philosophical book on LLM nature, best practices, and Organon methodology
- A system designed for human-authored chapters + LLM-assisted drafting and editing
- Driven by the principle that *content quality matters more than output speed*
- Structured to enable both human authors and LLM agents to write coherently within constraints

### What This Domain IS NOT

- Not a prescriptive style guide (we don't enforce sentence length or vocabulary)
- Not a publishing project (chapters are works-in-progress; the book evolves)
- Not a replacement for human editorial judgment
- Not a system for rapid content generation

---

## Invariants

### INV-BKHU-1: Every Chapter Has YAML Frontmatter

**The constraint:**
Every markdown chapter file (`.md`) must open with YAML frontmatter containing all required fields: `type`, `scope`, `part`, `part_name`, `chapter`, `title`, `status`, `summary`, `sources`, `token_estimate`, `audience`.

**Why:**
Frontmatter enables progressive disclosure. An agent can decide whether a chapter is relevant before loading the full content. It also enforces the Organon principle that every organon file carries metadata about itself.

**Enforcement:**
- `organon verify` (gate: frontmatter) — checks that all chapters have required fields
- Manual review before marking `status: final`

---

### INV-BKHU-2: Markdown Only in Chapter Files

**The constraint:**
Chapter content files contain only Markdown + YAML frontmatter. No Typst syntax. No LaTeX. No HTML. All visual/layout changes go in `_build/template.typ`, not in chapter markdown.

**Why:**
Authors should write content, not worry about typesetting. Typst templates handle presentation. This separation enables writers to focus on argument, not formatting.

**Enforcement:**
- `organon verify` (gate: content-type) — scans chapters for non-Markdown syntax
- Makefile build failure if Typst syntax detected in chapter files

---

### INV-BKHU-3: `_book.yaml` Is the Authoritative Manifest

**The constraint:**
Chapter order is determined exclusively by `_book.yaml`. No filesystem globbing. No implicit ordering. Unwritten chapters are listed with `# ` prefix (commented out). Adding a chapter requires:
1. Creating the file
2. Updating `_book.yaml`
3. Running `make build` to verify

**Why:**
Explicit manifest survives directory renames, structural changes, and reordering. LLMs can read `_book.yaml` to understand the book's structure without filesystem queries.

**Enforcement:**
- Makefile reads `_book.yaml` exclusively for chapter order
- No fallback to filesystem glob

---

### INV-BKHU-4: PDFs Go to `../../tmp/`, Never in book-humans/

**The constraint:**
All built PDFs are placed in `../../tmp/` with timestamped names (`YYYYMMDD-book-humans.pdf`). Never store PDFs inside `book-humans/`.

**Why:**
`tmp/` is the workspace's ephemeral artifacts directory. PDFs are regenerable; keeping them out of the repository prevents large binary diffs and keeps the book-humans directory focused on source files.

**Enforcement:**
- Makefile hard-codes output path as `../../tmp/`
- `make clean` removes only from `../../tmp/`

---

### INV-BKHU-5: Visual/Layout Changes Go Only in `_build/template.typ`

**The constraint:**
Typst template (`_build/template.typ`) is the single source of truth for all visual presentation: fonts, spacing, heading styles, page layout, colors, TOC formatting. Authors never add visual markup to chapter markdown.

**Why:**
Centralized template control prevents presentation inconsistency. Authors focus on content; designers/templaters handle presentation. Changes to the book's look require exactly one file edit.

**Enforcement:**
- Code review: any Typst syntax in chapter files is rejected
- If a chapter needs visual special handling, the template is updated first, then all chapters benefit

---

## Principles (Prioritized)

### P1: Philosophical Arc Over Topical Coverage

**The principle:**
Chapters should build an *argument*, not collect topics. The book's strength is that it derives best practices and Organon from understanding what LLMs are. Each chapter advances this arc.

**When principle applies:**
- Choosing content for a chapter
- Deciding what belongs in the book vs. external resources
- Evaluating whether a chapter is "done"

**When principle conflicts:**
If a chapter needs reference material (terminology, taxonomy), put it in appendices. If it needs implementation details, link to external docs.

---

### P2: LLM-Readability Over Human Prose Optimization

**The principle:**
Structure, frontmatter, and vocabulary should be parseable and actionable by LLM agents. This doesn't mean "robotic writing." It means:
- Clear section headings (no ambiguous titles)
- Explicit argument structure (don't bury theses)
- Frontmatter that lets agents decide relevance

**When principle applies:**
- Designing chapter structure
- Choosing section headings
- Reviewing for clarity

**When principle conflicts:**
If maximally elegant human prose conflicts with LLM parseability, optimize for parseability. Human readers can cope with clear but imperfect writing; LLMs struggle with ambiguity.

---

### P3: Empirical Grounding Per Claim

**The principle:**
Claims about LLM behavior, research findings, or methodology impact must be grounded in evidence. Not every sentence needs a citation, but:
- Empirical claims (e.g., "LLMs are stateless") must cite a source
- Philosophical claims (e.g., "this matters because...") don't need citations but should be clearly labeled as reasoning, not fact
- Novel findings from Organon adoption go in `sources:` frontmatter

**When principle applies:**
- Making any factual claim about LLM nature, behavior, or research
- Claiming methodology impact
- Reporting empirical observations

**When principle conflicts:**
If an idea is important but poorly cited, write the chapter with a `[CITATION NEEDED]` marker and note it in chapter status.

---

### P4: Progressive Disclosure in Chapter Structure

**The principle:**
Chapter structure should support layered reading. A reader should be able to:
- Understand the chapter's relevance from frontmatter alone (~1 min)
- Grasp the argument from section headings alone (~5 min)
- Engage with full content (~20-30 min)

**How to achieve this:**
- Clear section headings that form an outline
- Frontmatter summary that articulates the chapter's thesis
- H2/H3 structure that lets readers scan and jump

**When principle applies:**
- Every chapter, always

---

## Decision Heuristics

| Situation | Action |
|-----------|--------|
| **Writing a new chapter** | (1) Check book outline in `README.md` to find your slot. (2) Create directory if needed (e.g., `part-1-llm-nature/`). (3) Create `.md` file with complete YAML frontmatter. (4) Update `_book.yaml` to uncomment or add the file. (5) Write an H2/H3 outline as a skeleton. (6) Fill in prose section by section. (7) Update `token_estimate` in frontmatter when content is ~90% done. (8) Set `status: draft` and commit. |
| **Compiling the book** | Run `make build` in `book-humans/` directory. Makefile extracts chapter list from `_book.yaml`, filters to existing files, and passes them to Pandoc. Output goes to `../../tmp/YYYYMMDD-book-humans.pdf`. |
| **Making a visual/layout change** | Edit `_build/template.typ` only. Never add visual markup to chapter markdown. Test by running `make build` and reviewing the PDF. |
| **Changing chapter order** | Edit `_book.yaml` only. Move the line with the chapter to its new position. Run `make build` to verify. No other changes needed. |
| **Cross-referencing other organon files** | Use relative paths: `../../book-llms/filename.md` or `../../docs/guide.md`. These paths work for both human readers and LLM agents. |
| **Starting a chapter draft** | Follow PROTO-ORG-12 (Chapter Drafting, see `../protocols/PROTOCOLS.md`). Includes frontmatter format, outline structure, and status transitions. |
| **Chapter needs revision** | Change `status: review` in frontmatter. Revise content. Change to `status: final` when complete. Use git history to track iterations. |
| **Chapter is "done"** | `status: final` means the chapter has been reviewed, sources are grounded, and content advances the book's arc. Not every chapter needs to be final; some can remain `draft`. Only `final` chapters are considered part of the "published" book. |

---

## Relationship to Organon

This domain is part of the larger **organon** scope. It inherits:
- **INV-META-1** through INV-META-6 from `organon/ETHOS.md` (e.g., every file has frontmatter, metadata enables progressive disclosure)
- **Principles 1-4** from `organon/ETHOS.md` (LLM-centric design, enforcement through automation, clarity, progressive disclosure)

This domain adds:
- **Domain-specific invariants** about chapter structure and the build system
- **Principles specific to book authoring** (philosophical arc, empirical grounding)
- **Decision heuristics for authors**

See `../ETHOS.md` for product-level Organon constraints.
