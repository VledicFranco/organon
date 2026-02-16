package io.github.vledicfranco.organon.testing.assertions

import io.github.vledicfranco.organon.testing.*
import io.github.vledicfranco.organon.testing.core.assertions.*

class ExportsPresentValidatorSpec extends munit.FunSuite:

  test("passes when all expected exports are found"):
    ExportsPresentValidator.validate(
      file = "index.scala",
      expectedExports = Seq("foo", "bar", "baz"),
      foundExports = Seq("foo", "bar", "baz", "extra")
    )

  test("throws when an expected export is missing"):
    val ex = intercept[ExportsPresentAssertionError]:
      ExportsPresentValidator.validate(
        file = "index.scala",
        expectedExports = Seq("foo", "missing"),
        foundExports = Seq("foo", "bar")
      )
    assertEquals(ex.violations.length, 1)
    assertEquals(ex.violations.head.name, "missing")
    assertEquals(ex.violations.head.file, "index.scala")

  test("collects all missing exports before throwing"):
    val ex = intercept[ExportsPresentAssertionError]:
      ExportsPresentValidator.validate(
        file = "index.scala",
        expectedExports = Seq("a", "b", "c"),
        foundExports = Seq("d", "e")
      )
    assertEquals(ex.violations.length, 3)

  test("passes with empty expected exports"):
    ExportsPresentValidator.validate(
      file = "index.scala",
      expectedExports = Seq.empty,
      foundExports = Seq("foo")
    )

  test("error message includes file and export names"):
    val ex = intercept[ExportsPresentAssertionError]:
      ExportsPresentValidator.validate(
        file = "src/main.scala",
        expectedExports = Seq("myFunc"),
        foundExports = Seq.empty
      )
    assert(ex.getMessage.contains("src/main.scala"))
    assert(ex.getMessage.contains("myFunc"))

  // --- extractExportNames: enum case detection (#8) ---

  test("extractExportNames detects enum case members"):
    val content = "enum Color:\n  case Red, Green, Blue"
    val names = Assertions.extractExportNames(content)
    assert(names.contains("Color"))
    assert(names.contains("Red"))
    assert(names.contains("Green"))
    assert(names.contains("Blue"))

  test("extractExportNames does not extract match arm cases"):
    val content = "x match\n  case Foo => doThing()\n  case bar => other()"
    val names = Assertions.extractExportNames(content)
    assert(!names.contains("Foo"))
    assert(!names.contains("bar"))

  test("extractExportNames handles single enum case"):
    val content = "enum Status:\n  case Active"
    val names = Assertions.extractExportNames(content)
    assert(names.contains("Status"))
    assert(names.contains("Active"))
