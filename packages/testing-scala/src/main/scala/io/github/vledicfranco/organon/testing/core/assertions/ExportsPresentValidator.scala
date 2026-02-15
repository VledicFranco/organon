package io.github.vledicfranco.organon.testing.core.assertions

import io.github.vledicfranco.organon.testing.{ExportsPresentAssertionError, ExportsPresentViolation}

/** Pure validator — no I/O. Checks that expected exports are present.
  *
  * INV-TEST-1: assertion-logic-pure
  */
object ExportsPresentValidator:

  /** Validate that all expected export names are present in the found exports list.
    *
    * @throws ExportsPresentAssertionError
    *   if any expected export is missing
    */
  def validate(
      file: String,
      expectedExports: Seq[String],
      foundExports: Seq[String]
  ): Unit =
    val foundSet = foundExports.toSet
    val violations = expectedExports.collect {
      case name if !foundSet.contains(name) =>
        ExportsPresentViolation(name = name, file = file)
    }

    if violations.nonEmpty then throw ExportsPresentAssertionError(violations)
