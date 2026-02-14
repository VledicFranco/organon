package com.vledicfranco.organon.testing.core.assertions

import com.vledicfranco.organon.testing.{FileExistsAssertionError, FileExistsViolation}

/** A single file existence check result. */
case class FileExistsEntry(
    file: String,
    exists: Boolean
)

/** Pure validator — no I/O. Checks that all files exist.
  *
  * INV-TEST-1: assertion-logic-pure
  */
object FileExistsValidator:

  /** Validate that all checked files exist.
    *
    * @throws FileExistsAssertionError
    *   if any file does not exist
    */
  def validate(entries: Seq[FileExistsEntry]): Unit =
    val violations = entries.collect {
      case entry if !entry.exists => FileExistsViolation(entry.file)
    }

    if violations.nonEmpty then throw FileExistsAssertionError(violations)
