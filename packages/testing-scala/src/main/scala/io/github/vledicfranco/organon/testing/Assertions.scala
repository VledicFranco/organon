package io.github.vledicfranco.organon.testing

import io.github.vledicfranco.organon.testing.core.assertions.*
import io.github.vledicfranco.organon.testing.core.resolvers.*

import java.nio.file.Path
import scala.concurrent.{ExecutionContext, Future}
import scala.util.matching.Regex

// ---------------------------------------------------------------------------
// Options case classes
// ---------------------------------------------------------------------------

case class MaxValueOptions(
    files: Seq[String],
    pattern: Regex,
    maxValue: Double,
    unit: Option[String] = None,
    cwd: Option[Path] = None,
    requireMatches: Boolean = true
)

case class FileExistsOptions(
    files: Seq[String],
    cwd: Option[Path] = None
)

case class NoSideEffectsOptions(
    files: Seq[String],
    forbiddenModules: Seq[String],
    cwd: Option[Path] = None,
    requireMatches: Boolean = true
)

case class NamingConventionOptions(
    mode: NamingMode,
    files: Seq[String],
    convention: Convention,
    pattern: Option[Regex] = None,
    exceptions: Set[String] = Set.empty,
    cwd: Option[Path] = None
)

enum NamingMode:
  case Filenames, Identifiers

case class ExportsPresentOptions(
    file: String,
    expectedExports: Seq[String],
    cwd: Option[Path] = None
)

case class CustomAssertionOptions(
    label: String,
    validate: () => Future[Unit]
)

// ---------------------------------------------------------------------------
// High-level assertion functions (composition layer)
// ---------------------------------------------------------------------------

/** High-level assertions that compose resolvers + validators.
  *
  * Each function:
  *   1. Validates inputs (fail-fast)
  *   2. Resolves data via the resolver layer (I/O)
  *   3. Delegates to pure validators (no I/O)
  */
