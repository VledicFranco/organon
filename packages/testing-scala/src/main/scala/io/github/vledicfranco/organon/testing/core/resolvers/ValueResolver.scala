package io.github.vledicfranco.organon.testing.core.resolvers

import io.github.vledicfranco.organon.testing.{FileError, FileSystem}

import java.nio.file.Path
import scala.concurrent.{ExecutionContext, Future}
import scala.util.matching.Regex

/** A numeric value extracted from a file by pattern matching. */
case class ResolvedValue(
    file: String,
    line: Int,
    lineText: String,
    value: Double,
    rawValue: String
)

/** Result of resolving files and extracting numeric values. */
case class ResolvedValues(
    values: Seq[ResolvedValue],
    filesRead: Seq[String],
    errors: Seq[FileError]
)

/** Resolve files and extract numeric values matching a regex pattern. */
object ValueResolver:

  /** Resolve files and extract numeric values from regex captures.
    *
    * The pattern must have at least one capturing group for the numeric value. Non-numeric captures are reported as
    * errors rather than silently skipped.
    */
  def resolve(
      files: Seq[String],
      pattern: Regex,
      fs: FileSystem,
      cwd: Option[Path] = None
  )(using ec: ExecutionContext): Future[ResolvedValues] =
    val globResult = GlobExpander.expand(files, fs, cwd)

    globResult.flatMap { gr =>
      val readPaths = gr.paths.map { p =>
        cwd.map(_.resolve(p)).getOrElse(p)
      }

      ParallelReader.readFiles(readPaths, fs).map { readResults =>
        var values    = Vector.empty[ResolvedValue]
        var filesRead = Vector.empty[String]
        var errors    = gr.errors.toVector

        for (idx <- readResults.indices) do
          val result   = readResults(idx)
          val filePath = gr.paths(idx).toString

          result.error match
            case Some(err) =>
              errors = errors :+ FileError(filePath, s"Failed to read file: $err")
            case None =>
              filesRead = filesRead :+ filePath
              val content = result.content.getOrElse("")
              val lines   = content.split("\n", -1)

              for (i <- lines.indices) do
                val lineText = lines(i)
                pattern.findFirstMatchIn(lineText).foreach { m =>
                  if m.groupCount >= 1 then
                    val rawValue = m.group(1)
                    rawValue.toDoubleOption match
                      case Some(parsed) =>
                        values = values :+ ResolvedValue(filePath, i + 1, lineText, parsed, rawValue)
                      case None =>
                        errors = errors :+ FileError(filePath, s"Line ${i + 1}: Captured \"$rawValue\" is not a valid number")
                }

        ResolvedValues(values.toSeq, filesRead.toSeq, errors.toSeq)
      }
    }
