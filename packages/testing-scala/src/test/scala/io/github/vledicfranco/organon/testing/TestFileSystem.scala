package io.github.vledicfranco.organon.testing

import java.nio.file.Path
import scala.concurrent.{ExecutionContext, Future}

/** In-memory FileSystem for testing. Uses a Map[String, String] to simulate files. */
class TestFileSystem(files: Map[String, String] = Map.empty)(using ec: ExecutionContext) extends FileSystem:

  override def readFile(path: Path): Future[String] =
    val key = normalizePath(path.toString)
    files.get(key) match
      case Some(content) => Future.successful(content)
      case None          => Future.failed(new java.io.FileNotFoundException(s"File not found: $key"))

  override def glob(pattern: String, cwd: Option[Path] = None): Future[Seq[Path]] = Future {
    val base = cwd.map(_.toString).getOrElse("")
    files.keys.toSeq
      .filter { key =>
        val rel = if base.nonEmpty then
          val normalized = normalizePath(key)
          val normalizedBase = normalizePath(base)
          if normalized.startsWith(normalizedBase + "/") then normalized.drop(normalizedBase.length + 1)
          else normalized
        else normalizePath(key)
        globMatch(rel, normalizePath(pattern))
      }
      .map(Path.of(_))
  }

  override def exists(path: Path): Future[Boolean] = Future {
    val key = normalizePath(path.toString)
    files.contains(key)
  }

  private def normalizePath(p: String): String =
    p.replace("\\", "/")

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
        matchParts(pathParts, rest) ||
        (pathParts.nonEmpty && matchParts(pathParts.tail, patternParts))
      case (Seq(ph, pt*), Seq(gh, gt*)) =>
        matchSegment(ph, gh) && matchParts(pt, gt)

  private def matchSegment(name: String, pattern: String): Boolean =
    if pattern == "*" then true
    else if !pattern.contains("*") then name == pattern
    else
      val regex = ("^" + pattern.replace(".", "\\.").replace("*", "[^/]*") + "$").r
      regex.findFirstIn(name).isDefined
