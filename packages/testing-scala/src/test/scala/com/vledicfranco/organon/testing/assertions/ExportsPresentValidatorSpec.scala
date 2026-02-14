package com.vledicfranco.organon.testing.assertions

import com.vledicfranco.organon.testing.*
import com.vledicfranco.organon.testing.core.assertions.*

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
