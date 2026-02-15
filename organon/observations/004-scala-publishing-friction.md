---
type: rationale
scope: product
name: scala-publishing-friction
version: "1.0"
summary: Observations from first Maven Central publish of Scala testing library — CI/CD friction points and multi-language release patterns
token_estimate: 900
status: complete
created: 2026-02-15
author: Claude Opus 4.6
audience: [llm, human]
---

# Observation 004: Scala Publishing Friction

> What we learned from 4 consecutive CI failures before successfully publishing `organon-testing_3` v0.0.1 to Maven Central.

---

## Context

RFC 008 added a Scala 3 port of the testing library. After merging, we attempted to publish v0.0.1 to Maven Central via a new `release-scala.yml` GitHub Actions workflow. It took 4 attempts to get right.

---

## Observations

### O1: sbt-ci-release assumes tag-based versioning

**Signal:** `sbt ci-release` checks `sbt-dynver` for a `v*` git tag on the current commit. Without one, it treats the build as a SNAPSHOT and refuses to publish non-SNAPSHOT versions. Our workflow creates a `scala-v*` tag (to avoid conflicting with npm's `v*` tags) but dynver doesn't recognize it.

**Implication:** `sbt-ci-release` is designed for repos where the version is derived entirely from git tags. In a monorepo with both npm and sbt packages at different versions, you must bypass dynver entirely.

**Suggested Action:** The working pattern is: override `version`, `isSnapshot`, and `dynverSonatypeSnapshots` in build.sbt at CI time, then call `sbt +publishSigned sonatypeBundleRelease` directly instead of `sbt ci-release`.

### O2: sbt-ci-release silently handles GPG import

**Signal:** When we switched from `sbt ci-release` to direct `publishSigned`, GPG signing failed because ci-release auto-imports `PGP_SECRET` into the GPG keyring. Without ci-release, the key isn't imported.

**Implication:** Magic hidden in convenience commands creates failure modes when you decompose them. Any CI step that replaces a convenience command must replicate its side effects.

**Suggested Action:** Always add explicit `gpg --batch --import` step before `publishSigned` in custom workflows.

### O3: Sonatype Central vs legacy OSSRH

**Signal:** `sbt-sonatype` defaults to `oss.sonatype.org` (legacy OSSRH). New namespaces registered on Sonatype Central (`central.sonatype.com`) fail with authentication errors on the legacy endpoint.

**Implication:** Any Sonatype tutorial or Stack Overflow answer older than ~2024 will point to the wrong URL. The fix is `sonatypeCredentialHost := sonatypeCentralHost` in build.sbt.

**Suggested Action:** Document this in build.sbt with a comment. Future language ports (Python/PyPI, Rust/crates.io) won't have this issue — it's Sonatype-specific.

### O4: release-publish and pre-publish-qa skills are npm-only

**Signal:** Neither skill mentions Scala. A developer following `/release-publish` would have no idea that Scala tests need running or that a separate workflow exists.

**Implication:** As the monorepo grows multi-language, existing skills that assume a single build system become incomplete.

**Suggested Action:** Update both skills to mention the Scala workflow dispatch. Medium priority — the skills won't break, they're just incomplete.

---

## Synthesis

Maven Central publishing via sbt has significantly more friction than npm publishing. The key lesson: **don't use convenience wrappers (ci-release) in non-standard setups — decompose into explicit steps and handle each concern (version, GPG, signing, upload, release) independently.** The 4-failure sequence is now documented in MEMORY.md so it won't recur.
