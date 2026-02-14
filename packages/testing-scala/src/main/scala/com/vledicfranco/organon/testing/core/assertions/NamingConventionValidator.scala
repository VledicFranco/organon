package com.vledicfranco.organon.testing.core.assertions

import com.vledicfranco.organon.testing.{Convention, NamingConventionAssertionError, NamingConventionViolation}
import com.vledicfranco.organon.testing.core.resolvers.ExtractedString

import scala.util.matching.Regex

/** Pure validator — no I/O. Checks strings against naming conventions.
  *
  * INV-TEST-1: assertion-logic-pure
  */
object NamingConventionValidator:

  /** Regex patterns for each convention. */
  private val ConventionPatterns: Map[Convention, Regex] = Map(
    Convention.KebabCase         -> "^[a-z][a-z0-9]*(-[a-z0-9]+)*$".r,
    Convention.CamelCase         -> "^[a-z][a-zA-Z0-9]*$".r,
    Convention.PascalCase        -> "^[A-Z][a-zA-Z0-9]*$".r,
    Convention.ScreamingSnakeCase -> "^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$".r,
    Convention.SnakeCase         -> "^[a-z][a-z0-9]*(_[a-z0-9]+)*$".r,
  )

  /** Check if a string matches a naming convention. */
  def matchesConvention(value: String, convention: Convention): Boolean =
    ConventionPatterns(convention).findFirstIn(value).isDefined

  /** Validate that all extracted strings match a naming convention.
    *
    * @throws NamingConventionAssertionError
    *   if any string violates the convention
    */
  def validate(
      strings: Seq[ExtractedString],
      convention: Convention,
      exceptions: Set[String] = Set.empty
  ): Unit =
    val violations = strings.collect {
      case entry if !exceptions.contains(entry.value) && !matchesConvention(entry.value, convention) =>
        NamingConventionViolation(
          file = entry.file,
          line = entry.line,
          value = entry.value,
          convention = convention
        )
    }

    if violations.nonEmpty then throw NamingConventionAssertionError(violations)
