---
type: rationale
scope: product
name: scala-testing-library
version: "1.0"
status: implemented
summary: Scala 3 port of @organon-methodology/testing with MUnit adapter and Maven Central publishing
token_estimate: 2500
author: Claude Opus 4.6
created: "2026-02-14"
primary_rfcs: ["001"]
audience: [llm, human]
---

# RFC 008: Scala 3 Testing Library & Multi-Language Package Strategy

> Scala 3 port of the testing library with feature parity, MUnit adapter, and Maven Central publishing.

---

## Problem Statement

The `@organon-methodology/testing` TypeScript library provides semantic invariant verification, but RFC 001 explicitly planned future language support: "Scala 3 (planned), Python (planned), Rust (planned)." Projects using Scala 3 have no way to write tier-4 invariant tests with the same semantic assertions.

## Proposed Solution

1. A Scala 3 port of the testing library with feature parity (6 assertions + testInvariant)
2. A multi-language package organization strategy (non-npm packages in the monorepo)
3. Maven Central publishing via sbt-ci-release

## Design Decisions

### 1. MUnit as primary test framework adapter
**Why:** Lightweight, async-first, part of official Scala Toolkit. MUnit's Future-native `test()` maps cleanly to the always-async invariant (INV-TEST-6).

### 2. os-lib for real FileSystem implementation
**Why:** Clean API, cross-platform path handling. The FileSystem trait abstraction still allows pure in-memory test implementations.

### 3. scala.concurrent.Future over Cats Effect/ZIO
**Why:** Zero dependencies beyond stdlib. The testing library's I/O is simple (read files, check existence). Users can wrap in CE/ZIO at the call site.

### 4. Same monorepo, separate build system
**Why:** `packages/testing-scala/` uses sbt (not npm). The npm `"workspaces"` glob ignores directories without `package.json`, so no npm config changes needed.

### 5. `using` context parameters for FileSystem and ExecutionContext
**Why:** Idiomatic Scala 3. Cleaner call sites than optional fields. Users provide FileSystem once at the suite level.

## Organon Impact

### Update
- `organon/domains/testing/ETHOS.md` — Added INV-TEST-8 (language-parity), updated identity to multi-language, bumped to v1.2
- `organon/domains/testing/PHILOSOPHY.md` — Added 3 Scala design decisions (MUnit, os-lib, Futures), bumped to v1.1
- `organon/domains/testing/README.md` — Added Scala package references, updated stats

### Create
- `packages/testing-scala/` — Full Scala 3 implementation (17 source files, 10 test files)
- `rfcs/008-scala-testing-library.md` — This RFC

## Implementation Summary

- **17 main source files:** FileSystem, errors, 6 resolvers, 5 validators, Assertions, InvariantTest, InvariantTestRegistry, MUnitAdapter
- **10 test files:** TestFileSystem (in-memory mock), 5 validator specs, 2 resolver specs, InvariantTestSpec, MUnitAdapterSpec
- **66 tests passing** across all modules
- **Build:** sbt 1.10.7, Scala 3.3.4, os-lib 0.11.4, MUnit 1.1.0
- **CI:** GitHub Actions job for Scala tests (separate from Node.js job)
- **Publishing:** sbt-ci-release to Maven Central via `io.github.vledicfranco` namespace

## What We Did NOT Do

- No ScalaTest adapter (future — MUnit only for now)
- No Scala 2.13 cross-build
- No Cats Effect or ZIO dependency
- No changes to TypeScript packages
- No `organon init` Scala template support

---

## Related Files

| File | Relationship |
|------|-------------|
| [001-testing-framework.md](./001-testing-framework.md) | Parent RFC that planned multi-language support |
| [../organon/domains/testing/ETHOS.md](../organon/domains/testing/ETHOS.md) | Domain constraints (updated with INV-TEST-8) |
| [../packages/testing-scala/](../packages/testing-scala/) | Implementation |
