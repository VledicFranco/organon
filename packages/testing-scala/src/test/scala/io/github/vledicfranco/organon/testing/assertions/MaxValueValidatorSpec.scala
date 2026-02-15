package io.github.vledicfranco.organon.testing.assertions

import io.github.vledicfranco.organon.testing.*
import io.github.vledicfranco.organon.testing.core.assertions.*

class MaxValueValidatorSpec extends munit.FunSuite:

  test("passes when all values are within the limit"):
    MaxValueValidator.validate(
      ValidateMaxValueOptions(
        values = Seq(
          MaxValueEntry("a.scala", 1, "val x = 10", 10.0, "10"),
          MaxValueEntry("b.scala", 2, "val y = 20", 20.0, "20"),
        ),
        maxValue = 100.0
      )
    )

  test("passes when values equal the limit (inclusive)"):
    MaxValueValidator.validate(
      ValidateMaxValueOptions(
        values = Seq(MaxValueEntry("a.scala", 1, "val x = 100", 100.0, "100")),
        maxValue = 100.0
      )
    )

  test("passes with empty values list"):
    MaxValueValidator.validate(
      ValidateMaxValueOptions(values = Seq.empty, maxValue = 100.0)
    )

  test("throws when a value exceeds the limit"):
    val ex = intercept[MaxValueAssertionError]:
      MaxValueValidator.validate(
        ValidateMaxValueOptions(
          values = Seq(MaxValueEntry("a.scala", 5, "val ttl = 200", 200.0, "200")),
          maxValue = 100.0
        )
      )
    assertEquals(ex.violations.length, 1)
    assertEquals(ex.violations.head.actualValue, 200.0)
    assertEquals(ex.violations.head.maxValue, 100.0)

  test("collects all violations before throwing"):
    val ex = intercept[MaxValueAssertionError]:
      MaxValueValidator.validate(
        ValidateMaxValueOptions(
          values = Seq(
            MaxValueEntry("a.scala", 1, "val x = 150", 150.0, "150"),
            MaxValueEntry("a.scala", 2, "val y = 50", 50.0, "50"),
            MaxValueEntry("b.scala", 3, "val z = 200", 200.0, "200"),
          ),
          maxValue = 100.0
        )
      )
    assertEquals(ex.violations.length, 2)

  test("includes unit in violation when provided"):
    val ex = intercept[MaxValueAssertionError]:
      MaxValueValidator.validate(
        ValidateMaxValueOptions(
          values = Seq(MaxValueEntry("a.scala", 1, "val ttl = 200", 200.0, "200")),
          maxValue = 100.0,
          unit = Some("seconds")
        )
      )
    assertEquals(ex.violations.head.unit, Some("seconds"))
    assert(ex.getMessage.contains("seconds"))
