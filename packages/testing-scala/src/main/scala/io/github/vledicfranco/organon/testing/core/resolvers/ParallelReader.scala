package io.github.vledicfranco.organon.testing.core.resolvers

import io.github.vledicfranco.organon.testing.FileSystem

import java.nio.file.Path
import scala.concurrent.{ExecutionContext, Future}

/** Result of reading a single file. */
case class FileReadResult(
    path: Path,
    content: Option[String],
    error: Option[String]
)

/** Parallel reader — batched file reading with concurrency control.
  *
  * Reads multiple files in parallel using Future.sequence with batching to avoid file descriptor exhaustion.
  */
object ParallelReader:

  val DefaultConcurrency: Int = 50

  /** Read multiple files in parallel with concurrency control.
    *
    * Files are processed in batches. Failures are captured per-file (no short-circuit).
    */
  def readFiles(
      paths: Seq[Path],
      fs: FileSystem,
      concurrency: Int = DefaultConcurrency
  )(using ec: ExecutionContext): Future[Seq[FileReadResult]] =
    val batches = paths.grouped(concurrency).toSeq

    batches
      .foldLeft(Future.successful(Vector.empty[FileReadResult])) { (accFut, batch) =>
        accFut.flatMap { acc =>
          val batchFutures = batch.map { path =>
            fs.readFile(path)
              .map(content => FileReadResult(path, Some(content), None))
              .recover { case ex: Throwable =>
                FileReadResult(path, None, Some(ex.getMessage))
              }
          }
          Future.sequence(batchFutures).map(results => acc ++ results)
        }
      }
      .map(_.toSeq)
