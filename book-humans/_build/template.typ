// Typst template for "On Governing Minds That Don't Remember" book

#let book = [
  #set page(
    paper: "a4",
    margin: (x: 3cm, y: 2.5cm),
    numbering: "— 1 —",
    number-align: center,
  )

  #set document(
    title: "$title$",
    author: "$author$",
    keywords: ("LLM", "organon", "methodology", "best practices"),
  )

  #set text(
    font: "New Computer Modern",
    size: 11pt,
    lang: "en",
  )

  #set heading(numbering: "1.")

  // H1: Part headers (visual break)
  #show heading.where(level: 1): it => {
    set text(size: 24pt, weight: "bold", fill: rgb("#2e3440"))
    block(
      above: 2em,
      below: 1.5em,
      text(it.body)
    )
  }

  // H2: Chapter headers
  #show heading.where(level: 2): it => {
    set text(size: 16pt, weight: "bold", fill: rgb("#3b4252"))
    block(
      above: 1.5em,
      below: 0.8em,
      text(it.body)
    )
  }

  // H3: Section headers
  #show heading.where(level: 3): it => {
    set text(size: 12pt, weight: "bold", fill: rgb("#434c5e"))
    block(
      above: 1em,
      below: 0.5em,
      text(it.body)
    )
  }

  // Title page
  #block(
    above: 6em,
    below: 4em,
    text(size: 32pt, weight: "bold", align: center, "$title$")
  )

  #block(
    below: 3em,
    text(size: 16pt, align: center, "$subtitle$")
  )

  #v(3em)

  #block(
    below: 1em,
    text(size: 14pt, align: center, "by $author$")
  )

  #block(
    below: 3em,
    text(size: 12pt, align: center, "$date$")
  )

  // Page break before TOC
  #pagebreak()

  // Table of contents
  #outline(
    title: "Contents",
    depth: 2,
    indent: 1em,
  )

  #pagebreak()

  // Body content (Pandoc injects here)
  $body$
]

#book
