package io.github.vledicfranco.organon.testing.adapters

import io.github.vledicfranco.organon.testing.*

import scala.concurrent.{ExecutionContext, Future}

/** MUnit adapter for @organon-methodology/testing.
  *
  * Provides an OrganonSuite trait that extends MUnit's FunSuite, bridging invariant tests to MUnit's test lifecycle.
  *
  * Usage:
  * {{{
  * import io.github.vledicfranco.organon.testing.adapters.OrganonSuite
  *
  * class CacheInvariantsSpec extends OrganonSuite:
  *   testInvariant("INV-CACHE-1", "TTL never exceeds 24 hours"):
  *     Assertions.assertMaxValue(MaxValueOptions(
  *       files = Seq("src/**/*.scala"),
  *       pattern = raw"ttl\s*=\s*(\d+)".r,
  *       maxValue = 86400,
  *       unit = Some("seconds")
  *     ))
  * }}}
  */
trait OrganonSuite extends munit.FunSuite:

  /** Default ExecutionContext. Override for custom thread pools. */
  protected def executionContext: ExecutionContext = ExecutionContext.global
  given ExecutionContext = executionContext

  /** Default FileSystem (OsLib-backed real I/O). Override in tests for mocking. */
  protected def fileSystem: FileSystem = OsLibFileSystem()
  given FileSystem = fileSystem

  /** MUnit runner that delegates to munit's test(). */
  private val munitRunner: TestRunner = (name, fn, _meta) =>
    test(name)(fn()) // MUnit handles Future natively

  /** Register and declare an invariant test using MUnit.
    *
    * @param invariantId
    *   The invariant ID this test verifies (e.g., "INV-CACHE-1")
    * @param description
    *   Human-readable description of what the test checks
    * @param testFn
    *   Async function that performs assertions
    */
  def testInvariant(
      invariantId: String,
      description: String
  )(testFn: => Future[Unit]): Unit =
    InvariantTest.testInvariant(
      invariantId,
      description,
      () => testFn,
      TestInvariantOptions(runner = Some(munitRunner))
    )
