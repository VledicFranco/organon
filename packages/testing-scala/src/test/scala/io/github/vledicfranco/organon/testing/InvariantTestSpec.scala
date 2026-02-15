package io.github.vledicfranco.organon.testing

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class InvariantTestSpec extends munit.FunSuite:

  // --- validateInvariantId ---

  test("validateInvariantId accepts valid IDs"):
    InvariantTest.validateInvariantId("INV-CACHE-1")
    InvariantTest.validateInvariantId("INV-TEST-42")
    InvariantTest.validateInvariantId("MY-ID")

  test("validateInvariantId rejects empty string"):
    intercept[InvariantTestError]:
      InvariantTest.validateInvariantId("")

  test("validateInvariantId rejects null"):
    intercept[InvariantTestError]:
      InvariantTest.validateInvariantId(null)

  test("validateInvariantId rejects whitespace-only"):
    intercept[InvariantTestError]:
      InvariantTest.validateInvariantId("   ")

  test("validateInvariantId rejects leading/trailing whitespace"):
    val ex = intercept[InvariantTestError]:
      InvariantTest.validateInvariantId("  INV-FOO-1  ")
    assert(ex.getMessage.contains("whitespace"))

  // --- validateDescription ---

  test("validateDescription accepts valid descriptions"):
    InvariantTest.validateDescription("cache TTL max 24h")

  test("validateDescription rejects empty string"):
    intercept[InvariantTestError]:
      InvariantTest.validateDescription("")

  test("validateDescription rejects null"):
    intercept[InvariantTestError]:
      InvariantTest.validateDescription(null)

  // --- validateTestFn ---

  test("validateTestFn accepts valid functions"):
    InvariantTest.validateTestFn(() => Future.successful(()))

  test("validateTestFn rejects null"):
    intercept[InvariantTestError]:
      InvariantTest.validateTestFn(null)

  // --- Registry ---

  test("registry tracks registrations"):
    val registry = InvariantTestRegistry()
    assertEquals(registry.size, 0)

    registry.register(InvariantTestMetadata("INV-FOO-1", "test 1"))
    assertEquals(registry.size, 1)
    assert(registry.has("INV-FOO-1"))
    assert(!registry.has("INV-FOO-2"))

  test("registry supports multiple registrations for same ID"):
    val registry = InvariantTestRegistry()
    registry.register(InvariantTestMetadata("INV-FOO-1", "test 1a"))
    registry.register(InvariantTestMetadata("INV-FOO-1", "test 1b"))
    assertEquals(registry.size, 2)
    assertEquals(registry.coveredCount, 1) // distinct IDs

  test("registry clear removes all entries"):
    val registry = InvariantTestRegistry()
    registry.register(InvariantTestMetadata("INV-FOO-1", "test 1"))
    assertEquals(registry.size, 1)
    registry.clear()
    assertEquals(registry.size, 0)

  test("getAll returns defensive copies"):
    val registry = InvariantTestRegistry()
    registry.register(InvariantTestMetadata("INV-FOO-1", "test 1"))
    val snapshot = registry.getAll
    assertEquals(snapshot.length, 1)
    registry.register(InvariantTestMetadata("INV-FOO-2", "test 2"))
    assertEquals(snapshot.length, 1) // original snapshot unchanged

  // --- testInvariant ---

  test("testInvariant registers and runs the test"):
    val registry = InvariantTestRegistry()
    var ran      = false

    InvariantTest.testInvariant(
      "INV-TEST-1",
      "test description",
      () => { ran = true; Future.successful(()) },
      TestInvariantOptions(registry = Some(registry))
    )

    assert(registry.has("INV-TEST-1"))
    assert(ran)

  test("testInvariant uses custom runner when provided"):
    var runnerCalled = false
    val customRunner: TestRunner = (name, fn, meta) =>
      runnerCalled = true
      assertEquals(name, "[INV-TEST-1] test desc")

    InvariantTest.testInvariant(
      "INV-TEST-1",
      "test desc",
      () => Future.successful(()),
      TestInvariantOptions(runner = Some(customRunner))
    )

    assert(runnerCalled)
