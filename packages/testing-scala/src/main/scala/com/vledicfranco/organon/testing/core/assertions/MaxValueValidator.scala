package com.vledicfranco.organon.testing.core.assertions

import com.vledicfranco.organon.testing.{MaxValueAssertionError, MaxValueViolation}

/** Pre-resolved numeric value entry for validation. */
case class MaxValueEntry(
    file: String,
    line: Int,
    lineText: String,
    value: Double,
    rawValue: String
)

/** Options for the pure max-value assertion. */
case class ValidateMaxValueOptions(
    values: Seq[MaxValueEntry],
    maxValue: Double,
    unit: Option[String] = None
)

/** Pure validator — no I/O. Checks that all values do not exceed a maximum.
  *
  * INV-TEST-1: assertion-logic-pure
  */
object MaxValueValidator:

  /** Validate that all pre-resolved values do not exceed a maximum.
    *
    * Collects all violations before throwing for complete diagnostic output.
    *
    * @throws MaxValueAssertionError
    *   if any value exceeds maxValue
    */
  def validate(options: ValidateMaxValueOptions): Unit =
    val violations = options.values.collect {
      case entry if entry.value > options.maxValue =>
        MaxValueViolation(
          file = entry.file,
          line = entry.line,
          lineText = entry.lineText,
          actualValue = entry.value,
          maxValue = options.maxValue,
          unit = options.unit
        )
    }

    if violations.nonEmpty then throw MaxValueAssertionError(violations)
