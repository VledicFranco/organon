package com.vledicfranco.organon.testing

import scala.concurrent.{ExecutionContext, Future}

/** A test function that verifies an invariant. Always async (INV-TEST-6). */
type InvariantTestFn = () => Future[Unit]

/** A test runner function provided by framework adapters. */
type TestRunner = (String, InvariantTestFn, InvariantTestMetadata) => Unit

/** Options for configuring testInvariant behavior. */
case class TestInvariantOptions(
    runner: Option[TestRunner] = None,
    registry: Option[InvariantTestRegistry] = None
)

object TestInvariantOptions:
  val default: TestInvariantOptions = TestInvariantOptions()

/** testInvariant — Wrapper that links tests to invariant IDs.
  *
  * INV-TEST-3: invariant-id-required INV-TEST-4: framework-agnostic-core INV-TEST-6: always-async INV-TEST-7:
  * composable
  */
object InvariantTest:

  /** Default global registry. */
  private val defaultRegistry: InvariantTestRegistry = InvariantTestRegistry()

  /** Get the default global registry for coverage reporting. */
  def getDefaultRegistry: InvariantTestRegistry = defaultRegistry

  /** Default test runner: executes the async test function directly. */
  val defaultRunner: TestRunner = (testName, testFn, _metadata) =>
    testFn().recover { case err: Throwable =>
      val wrapped = err match
        case e: RuntimeException => e
        case t                   => new RuntimeException(t.getMessage, t)
      throw new RuntimeException(s"[$testName] ${wrapped.getMessage}", wrapped)
    }(ExecutionContext.global)
    ()

  /** Validate an invariant ID format. */
  def validateInvariantId(id: String): Unit =
    if id == null || id.isEmpty then
      throw InvariantTestError("Invariant ID is required. Provide a non-empty string (e.g., \"INV-CACHE-1\").")
    val trimmed = id.trim
    if trimmed.isEmpty then throw InvariantTestError("Invariant ID must not be empty or whitespace-only.")
    if trimmed != id then
      throw InvariantTestError(s"Invariant ID \"$id\" contains leading or trailing whitespace. Use \"$trimmed\" instead.")

  /** Validate a test description. */
  def validateDescription(description: String): Unit =
    if description == null || description.isEmpty then
      throw InvariantTestError(
        "Test description is required. Provide a non-empty string describing what the test verifies."
      )
    val trimmed = description.trim
    if trimmed.isEmpty then throw InvariantTestError("Test description must not be empty or whitespace-only.")

  /** Validate a test function. */
  def validateTestFn(testFn: InvariantTestFn): Unit =
    if testFn == null then throw InvariantTestError("Test function is required. Got null instead of a function.")

  /** Register and declare an invariant test.
    *
    * @param invariantId
    *   The invariant ID this test verifies
    * @param description
    *   Human-readable description of what the test checks
    * @param testFn
    *   Async function that performs assertions
    * @param options
    *   Optional configuration (custom runner, custom registry)
    */
  def testInvariant(
      invariantId: String,
      description: String,
      testFn: InvariantTestFn,
      options: TestInvariantOptions = TestInvariantOptions.default
  ): Unit =
    // 1. Validate inputs
    validateInvariantId(invariantId)
    validateDescription(description)
    validateTestFn(testFn)

    // 2. Build metadata
    val metadata = InvariantTestMetadata(invariantId, description)

    // 3. Register in the registry
    val registry = options.registry.getOrElse(defaultRegistry)
    registry.register(metadata)

    // 4. Delegate to test runner
    val runner   = options.runner.getOrElse(defaultRunner)
    val testName = s"[$invariantId] $description"
    runner(testName, testFn, metadata)
