package com.vledicfranco.organon.testing

/** Metadata about a registered invariant test. */
case class InvariantTestMetadata(
    invariantId: String,
    description: String
)

/** Registry for tracking invariant test registrations.
  *
  * The registry is a simple container that tracks which invariant IDs have been registered. It supports:
  *   - Registering tests (invariant ID + description)
  *   - Querying registered tests (for coverage calculation)
  *   - Clearing (for test isolation)
  *
  * The registry does NOT affect test execution (INV-TEST-7: composable).
  */
trait InvariantTestRegistry:
  def register(metadata: InvariantTestMetadata): Unit
  def getAll: Seq[InvariantTestMetadata]
  def has(invariantId: String): Boolean
  def size: Int
  def coveredCount: Int
  def clear(): Unit

object InvariantTestRegistry:

  /** Create a new empty registry instance. */
  def apply(): InvariantTestRegistry = new InvariantTestRegistry:
    private val entries = scala.collection.mutable.ArrayBuffer.empty[InvariantTestMetadata]

    override def register(metadata: InvariantTestMetadata): Unit =
      entries += metadata.copy()

    override def getAll: Seq[InvariantTestMetadata] =
      entries.map(_.copy()).toSeq

    override def has(invariantId: String): Boolean =
      entries.exists(_.invariantId == invariantId)

    override def size: Int = entries.length

    override def coveredCount: Int =
      entries.map(_.invariantId).distinct.length

    override def clear(): Unit =
      entries.clear()
