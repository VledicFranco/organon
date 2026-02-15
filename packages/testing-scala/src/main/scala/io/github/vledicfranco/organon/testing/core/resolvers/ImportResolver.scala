package io.github.vledicfranco.organon.testing.core.resolvers

import io.github.vledicfranco.organon.testing.{FileError, FileSystem}

import java.nio.file.Path
import scala.concurrent.{ExecutionContext, Future}
import scala.util.matching.Regex

/** A single import match found in a file. */
case class ImportMatch(
    file: String,
    line: Int,
    lineText: String,
    module: String
)

/** Result of resolving imports across multiple files. */
case class ResolvedImports(
    imports: Seq[ImportMatch],
    filesRead: Seq[String],
    errors: Seq[FileError]
)

/** Import resolver — scans files for import statements.
  *
  * Supports both Scala and TypeScript/JavaScript import patterns.
  */
object ImportResolver:

  /** Patterns to match import statements. Captures the module/package specifier.
    *
    * Scala patterns:
    *   - import foo.bar.Baz
    *   - import foo.bar.{Baz, Qux}
    *   - import foo.bar.*
    *   - import foo.bar._
    *
    * TypeScript/JavaScript patterns:
    *   - import ... from 'module'
    *   - import 'module'
    *   - require('module')
    *   - import('module')
    */
  private val ImportPatterns: Seq[Regex] = Seq(
    // Scala: import foo.bar.Baz or import foo.bar.{...} or import foo.bar.* or import foo.bar._
    raw"""import\s+([\w.]+(?:\.\{[^}]+\}|\.\*|\._)?)""".r,
    // TS/JS: import ... from 'module'
    raw"""import\s+.*?\s+from\s+['"]([^'"]+)['"]""".r,
    // TS/JS: import 'module'
    raw"""import\s+['"]([^'"]+)['"]""".r,
    // TS/JS: require('module')
    raw"""require\(\s*['"]([^'"]+)['"]\s*\)""".r,
    // TS/JS: dynamic import('module')
    raw"""import\(\s*['"]([^'"]+)['"]\s*\)""".r,
  )

  /** Extract all import module specifiers from file content (pure function, no I/O). */
  def extractImports(file: String, content: String): Seq[ImportMatch] =
    val lines   = content.split("\n", -1)
    val matches = Vector.newBuilder[ImportMatch]

    for (i <- lines.indices) do
      val lineText = lines(i)
      var found    = false

      for (pattern <- ImportPatterns if !found) do
        pattern.findFirstMatchIn(lineText).foreach { m =>
          if m.groupCount >= 1 then
            matches += ImportMatch(file, i + 1, lineText, m.group(1))
            found = true
        }

    matches.result().toSeq

  /** Resolve imports from files matching glob patterns. */
  def resolve(
      files: Seq[String],
      fs: FileSystem,
      cwd: Option[Path] = None
  )(using ec: ExecutionContext): Future[ResolvedImports] =
    val globFuture = GlobExpander.expand(files, fs, cwd)

    globFuture.flatMap { gr =>
      var imports   = Vector.empty[ImportMatch]
      var filesRead = Vector.empty[String]
      var errors    = gr.errors.toVector

      val readPaths = gr.paths.map(p => cwd.map(_.resolve(p)).getOrElse(p))

      ParallelReader.readFiles(readPaths, fs).map { readResults =>
        for (idx <- readResults.indices) do
          val result   = readResults(idx)
          val filePath = gr.paths(idx).toString

          result.error match
            case Some(err) =>
              errors = errors :+ FileError(filePath, s"Failed to read file: $err")
            case None =>
              filesRead = filesRead :+ filePath
              imports = imports ++ extractImports(filePath, result.content.getOrElse(""))

        ResolvedImports(imports.toSeq, filesRead.toSeq, errors.toSeq)
      }
    }
