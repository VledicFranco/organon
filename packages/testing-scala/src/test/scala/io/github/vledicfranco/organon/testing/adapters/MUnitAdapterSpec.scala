package io.github.vledicfranco.organon.testing.adapters

import io.github.vledicfranco.organon.testing.*

import scala.concurrent.{ExecutionContext, Future}

class MUnitAdapterSpec extends OrganonSuite:

  // Override the FileSystem via the protected def
  override protected def fileSystem: FileSystem = TestFileSystem(Map(
    "src/config.scala" -> "val ttl = 100\nval timeout = 50",
  ))(using ExecutionContext.global)

  testInvariant("INV-TEST-ADAPTER-1", "MUnit adapter registers and runs tests"):
    Future.successful {
      // If we get here, the adapter successfully registered and ran the test
      assert(true)
    }

  testInvariant("INV-TEST-ADAPTER-2", "MUnit adapter supports async assertions"):
    Future {
      val result = 1 + 1
      assertEquals(result, 2)
    }(using ExecutionContext.global)
