package io.github.vledicfranco.organon.testing.resolvers

import io.github.vledicfranco.organon.testing.*
import io.github.vledicfranco.organon.testing.core.resolvers.*

import java.nio.file.Path
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Await
import scala.concurrent.duration.*

class GlobExpanderSpec extends munit.FunSuite:

  test("isGlob returns true for glob patterns"):
    assert(GlobExpander.isGlob("src/**/*.scala"))
    assert(GlobExpander.isGlob("*.txt"))
    assert(GlobExpander.isGlob("file?.txt"))

  test("isGlob returns false for literal paths"):
    assert(!GlobExpander.isGlob("src/main.scala"))
    assert(!GlobExpander.isGlob("README.md"))

  test("literal paths are returned as-is"):
    given FileSystem = TestFileSystem()

    val result = Await.result(
      GlobExpander.expand(Seq("src/main.scala", "README.md"), summon[FileSystem]),
      5.seconds
    )

    assertEquals(result.paths.map(_.toString.replace("\\", "/")), Seq("src/main.scala", "README.md"))
    assert(result.errors.isEmpty)

  test("glob patterns expand to matching files"):
    given FileSystem = TestFileSystem(Map(
      "src/a.scala" -> "",
      "src/b.scala" -> "",
      "src/c.txt"   -> "",
    ))

    val result = Await.result(
      GlobExpander.expand(Seq("src/*.scala"), summon[FileSystem]),
      5.seconds
    )

    assertEquals(result.paths.length, 2)
    assert(result.errors.isEmpty)

  test("captures errors for failed glob expansion"):
    val failingFs = new FileSystem:
      def readFile(path: Path) = ???
      def glob(pattern: String, cwd: Option[Path]) = scala.concurrent.Future.failed(new RuntimeException("glob failed"))
      def exists(path: Path) = ???

    val result = Await.result(
      GlobExpander.expand(Seq("**/*.scala"), failingFs),
      5.seconds
    )

    assert(result.paths.isEmpty)
    assertEquals(result.errors.length, 1)
    assert(result.errors.head.message.contains("Failed to expand glob"))
