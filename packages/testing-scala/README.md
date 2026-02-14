# organon-testing (Scala 3)

Semantic testing framework for tier-4 invariant verification in Scala 3 projects. Part of the [Organon Methodology](https://github.com/VledicFranco/organon).

## Installation

Add to your `build.sbt`:

```scala
libraryDependencies += "io.github.vledicfranco" %% "organon-testing" % "0.5.0" % Test
```

## Quick Start

```scala
import com.vledicfranco.organon.testing.adapters.OrganonSuite
import com.vledicfranco.organon.testing.*

class CacheInvariantsSpec extends OrganonSuite:

  testInvariant("INV-CACHE-1", "TTL never exceeds 24 hours"):
    Assertions.assertMaxValue(MaxValueOptions(
      files = Seq("src/**/*.scala"),
      pattern = raw"ttl\s*=\s*(\d+)".r,
      maxValue = 86400,
      unit = Some("seconds")
    ))

  testInvariant("INV-CACHE-2", "No direct file system access in core"):
    Assertions.assertNoSideEffects(NoSideEffectsOptions(
      files = Seq("src/core/**/*.scala"),
      forbiddenModules = Seq("java.io", "java.nio.file.Files", "scala.io.Source")
    ))
```

## Assertions

| Assertion | Purpose |
|-----------|---------|
| `assertMaxValue` | Verify numeric values don't exceed a maximum |
| `assertFileExists` | Verify required files exist |
| `assertNoSideEffects` | Verify no forbidden imports are used |
| `assertNamingConvention` | Verify names match a convention (kebab-case, camelCase, etc.) |
| `assertExportsPresent` | Verify expected public definitions exist in a file |
| `assertCustom` | Run a custom validation function |

## API

All assertions use `using FileSystem` and `using ExecutionContext` context parameters. The `OrganonSuite` trait provides defaults (OsLib-backed real I/O, global ExecutionContext).

### assertMaxValue

```scala
Assertions.assertMaxValue(MaxValueOptions(
  files = Seq("src/**/*.scala"),
  pattern = raw"timeout\s*=\s*(\d+)".r,
  maxValue = 30000,
  unit = Some("milliseconds"),
  requireMatches = true  // default: fail if no values found
))
```

### assertNoSideEffects

```scala
Assertions.assertNoSideEffects(NoSideEffectsOptions(
  files = Seq("src/core/**/*.scala"),
  forbiddenModules = Seq("java.io", "scala.io.Source")
))
```

### assertFileExists

```scala
Assertions.assertFileExists(FileExistsOptions(
  files = Seq("src/main/resources/config.conf", "README.md")
))
```

### assertNamingConvention

```scala
// Check file names
Assertions.assertNamingConvention(NamingConventionOptions(
  mode = NamingMode.Filenames,
  files = Seq("src/**/*.scala"),
  convention = Convention.PascalCase
))

// Check identifiers in code
Assertions.assertNamingConvention(NamingConventionOptions(
  mode = NamingMode.Identifiers,
  files = Seq("src/**/*.scala"),
  convention = Convention.CamelCase,
  pattern = Some(raw"val\s+(\w+)".r)
))
```

### assertExportsPresent

```scala
Assertions.assertExportsPresent(ExportsPresentOptions(
  file = "src/main/scala/MyLib.scala",
  expectedExports = Seq("MyClass", "MyTrait", "myFunction")
))
```

### assertCustom

```scala
Assertions.assertCustom(CustomAssertionOptions(
  label = "Custom validation",
  validate = () => Future {
    // your custom validation logic
    if someCondition then throw new RuntimeException("Validation failed")
  }
))
```

## testInvariant

Links tests to invariant IDs for coverage tracking:

```scala
import com.vledicfranco.organon.testing.adapters.OrganonSuite

class MyInvariantsSpec extends OrganonSuite:
  testInvariant("INV-PROJ-1", "Config files stay under 200 lines"):
    Assertions.assertMaxValue(MaxValueOptions(
      files = Seq("src/**/config/*.scala"),
      pattern = raw"\n".r,
      maxValue = 200
    ))
```

## Comparison with TypeScript API

| Feature | TypeScript | Scala 3 |
|---------|-----------|---------|
| Package | `@organon-methodology/testing` | `io.github.vledicfranco:organon-testing_3` |
| Test framework | Vitest adapter | MUnit adapter |
| FileSystem | `fs?: FileSystem` option | `using FileSystem` context param |
| Async | `Promise<void>` | `Future[Unit]` |
| Options | Object literal | Case class |
| Import patterns | JS/TS imports + require | Scala imports + JS/TS imports |
| Export patterns | JS/TS exports | Scala defs/vals/classes/traits/objects/enums |

## License

MIT
