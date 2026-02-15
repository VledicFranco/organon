package io.github.vledicfranco.organon.testing.core.assertions

import io.github.vledicfranco.organon.testing.{NoSideEffectsAssertionError, NoSideEffectsViolation}
import io.github.vledicfranco.organon.testing.core.resolvers.ImportMatch

/** Pure validator — no I/O. Checks imports against a forbidden list.
  *
  * INV-TEST-1: assertion-logic-pure
  */
object NoSideEffectsValidator:

  /** Check whether a module specifier matches a forbidden module.
    *
    * For Scala imports (dot-separated), checks prefix match. For JS/TS imports, checks bare specifier, node:-prefixed,
    * and subpath matches.
    */
  def isForbidden(moduleSpecifier: String, forbiddenModules: Seq[String]): Boolean =
    forbiddenModules.exists { forbidden =>
      // Exact match
      moduleSpecifier == forbidden ||
      // node:-prefixed match (JS/TS)
      moduleSpecifier == s"node:$forbidden" ||
      // Subpath match (JS/TS: 'fs/promises' when 'fs' is forbidden)
      moduleSpecifier.startsWith(s"$forbidden/") ||
      moduleSpecifier.startsWith(s"node:$forbidden/") ||
      // Scala package prefix match (e.g., 'java.io.File' when 'java.io' is forbidden)
      moduleSpecifier.startsWith(s"$forbidden.")
    }

  /** Validate that no imports match the forbidden module list.
    *
    * @throws NoSideEffectsAssertionError
    *   if any forbidden import is found
    */
  def validate(imports: Seq[ImportMatch], forbiddenModules: Seq[String]): Unit =
    val violations = imports.collect {
      case imp if isForbidden(imp.module, forbiddenModules) =>
        NoSideEffectsViolation(
          file = imp.file,
          line = imp.line,
          lineText = imp.lineText,
          module = imp.module
        )
    }

    if violations.nonEmpty then throw NoSideEffectsAssertionError(violations)
