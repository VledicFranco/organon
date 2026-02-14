package com.vledicfranco.organon.testing.resolvers

import com.vledicfranco.organon.testing.*
import com.vledicfranco.organon.testing.core.resolvers.*

import java.nio.file.Path
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Await
import scala.concurrent.duration.*

class ParallelReaderSpec extends munit.FunSuite:

  test("reads multiple files successfully"):
    given FileSystem = TestFileSystem(Map(
      "a.txt" -> "hello",
      "b.txt" -> "world",
    ))

    val result = Await.result(
      ParallelReader.readFiles(Seq(Path.of("a.txt"), Path.of("b.txt")), summon[FileSystem]),
      5.seconds
    )

    assertEquals(result.length, 2)
    assertEquals(result(0).content, Some("hello"))
    assertEquals(result(1).content, Some("world"))
    assert(result.forall(_.error.isEmpty))

  test("captures errors for missing files"):
    given FileSystem = TestFileSystem(Map("a.txt" -> "hello"))

    val result = Await.result(
      ParallelReader.readFiles(Seq(Path.of("a.txt"), Path.of("missing.txt")), summon[FileSystem]),
      5.seconds
    )

    assertEquals(result.length, 2)
    assertEquals(result(0).content, Some("hello"))
    assert(result(1).error.isDefined)
    assert(result(1).content.isEmpty)

  test("handles empty paths list"):
    given FileSystem = TestFileSystem()

    val result = Await.result(
      ParallelReader.readFiles(Seq.empty, summon[FileSystem]),
      5.seconds
    )

    assert(result.isEmpty)

  test("respects concurrency limit by batching"):
    val files = (1 to 10).map(i => s"file$i.txt" -> s"content $i").toMap
    given FileSystem = TestFileSystem(files)

    val paths = files.keys.map(Path.of(_)).toSeq
    val result = Await.result(
      ParallelReader.readFiles(paths, summon[FileSystem], concurrency = 3),
      5.seconds
    )

    assertEquals(result.length, 10)
    assert(result.forall(_.content.isDefined))
