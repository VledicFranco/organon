package io.github.vledicfranco.organon.testing.assertions

import io.github.vledicfranco.organon.testing.*
import io.github.vledicfranco.organon.testing.core.assertions.*
import io.github.vledicfranco.organon.testing.core.resolvers.ImportMatch

class NoSideEffectsValidatorSpec extends munit.FunSuite:

  test("passes when no imports match forbidden list"):
    NoSideEffectsValidator.validate(
      imports = Seq(
        ImportMatch("a.scala", 1, "import com.example.Foo", "com.example.Foo"),
      ),
      forbiddenModules = Seq("java.io")
    )

  test("passes with empty imports list"):
    NoSideEffectsValidator.validate(
      imports = Seq.empty,
      forbiddenModules = Seq("java.io")
    )

  test("throws on exact match"):
    val ex = intercept[NoSideEffectsAssertionError]:
      NoSideEffectsValidator.validate(
        imports = Seq(ImportMatch("a.scala", 1, "import java.io", "java.io")),
        forbiddenModules = Seq("java.io")
      )
    assertEquals(ex.violations.length, 1)
    assertEquals(ex.violations.head.module, "java.io")

  test("throws on Scala package prefix match"):
    val ex = intercept[NoSideEffectsAssertionError]:
      NoSideEffectsValidator.validate(
        imports = Seq(ImportMatch("a.scala", 1, "import java.io.File", "java.io.File")),
        forbiddenModules = Seq("java.io")
      )
    assertEquals(ex.violations.length, 1)

  test("throws on JS node: prefix match"):
    val ex = intercept[NoSideEffectsAssertionError]:
      NoSideEffectsValidator.validate(
        imports = Seq(ImportMatch("a.ts", 1, "import fs from 'node:fs'", "node:fs")),
        forbiddenModules = Seq("fs")
      )
    assertEquals(ex.violations.length, 1)

  test("throws on JS subpath match"):
    val ex = intercept[NoSideEffectsAssertionError]:
      NoSideEffectsValidator.validate(
        imports = Seq(ImportMatch("a.ts", 1, "import { readFile } from 'fs/promises'", "fs/promises")),
        forbiddenModules = Seq("fs")
      )
    assertEquals(ex.violations.length, 1)

  test("collects all violations before throwing"):
    val ex = intercept[NoSideEffectsAssertionError]:
      NoSideEffectsValidator.validate(
        imports = Seq(
          ImportMatch("a.scala", 1, "import java.io.File", "java.io.File"),
          ImportMatch("a.scala", 2, "import com.example.Foo", "com.example.Foo"),
          ImportMatch("b.scala", 1, "import scala.io.Source", "scala.io.Source"),
        ),
        forbiddenModules = Seq("java.io", "scala.io")
      )
    assertEquals(ex.violations.length, 2)

  test("isForbidden returns false for non-matching modules"):
    assert(!NoSideEffectsValidator.isForbidden("com.example.Foo", Seq("java.io")))

  test("isForbidden returns true for exact match"):
    assert(NoSideEffectsValidator.isForbidden("java.io", Seq("java.io")))
