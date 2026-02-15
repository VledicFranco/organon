package io.github.vledicfranco.organon.testing

// ---------------------------------------------------------------------------
// Common types
// ---------------------------------------------------------------------------

/** Error encountered during file I/O in the resolver layer. */
case class FileError(file: String, message: String)

// ---------------------------------------------------------------------------
// Violation types (structured data for programmatic access)
// ---------------------------------------------------------------------------

case class MaxValueViolation(
    file: String,
    line: Int,
    lineText: String,
    actualValue: Double,
    maxValue: Double,
    unit: Option[String]
)

case class FileExistsViolation(file: String)

case class NoSideEffectsViolation(
    file: String,
    line: Int,
    lineText: String,
    module: String
)

case class NamingConventionViolation(
    file: String,
    line: Int,
    value: String,
    convention: Convention
)

case class ExportsPresentViolation(name: String, file: String)

// ---------------------------------------------------------------------------
// Naming conventions
// ---------------------------------------------------------------------------

enum Convention:
  case KebabCase, CamelCase, PascalCase, ScreamingSnakeCase, SnakeCase

// ---------------------------------------------------------------------------
// Resolver errors (I/O failures, empty inputs, no matches)
// ---------------------------------------------------------------------------

sealed trait ResolverError extends RuntimeException

case class MaxValueResolverError(errors: Seq[FileError])
    extends RuntimeException(
      s"assertMaxValue resolver errors:\n${errors.map(e => s"  ${e.file}: ${e.message}").mkString("\n")}"
    )
    with ResolverError

case class FileExistsResolverError(message0: String)
    extends RuntimeException(message0)
    with ResolverError

case class NoSideEffectsResolverError(errors: Seq[FileError])
    extends RuntimeException(
      s"assertNoSideEffects resolver errors:\n${errors.map(e => s"  ${e.file}: ${e.message}").mkString("\n")}"
    )
    with ResolverError

case class NamingConventionResolverError(errors: Seq[FileError])
    extends RuntimeException(
      s"assertNamingConvention resolver errors:\n${errors.map(e => s"  ${e.file}: ${e.message}").mkString("\n")}"
    )
    with ResolverError

case class ExportsPresentResolverError(message0: String)
    extends RuntimeException(message0)
    with ResolverError

// ---------------------------------------------------------------------------
// Assertion errors (logical violations after successful resolution)
// ---------------------------------------------------------------------------

sealed trait AssertionError extends RuntimeException:
  def violations: Seq[Any]

case class MaxValueAssertionError(violations: Seq[MaxValueViolation])
    extends RuntimeException({
      val details = violations
        .map { v =>
          val unitSuffix = v.unit.map(u => s" $u").getOrElse("")
          s"  ${v.file}:${v.line} — found ${v.actualValue}$unitSuffix, max allowed is ${v.maxValue}$unitSuffix\n    > ${v.lineText.trim}"
        }
        .mkString("\n")
      s"Max value assertion failed: ${violations.length} violation(s) found\n$details"
    })
    with AssertionError

case class FileExistsAssertionError(violations: Seq[FileExistsViolation])
    extends RuntimeException({
      val details = violations.map(v => s"  ${v.file}").mkString("\n")
      s"File exists assertion failed: ${violations.length} missing file(s)\n$details"
    })
    with AssertionError

case class NoSideEffectsAssertionError(violations: Seq[NoSideEffectsViolation])
    extends RuntimeException({
      val details = violations
        .map(v => s"  ${v.file}:${v.line} — imports forbidden module \"${v.module}\"\n    > ${v.lineText.trim}")
        .mkString("\n")
      s"No side effects assertion failed: ${violations.length} forbidden import(s) found\n$details"
    })
    with AssertionError

case class NamingConventionAssertionError(violations: Seq[NamingConventionViolation])
    extends RuntimeException({
      val details = violations
        .map { v =>
          val location = if v.line > 0 then s"${v.file}:${v.line}" else v.file
          s"  $location — \"${v.value}\" does not match ${v.convention}"
        }
        .mkString("\n")
      s"Naming convention assertion failed: ${violations.length} violation(s) found\n$details"
    })
    with AssertionError

case class ExportsPresentAssertionError(violations: Seq[ExportsPresentViolation])
    extends RuntimeException({
      val details = violations.map(v => s"  ${v.file} — missing export \"${v.name}\"").mkString("\n")
      s"Exports present assertion failed: ${violations.length} missing export(s)\n$details"
    })
    with AssertionError

// ---------------------------------------------------------------------------
// Custom assertion error
// ---------------------------------------------------------------------------

case class CustomAssertionError(label: String, originalCause: Throwable)
    extends RuntimeException(s"Custom assertion \"$label\" failed: ${originalCause.getMessage}", originalCause)

// ---------------------------------------------------------------------------
// Invariant test error
// ---------------------------------------------------------------------------

case class InvariantTestError(message0: String) extends RuntimeException(message0)
