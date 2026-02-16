package io.github.vledicfranco.organon.testing.adapters

import io.github.vledicfranco.organon.testing.*

import scala.concurrent.{ExecutionContext, Future}

class ScalaTestAdapterSpec extends OrganonFlatSpec:

  // Override the FileSystem with in-memory test data
  override protected def fileSystem: FileSystem = TestFileSystem(Map(
    "src/config.scala" -> "val ttl = 100\nval timeout = 50",
    "src/core/TypeSystem.scala" -> "package io.constellation\n\ntrait CType\ntrait CValue\nenum CTypeTag",
    "src/core/Color.scala" -> "package io.constellation\n\nenum Color:\n  case Red, Green, Blue",
  ))(using ExecutionContext.global)

  testInvariant("INV-TEST-ADAPTER-1", "ScalaTest adapter registers and runs tests"):
    Future.successful {
      // If we get here, the adapter successfully registered and ran the test
      assert(true)
    }

  testInvariant("INV-TEST-ADAPTER-2", "ScalaTest adapter supports async assertions"):
    Future {
      val result = 1 + 1
      assert(result == 2)
    }(using ExecutionContext.global)

  testInvariant("INV-TEST-ADAPTER-3", "ScalaTest adapter works with assertMaxValue"):
    Assertions.assertMaxValue(MaxValueOptions(
      files = Seq("src/config.scala"),
      pattern = raw"val\s+\w+\s*=\s*(\d+)".r,
      maxValue = 200,
      unit = Some("units")
    ))

  testInvariant("INV-TEST-ADAPTER-4", "ScalaTest adapter works with assertFileExists"):
    Assertions.assertFileExists(FileExistsOptions(
      files = Seq("src/config.scala", "src/core/TypeSystem.scala")
    ))

  testInvariant("INV-TEST-ADAPTER-5", "ScalaTest adapter works with assertExportsPresent"):
    Assertions.assertExportsPresent(ExportsPresentOptions(
      file = "src/core/TypeSystem.scala",
      expectedExports = Seq("CType", "CValue", "CTypeTag")
    ))

  testInvariant("INV-TEST-ADAPTER-6", "ScalaTest adapter detects enum case members"):
    Assertions.assertExportsPresent(ExportsPresentOptions(
      file = "src/core/Color.scala",
      expectedExports = Seq("Color", "Red", "Green", "Blue")
    ))
