package com.vledicfranco.organon.testing.core.resolvers

import com.vledicfranco.organon.testing.{FileError, FileSystem}

import java.nio.file.Path
import scala.concurrent.{ExecutionContext, Future}
import scala.util.matching.Regex

/** A string extracted from a file. */
case class ExtractedString(
    file: String,
    value: String,
    line: Int
)

/** Result of resolving strings from files. */
case class ResolvedStrings(
    strings: Seq[ExtractedString],
    filesRead: Seq[String],
    errors: Seq[FileError]
)

/** String resolver — generic string pattern extractor. */
object StringResolver:

  /** Extract strings matching a regex pattern from file contents (pure function, no I/O).
    *
    * The pattern must have at least one capturing group; the first capturing group is used as the extracted string.
    */
  def extractByPattern(file: String, content: String, pattern: Regex): Seq[ExtractedString] =
    val lines   = content.split("\n", -1)
    val results = Vector.newBuilder[ExtractedString]

    for (i <- lines.indices) do
      val lineText = lines(i)
      pattern.findFirstMatchIn(lineText).foreach { m =>
        if m.groupCount >= 1 then results += ExtractedString(file, m.group(1), i + 1)
      }

    results.result().toSeq

  /** Resolve strings from file contents using a regex pattern. */
  def resolveByPattern(
      files: Seq[String],
      pattern: Regex,
      fs: FileSystem,
      cwd: Option[Path] = None
  )(using ec: ExecutionContext): Future[ResolvedStrings] =
    GlobExpander.expand(files, fs, cwd).flatMap { gr =>
      var strings   = Vector.empty[ExtractedString]
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
              strings = strings ++ extractByPattern(filePath, result.content.getOrElse(""), pattern)

        ResolvedStrings(strings.toSeq, filesRead.toSeq, errors.toSeq)
      }
    }
