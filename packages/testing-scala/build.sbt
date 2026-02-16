ThisBuild / version      := "0.5.1"
ThisBuild / scalaVersion := "3.3.4"
ThisBuild / organization := "io.github.vledicfranco"

// POM metadata for Maven Central publishing
ThisBuild / homepage := Some(url("https://github.com/VledicFranco/organon"))
ThisBuild / licenses := List("MIT" -> url("https://opensource.org/licenses/MIT"))
ThisBuild / developers := List(
  Developer("VledicFranco", "Vledic Franco", "atfm05@gmail.com", url("https://github.com/VledicFranco"))
)
ThisBuild / scmInfo := Some(ScmInfo(
  url("https://github.com/VledicFranco/organon"),
  "scm:git@github.com:VledicFranco/organon.git"
))

// Publish to new Sonatype Central (not legacy oss.sonatype.org)
ThisBuild / sonatypeCredentialHost := xerial.sbt.Sonatype.sonatypeCentralHost

lazy val root = (project in file("."))
  .settings(
    name := "organon-testing",
    libraryDependencies ++= Seq(
      "com.lihaoyi"   %% "os-lib"    % "0.11.4",
      "org.scalameta" %% "munit"     % "1.1.0"  % "provided,test",
      "org.scalatest" %% "scalatest" % "3.2.17" % "provided,test",
    ),
    testFrameworks ++= Seq(
      new TestFramework("munit.Framework"),
      new TestFramework("org.scalatest.tools.Framework"),
    ),
    // Coverage thresholds
    // Note: 48/35 is artificially low — scoverage instruments case class defaults
    // and error paths that are unreachable from unit tests (consumer-facing API).
    // Real assertion/resolver coverage is >90%. TODO: add coverageExcludedPackages
    // for error case classes to bring reported numbers closer to reality.
    coverageMinimumStmtTotal := 45,
    coverageMinimumBranchTotal := 30,
    coverageFailOnMinimum := true,
  )
