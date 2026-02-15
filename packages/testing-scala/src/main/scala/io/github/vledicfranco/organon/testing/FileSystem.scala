package io.github.vledicfranco.organon.testing

import java.nio.file.Path
import scala.concurrent.{ExecutionContext, Future}

/** FileSystem abstraction for the testing package resolver layer.
  *
  * Mirrors the TypeScript FileSystem interface but is self-contained. The resolver layer uses this trait for all I/O;
  * assertion validators in core/assertions/ never import this module (INV-TEST-1).
  */
trait FileSystem:
  def readFile(path: Path): Future[String]
  def glob(pattern: String, cwd: Option[Path] = None): Future[Seq[Path]]
  def exists(path: Path): Future[Boolean]

/** Real FileSystem implementation backed by os-lib. */
class OsLibFileSystem()(using ec: ExecutionContext) extends FileSystem:

  override def readFile(path: Path): Future[String] = Future {
    os.read(os.Path(path.toAbsolutePath))
  }

  override def glob(pattern: String, cwd: Option[Path] = None): Future[Seq[Path]] = Future {
    val base = cwd.map(p => os.Path(p.toAbsolutePath)).getOrElse(os.pwd)
    // Split pattern into directory parts and filename glob
    val patternPath = os.RelPath(pattern.replace("\\", "/"))
    val segments    = patternPath.segments.toSeq

    if segments.isEmpty then Seq.empty
    else
      // Walk directory and filter by glob pattern
      val allFiles = os.walk(base).filter(os.isFile)
      allFiles
        .filter { f =>
          val rel = f.relativeTo(base).toString.replace("\\", "/")
          globMatch(rel, pattern.replace("\\", "/"))
        }
        .map(p => p.toNIO)
        .toSeq
  }

  override def exists(path: Path): Future[Boolean] = Future {
    os.exists(os.Path(path.toAbsolutePath))
  }

  /** Simple glob matching supporting * and ** patterns. */
  private def globMatch(path: String, pattern: String): Boolean =
    val patternParts = pattern.split("/").toSeq
    val pathParts    = path.split("/").toSeq
    matchParts(pathParts, patternParts)

  private def matchParts(pathParts: Seq[String], patternParts: Seq[String]): Boolean =
    (pathParts, patternParts) match
      case (Seq(), Seq())               => true
      case (Seq(), Seq("**", rest*))    => matchParts(Seq(), rest)
      case (Seq(), _)                   => false
      case (_, Seq())                   => false
      case (_, Seq("**", rest*))        =>
        // ** matches zero or more directories
        matchParts(pathParts, rest) ||
        (pathParts.nonEmpty && matchParts(pathParts.tail, patternParts))
      case (Seq(ph, pt*), Seq(gh, gt*)) =>
        matchSegment(ph, gh) && matchParts(pt, gt)

  private def matchSegment(name: String, pattern: String): Boolean =
    if pattern == "*" then true
    else if !pattern.contains("*") then name == pattern
    else
      // Convert glob to regex: escape dots, replace * with [^/]*
      val regex = ("^" + pattern.replace(".", "\\.").replace("*", "[^/]*") + "$").r
      regex.findFirstIn(name).isDefined
