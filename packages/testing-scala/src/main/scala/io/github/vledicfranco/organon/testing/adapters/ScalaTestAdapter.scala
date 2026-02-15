package io.github.vledicfranco.organon.testing.adapters

import io.github.vledicfranco.organon.testing.*

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import scala.concurrent.{Await, ExecutionContext, Future}
import scala.concurrent.duration.*

/** ScalaTest adapter for @organon-methodology/testing.
  *
  * Provides an OrganonFlatSpec trait that extends ScalaTest's AnyFlatSpec with Matchers, bridging invariant tests to
  * ScalaTest's test lifecycle.
  *
  * Usage:
  * {{{
  * import io.github.vledicfranco.organon.testing.adapters.OrganonFlatSpec
  *
  * class CacheInvariantsSpec extends OrganonFlatSpec:
  *   testInvariant("INV-CACHE-1", "TTL never exceeds 24 hours"):
  *     Assertions.assertMaxValue(MaxValueOptions(
  *       files = Seq("src/**/*.scala"),
  *       pattern = raw"ttl\s*=\s*(\d+)".r,
  *       maxValue = 86400,
  *       unit = Some("seconds")
  *     ))
  * }}}
  */
trait OrganonFlatSpec extends AnyFlatSpec with Matchers:

  /** Timeout for awaiting async test results. Override for longer-running tests. */
  protected def assertionTimeout: FiniteDuration = 30.seconds

  /** Default ExecutionContext. Override for custom thread pools. */
  protected def executionContext: ExecutionContext = ExecutionContext.global
  given ExecutionContext = executionContext

  /** Default FileSystem (OsLib-backed real I/O). Override in tests for mocking. */
  protected def fileSystem: FileSystem = OsLibFileSystem()
  given FileSystem = fileSystem

  /** ScalaTest runner that delegates to ScalaTest's `it should ... in { }`. */
  private val scalaTestRunner: TestRunner = (name, fn, _meta) =>
    it should name in {
      Await.result(fn(), assertionTimeout)
    }

  /** Register and declare an invariant test using ScalaTest.
    *
    * Accepts `Future[Any]` rather than `Future[Unit]` because ScalaTest assertions return `Assertion`, not `Unit`.
    *
    * @param invariantId
    *   The invariant ID this test verifies (e.g., "INV-CACHE-1")
    * @param description
    *   Human-readable description of what the test checks
    * @param testFn
    *   Async function that performs assertions (may return Future[Unit] or Future[Assertion])
    */
  def testInvariant(
      invariantId: String,
      description: String
  )(testFn: => Future[Any]): Unit =
    InvariantTest.testInvariant(
      invariantId,
      description,
      () => testFn.map(_ => ())(using executionContext),
      TestInvariantOptions(runner = Some(scalaTestRunner))
    )
