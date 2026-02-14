package com.vledicfranco.organon.testing.core.resolvers

import com.vledicfranco.organon.testing.{FileError, FileSystem}

import java.nio.file.Path
import scala.concurrent.{ExecutionContext, Future}

/** Result of expanding glob patterns to concrete file paths. */
case class GlobResult(
    paths: Seq[Path],
    errors: Seq[FileError]
)

/** Expands glob patterns to concrete file paths. Non-glob paths are returned as-is. */
object GlobExpander:

  /** Check whether a string contains glob metacharacters. */
  def isGlob(pattern: String): Boolean =
    pattern.contains("*") || pattern.contains("?")

  /** Expand a list of file patterns (globs and literal paths) to concrete paths. */
  def expand(
      patterns: Seq[String],
      fs: FileSystem,
      cwd: Option[Path] = None
  )(using ec: ExecutionContext): Future[GlobResult] =
    val futures = patterns.map { pattern =>
      if isGlob(pattern) then
        fs.glob(pattern, cwd)
          .map(paths => GlobResult(paths, Seq.empty))
          .recover { case ex: Throwable =>
            GlobResult(
              Seq.empty,
              Seq(FileError(pattern, s"Failed to expand glob: ${ex.getMessage}"))
            )
          }
      else Future.successful(GlobResult(Seq(Path.of(pattern)), Seq.empty))
    }

    Future.sequence(futures).map { results =>
      GlobResult(
        results.flatMap(_.paths),
        results.flatMap(_.errors)
      )
    }
