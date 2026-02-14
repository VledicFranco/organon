package com.vledicfranco.organon.testing.core.resolvers

import com.vledicfranco.organon.testing.{FileError, FileSystem}

import java.nio.file.Path
import scala.concurrent.{ExecutionContext, Future}

/** File stem resolver — extracts filename stems (without extension) from paths. */
object FileStemResolver:

  /** Extract the stem (filename without extension) from a path string (pure function, no I/O). */
  def extractStem(file: String): String =
    val name     = Path.of(file).getFileName.toString
    val dotIndex = name.indexOf('.')
    if dotIndex > 0 then name.substring(0, dotIndex) else name

  /** Extract file stems from a list of file paths (pure function, no I/O). */
  def extractFileStems(files: Seq[String]): Seq[ExtractedString] =
    files.map(file => ExtractedString(file, extractStem(file), 0))

  /** Resolve file stems from files matching glob patterns. */
  def resolve(
      files: Seq[String],
      fs: FileSystem,
      cwd: Option[Path] = None
  )(using ec: ExecutionContext): Future[ResolvedStrings] =
    GlobExpander.expand(files, fs, cwd).map { gr =>
      val paths = gr.paths.map(_.toString)
      ResolvedStrings(
        extractFileStems(paths),
        paths,
        gr.errors
      )
    }