object Assertions:

  /** Assert that numeric values extracted from files do not exceed a maximum. */
  def assertMaxValue(options: MaxValueOptions)(using fs: FileSystem, ec: ExecutionContext): Future[Unit] =
    if options.files.isEmpty then
      Future.failed(
        MaxValueResolverError(Seq(FileError("(none)", "No file patterns provided. The files array must not be empty.")))
      )
    else
      ValueResolver.resolve(options.files, options.pattern, fs, options.cwd).map { resolved =>
        if resolved.errors.nonEmpty then throw MaxValueResolverError(resolved.errors)

        if options.requireMatches && resolved.values.isEmpty then
          val filesDetail =
            if resolved.filesRead.isEmpty then "No files matched the glob pattern(s)."
            else s"Searched ${resolved.filesRead.length} file(s) but pattern matched no lines."
          throw MaxValueResolverError(
            Seq(FileError(options.files.mkString(", "), s"No values extracted. $filesDetail Check your file globs and regex pattern."))
          )

        MaxValueValidator.validate(
          ValidateMaxValueOptions(
            values = resolved.values.map(v =>
              MaxValueEntry(v.file, v.line, v.lineText, v.value, v.rawValue)
            ),
            maxValue = options.maxValue,
            unit = options.unit
          )
        )
      }

  /** Assert that all specified files exist on the filesystem. */
  def assertFileExists(options: FileExistsOptions)(using fs: FileSystem, ec: ExecutionContext): Future[Unit] =
    if options.files.isEmpty then
      Future.failed(
        FileExistsResolverError("No file paths provided. The files array must not be empty.")
      )
    else
      val checks = options.files.map { file =>
        val fullPath = options.cwd.map(_.resolve(file)).getOrElse(Path.of(file))
        fs.exists(fullPath).map(exists => FileExistsEntry(file, exists))
      }
      Future.sequence(checks).map { entries =>
        FileExistsValidator.validate(entries)
      }

  /** Assert that files do not import any forbidden modules. */
  def assertNoSideEffects(options: NoSideEffectsOptions)(using fs: FileSystem, ec: ExecutionContext): Future[Unit] =
    if options.files.isEmpty then
      Future.failed(
        NoSideEffectsResolverError(
          Seq(FileError("(none)", "No file patterns provided. The files array must not be empty."))
        )
      )
    else if options.forbiddenModules.isEmpty then
      Future.failed(
        NoSideEffectsResolverError(
          Seq(FileError("(none)", "No forbidden modules provided. The forbiddenModules array must not be empty."))
        )
      )
    else
      ImportResolver.resolve(options.files, fs, options.cwd).map { resolved =>
        if resolved.errors.nonEmpty then throw NoSideEffectsResolverError(resolved.errors)

        if options.requireMatches && resolved.filesRead.isEmpty then
          throw NoSideEffectsResolverError(
            Seq(FileError(options.files.mkString(", "), "No files matched the glob pattern(s). Check your file globs."))
          )

        NoSideEffectsValidator.validate(resolved.imports, options.forbiddenModules)
      }

  /** Assert that names follow a specified naming convention. */
  def assertNamingConvention(
      options: NamingConventionOptions
  )(using fs: FileSystem, ec: ExecutionContext): Future[Unit] =
    if options.files.isEmpty then
      Future.failed(
        NamingConventionResolverError(
          Seq(FileError("(none)", "No file patterns provided. The files array must not be empty."))
        )
      )
    else if options.mode == NamingMode.Identifiers && options.pattern.isEmpty then
      Future.failed(
        NamingConventionResolverError(
          Seq(FileError("(none)", "The pattern option is required for identifiers mode."))
        )
      )
    else
      options.mode match
        case NamingMode.Filenames =>
          FileStemResolver.resolve(options.files, fs, options.cwd).map { resolved =>
            if resolved.errors.nonEmpty then throw NamingConventionResolverError(resolved.errors)
            if resolved.strings.isEmpty then
              throw NamingConventionResolverError(
                Seq(FileError(options.files.mkString(", "), "No files matched the glob pattern(s). Check your file globs."))
              )
            NamingConventionValidator.validate(resolved.strings, options.convention, options.exceptions)
          }
        case NamingMode.Identifiers =>
          StringResolver.resolveByPattern(options.files, options.pattern.get, fs, options.cwd).map { resolved =>
            if resolved.errors.nonEmpty then throw NamingConventionResolverError(resolved.errors)
            if resolved.filesRead.isEmpty then
              throw NamingConventionResolverError(
                Seq(FileError(options.files.mkString(", "), "No files matched the glob pattern(s). Check your file globs."))
              )
            NamingConventionValidator.validate(resolved.strings, options.convention, options.exceptions)
          }

  /** Assert that a file contains all expected exports. */
  def assertExportsPresent(
      options: ExportsPresentOptions
  )(using fs: FileSystem, ec: ExecutionContext): Future[Unit] =
    if options.expectedExports.isEmpty then
      Future.failed(
        ExportsPresentResolverError("No expected exports provided. The expectedExports array must not be empty.")
      )
    else
      val readPath = options.cwd.map(_.resolve(options.file)).getOrElse(Path.of(options.file))
      fs.readFile(readPath)
        .map { content =>
          val foundExports = extractExportNames(content)
          ExportsPresentValidator.validate(options.file, options.expectedExports, foundExports)
        }
        .recoverWith {
          case e: ExportsPresentAssertionError => Future.failed(e) // Re-throw assertion errors as-is
          case ex: Throwable =>
            Future.failed(
              ExportsPresentResolverError(s"Failed to read file \"${options.file}\": ${ex.getMessage}")
            )
        }

  /** Run a user-defined validation function with consistent error handling. */
  def assertCustom(options: CustomAssertionOptions)(using ec: ExecutionContext): Future[Unit] =
    options
      .validate()
      .recoverWith { case ex: Throwable =>
        val error = ex match
          case e: Exception => e
          case t            => new RuntimeException(t.getMessage, t)
        Future.failed(CustomAssertionError(options.label, error))
      }

  // ---------------------------------------------------------------------------
  // Export name extraction (Scala-specific patterns)
  // ---------------------------------------------------------------------------

  /** Optional Scala modifiers that can precede a definition keyword. */
  private val Mods = raw"""(?:(?:sealed|abstract|final|case|lazy|private|protected|override|inline|given|transparent|opaque|open|implicit)\s+)*"""

  /** Patterns to extract export/public definition names from Scala files. */
  private val ExportPatterns: Seq[scala.util.matching.Regex] = Seq(
    raw"""^\s*${Mods}def\s+(\w+)""".r,
    raw"""^\s*${Mods}val\s+(\w+)""".r,
    raw"""^\s*${Mods}var\s+(\w+)""".r,
    raw"""^\s*${Mods}class\s+(\w+)""".r,
    raw"""^\s*${Mods}trait\s+(\w+)""".r,
    raw"""^\s*${Mods}object\s+(\w+)""".r,
    raw"""^\s*${Mods}enum\s+(\w+)""".r,
    raw"""^\s*${Mods}type\s+(\w+)""".r,
    raw"""^\s*export\s+(\w+)""".r,
    // TS/JS patterns for cross-language compatibility
    raw"""export\s+(?:async\s+)?function\s+(\w+)""".r,
    raw"""export\s+class\s+(\w+)""".r,
    raw"""export\s+interface\s+(\w+)""".r,
    raw"""export\s+type\s+(\w+)""".r,
    raw"""export\s+(?:const|let|var)\s+(\w+)""".r,
    raw"""export\s+enum\s+(\w+)""".r,
  )

  private val ExportListPattern = raw"""export\s*\{([^}]+)\}""".r

  /** Scala 3 enum case members: `case Foo` or `case Foo, Bar, Baz` */
  private val EnumCasePattern = raw"""^\s*case\s+([A-Z]\w+(?:\s*,\s*[A-Z]\w+)*)""".r

  /** Extract all exported/public names from file content (pure function, no I/O). */
  def extractExportNames(content: String): Seq[String] =
    val names = Vector.newBuilder[String]
    val lines = content.split("\n", -1)

    for line <- lines do
      var found = false
      for pattern <- ExportPatterns if !found do
        pattern.findFirstMatchIn(line).foreach { m =>
          if m.groupCount >= 1 then
            names += m.group(1)
            found = true
        }

      ExportListPattern.findFirstMatchIn(line).foreach { m =>
        if m.groupCount >= 1 then
          val items = m.group(1).split(",")
          for item <- items do
            val trimmed = item.trim
            if trimmed.nonEmpty then
              // Handle "name as alias" — use original name
              val asMatch = raw"""^(\w+)\s+as\s+""".r.findFirstMatchIn(trimmed)
              val typeMatch = raw"""^type\s+(\w+)""".r.findFirstMatchIn(trimmed)
              if typeMatch.isDefined then names += typeMatch.get.group(1)
              else if asMatch.isDefined then names += asMatch.get.group(1)
              else
                val nameOnly = trimmed.split(raw"""\s""")(0)
                if nameOnly.nonEmpty then names += nameOnly
      }

      // Scala 3 enum case members (exclude match arms which contain =>)
      if !line.contains("=>") then
        EnumCasePattern.findFirstMatchIn(line).foreach { m =>
          val caseNames = m.group(1).split(",").map(_.trim).filter(_.nonEmpty)
          names ++= caseNames
        }

    names.result().toSeq
