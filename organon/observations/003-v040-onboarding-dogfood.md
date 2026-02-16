---
type: rationale
scope: product
name: v040-onboarding-dogfood
version: "1.0"
summary: Observations from simulating a new-agent onboarding with v0.4.0 on a fresh personal brand webpage project
token_estimate: 1200
status: complete
created: 2026-02-13
author: Claude Opus 4.6
audience: [llm, human]
---

# Observation 003: v0.4.0 Onboarding Dogfood

> What we learned by pretending to be a fresh Claude session bootstrapping organon-demo (personal brand webpage) with v0.4.0.

---

## Context

After publishing v0.4.0 to npm, we simulated the new-agent experience: global install, `organon init --skills`, read PRIMER.md, customize ETHOS.md and PHILOSOPHY.md, run verify + health. The project was a simple personal brand static website. The goal was to evaluate the Issue #3 (agent methodology onboarding) improvements end-to-end.

---

## Observations

### O1: Onboarding path is clear and self-guiding

**Signal:** CLAUDE.md → PRIMER.md → ETHOS.md template → verify was a natural, linear flow. The "First Session Setup" checklist in CLAUDE.md gave concrete numbered steps. No ambiguity about what to do first.

**Implication:** The v0.4.0 onboarding design works as intended. An agent reading CLAUDE.md gets a clear action plan without needing to explore the filesystem.

**Suggested Action:** None — this is working well.

### O2: Project name detection worked flawlessly

**Signal:** `package.json` had `"name": "organon-demo"` and all generated files used `organon-demo` as the frontmatter name. No manual find-replace needed.

**Implication:** A1 (project name detection) eliminates a friction point that existed in every v0.3.0 adoption.

**Suggested Action:** None — working as designed.

### O3: ETHOS.md template scaffolds good structure but placeholders need more guidance

**Signal:** The template has a placeholder like "Describe what your project does — be specific" but doesn't hint at what "specific" means. A new agent filling this in for the first time has to infer the right level of detail from the structure. The PRIMER.md anti-pattern "Aspiration as invariant" helped, but an agent unfamiliar with organon methodology would benefit from a brief inline example.

**Implication:** The templates are functional but could include a commented-out example (e.g., `<!-- Example: A REST API for managing user accounts -->`) to reduce guesswork. This would make the first-fill experience faster.

**Suggested Action:** Consider adding HTML comments with one-line examples next to each placeholder. Low priority — current templates work, just not optimally for first-time users.

### O4: PHILOSOPHY.md template structure is excellent

**Signal:** "The Problem → The Bet → Design Decisions → Trade-offs" is a natural narrative flow. Filling it in for the personal brand site was intuitive — the structure guided the thinking, not just the formatting.

**Implication:** The PHILOSOPHY template is the strongest of the three artifact templates. The "Bet" framing forces concrete, falsifiable reasoning.

**Suggested Action:** None — this is a strength to preserve.

### O5: Health score 95/100 out of the box with customized content

**Signal:** After customizing ETHOS.md and PHILOSOPHY.md (but leaving PROTOCOLS.md as template), health was 95/100. The 5-point penalty was from the methodology-reference.md containing a placeholder pattern in its gate table description — same false positive as the canonical repo.

**Implication:** The health score reflects real quality well. A freshly customized project (2/7 files edited) scoring 95 is appropriate — it means the scaffolding is good and the agent just needs to fill in the remaining content.

**Suggested Action:** The placeholder false positive in methodology-reference.md should be fixed in the template — it's a description of the gate, not a placeholder. Rephrase to avoid the regex match.

### O6: Token estimates on customized files may drift

**Signal:** ETHOS.md template had `token_estimate: 450` but after customization with 4 invariants, 4 principles, and 5 heuristics, the actual content is likely different. We didn't update it after editing.

**Implication:** The onboarding flow doesn't remind agents to update `token_estimate` after customization. The verify gate catches this if drift exceeds 50%, but agents may not think to update it proactively.

**Suggested Action:** Add a note to the "First Session Setup" checklist in CLAUDE.md: "After editing organon files, run `organon validate` to check token estimate accuracy." Or add this to the verify-and-health skill's post-fix steps.

### O7: 14 files is a lot of scaffolding for a simple project

**Signal:** A personal brand webpage with 3 pages generated 14 organon governance files. The PRIMER.md (1500 tokens) and methodology-reference.md (3600 tokens) are methodology documentation, not project documentation. For a sophisticated project this is fine, but for a simple static site it's heavy.

**Implication:** The methodology has a minimum viable project size below which the governance overhead exceeds the value. A 5-page static site probably doesn't need 5 skills and 9 verification gates. But the init command has no "light mode."

**Suggested Action:** Consider a future `organon init --minimal` flag that generates only config + ETHOS.md + CLAUDE.md (3 files) without skills, PRIMER, methodology-reference, or PROTOCOLS. Low priority — the current scaffold doesn't break anything, it's just more than needed for trivial projects.

### O8: WORKFLOW_STEP_COUNT_LOW warnings are noisy for new projects

**Signal:** 5 workflow step count warnings appeared immediately on a fresh scaffold. These are advisory and don't block anything, but a new user seeing 15+ warnings on their first `organon verify` might feel something is wrong.

**Implication:** The step count comparison between distributed skill templates (condensed) and the canonical protocols (full) produces warnings that are structurally unavoidable. Every new project will see these.

**Suggested Action:** Consider suppressing `WORKFLOW_STEP_COUNT_LOW` for skills whose `methodology_version` matches the CLI version (i.e., they were just generated and are intentionally condensed). Or increase the step threshold ratio before warning. Medium priority — affects first impression.

---

## Synthesis

The v0.4.0 onboarding experience is a significant improvement over v0.3.0:
- **What works:** Name detection, CLAUDE.md guidance, PRIMER.md onboarding, PHILOSOPHY template structure, health scoring, config directory walking
- **What could improve:** ETHOS template examples (O3), false positive in methodology-reference (O5), token estimate reminder (O6), minimal init mode (O7), warning noise for fresh projects (O8)
- **Overall assessment:** An agent can go from zero to a governed project in ~5 minutes. The methodology overhead is proportional for medium-to-large projects but slightly heavy for trivial ones.
