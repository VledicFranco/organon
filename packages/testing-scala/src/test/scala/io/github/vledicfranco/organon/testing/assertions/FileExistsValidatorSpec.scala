package io.github.vledicfranco.organon.testing.assertions

import io.github.vledicfranco.organon.testing.*
import io.github.vledicfranco.organon.testing.core.assertions.*

class FileExistsValidatorSpec extends munit.FunSuite:

  test("passes when all files exist"):
    FileExistsValidator.validate(
      Seq(
        FileExistsEntry("a.scala", exists = true),
        FileExistsEntry("b.scala", exists = true),
      )
    )

  test("passes with empty entries list"):
    FileExistsValidator.validate(Seq.empty)

  test("throws when a file does not exist"):
    val ex = intercept[FileExistsAssertionError]:
      FileExistsValidator.validate(
        Seq(FileExistsEntry("missing.scala", exists = false))
      )
    assertEquals(ex.violations.length, 1)
    assertEquals(ex.violations.head.file, "missing.scala")

  test("collects all missing files before throwing"):
    val ex = intercept[FileExistsAssertionError]:
      FileExistsValidator.validate(
        Seq(
          FileExistsEntry("exists.scala", exists = true),
          FileExistsEntry("missing1.scala", exists = false),
          FileExistsEntry("missing2.scala", exists = false),
        )
      )
    assertEquals(ex.violations.length, 2)

  test("error message lists missing files"):
    val ex = intercept[FileExistsAssertionError]:
      FileExistsValidator.validate(
        Seq(FileExistsEntry("foo/bar.scala", exists = false))
      )
    assert(ex.getMessage.contains("foo/bar.scala"))
