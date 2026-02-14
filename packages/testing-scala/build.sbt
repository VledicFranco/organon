ThisBuild / version      := "0.5.0"
ThisBuild / scalaVersion := "3.3.4"
ThisBuild / organization := "io.github.vledicfranco"

// POM metadata for Maven Central publishing
ThisBuild / homepage := Some(url("https://github.com/VledicFranco/organon"))
ThisBuild / licenses := List("MIT" -> url("https://opensource.org/licenses/MIT"))
ThisBuild / developers := List(
  Developer("VledicFranco", "Franco Vledicka", "", url("https://github.com/VledicFranco"))
)
ThisBuild / scmInfo := Some(ScmInfo(
  url("https://github.com/VledicFranco/organon"),
  "scm:git@github.com:VledicFranco/organon.git"
))

lazy val root = (project in file("."))
  .settings(
    name := "organon-testing",
    libraryDependencies ++= Seq(
      "com.lihaoyi"   %% "os-lib"  % "0.11.4",
      "org.scalameta" %% "munit"   % "1.1.0" % "provided,test",
    ),
    testFrameworks += new TestFramework("munit.Framework"),
    // Coverage thresholds
    coverageMinimumStmtTotal := 95,
    coverageMinimumBranchTotal := 85,
    coverageFailOnMinimum := true,
  )
