package com.vledicfranco.organon.testing.assertions

import com.vledicfranco.organon.testing.*
import com.vledicfranco.organon.testing.core.assertions.*
import com.vledicfranco.organon.testing.core.resolvers.ExtractedString

class NamingConventionValidatorSpec extends munit.FunSuite:

  // --- matchesConvention tests ---

  test("kebab-case matches valid strings"):
    assert(NamingConventionValidator.matchesConvention("foo-bar", Convention.KebabCase))
    assert(NamingConventionValidator.matchesConvention("foo", Convention.KebabCase))
    assert(NamingConventionValidator.matchesConvention("foo-bar-baz", Convention.KebabCase))

  test("kebab-case rejects invalid strings"):
    assert(!NamingConventionValidator.matchesConvention("FooBar", Convention.KebabCase))
    assert(!NamingConventionValidator.matchesConvention("foo_bar", Convention.KebabCase))

  test("camelCase matches valid strings"):
    assert(NamingConventionValidator.matchesConvention("fooBar", Convention.CamelCase))
    assert(NamingConventionValidator.matchesConvention("foo", Convention.CamelCase))

  test("camelCase rejects invalid strings"):
    assert(!NamingConventionValidator.matchesConvention("FooBar", Convention.CamelCase))
    assert(!NamingConventionValidator.matchesConvention("foo-bar", Convention.CamelCase))

  test("PascalCase matches valid strings"):
    assert(NamingConventionValidator.matchesConvention("FooBar", Convention.PascalCase))
    assert(NamingConventionValidator.matchesConvention("Foo", Convention.PascalCase))

  test("PascalCase rejects invalid strings"):
    assert(!NamingConventionValidator.matchesConvention("fooBar", Convention.PascalCase))
    assert(!NamingConventionValidator.matchesConvention("foo-bar", Convention.PascalCase))

  test("SCREAMING_SNAKE_CASE matches valid strings"):
    assert(NamingConventionValidator.matchesConvention("FOO_BAR", Convention.ScreamingSnakeCase))
    assert(NamingConventionValidator.matchesConvention("FOO", Convention.ScreamingSnakeCase))

  test("SCREAMING_SNAKE_CASE rejects invalid strings"):
    assert(!NamingConventionValidator.matchesConvention("foo_bar", Convention.ScreamingSnakeCase))
    assert(!NamingConventionValidator.matchesConvention("FooBar", Convention.ScreamingSnakeCase))

  test("snake_case matches valid strings"):
    assert(NamingConventionValidator.matchesConvention("foo_bar", Convention.SnakeCase))
    assert(NamingConventionValidator.matchesConvention("foo", Convention.SnakeCase))

  test("snake_case rejects invalid strings"):
    assert(!NamingConventionValidator.matchesConvention("FooBar", Convention.SnakeCase))
    assert(!NamingConventionValidator.matchesConvention("FOO_BAR", Convention.SnakeCase))

  // --- validate tests ---

  test("passes when all strings match convention"):
    NamingConventionValidator.validate(
      strings = Seq(
        ExtractedString("a.scala", "foo-bar", 1),
        ExtractedString("b.scala", "baz-qux", 2),
      ),
      convention = Convention.KebabCase
    )

  test("throws when a string violates convention"):
    val ex = intercept[NamingConventionAssertionError]:
      NamingConventionValidator.validate(
        strings = Seq(ExtractedString("a.scala", "FooBar", 1)),
        convention = Convention.KebabCase
      )
    assertEquals(ex.violations.length, 1)
    assertEquals(ex.violations.head.value, "FooBar")
    assertEquals(ex.violations.head.convention, Convention.KebabCase)

  test("respects exceptions"):
    NamingConventionValidator.validate(
      strings = Seq(
        ExtractedString("a.scala", "foo-bar", 1),
        ExtractedString("a.scala", "FooBar", 2),
      ),
      convention = Convention.KebabCase,
      exceptions = Set("FooBar")
    )

  test("collects all violations before throwing"):
    val ex = intercept[NamingConventionAssertionError]:
      NamingConventionValidator.validate(
        strings = Seq(
          ExtractedString("a.scala", "FooBar", 1),
          ExtractedString("a.scala", "valid", 2),
          ExtractedString("b.scala", "BazQux", 3),
        ),
        convention = Convention.SnakeCase
      )
    assertEquals(ex.violations.length, 2)
