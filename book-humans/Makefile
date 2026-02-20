# Book build system — compiles Markdown chapters to PDF via Pandoc + Typst

.PHONY: build clean help

# Extract chapters from _book.yaml that exist as files
CHAPTERS := $(shell python3 -c "import yaml; data = yaml.safe_load(open('_book.yaml')); chapters = [c for c in data['chapters'] if __import__('pathlib').Path(c).exists()]; print(' '.join(chapters))")

OUTPUT_DIR := ../../tmp
PDF_FILE := $(OUTPUT_DIR)/YYYYMMDD-book-humans.pdf
TIMESTAMP := $(shell date +%Y%m%d)
PDF_OUTPUT := $(OUTPUT_DIR)/$(TIMESTAMP)-book-humans.pdf

help:
	@echo "Book build system for 'On Governing Minds That Don't Remember'"
	@echo ""
	@echo "Usage:"
	@echo "  make build    - Compile chapters to PDF in ../../tmp/"
	@echo "  make clean    - Remove built PDFs from ../../tmp/"
	@echo "  make help     - Show this help message"
	@echo ""
	@echo "Prerequisites:"
	@echo "  - pandoc >= 3.1.8"
	@echo "  - typst >= 0.11"
	@echo "  - python3 with PyYAML"

build: verify_tools $(CHAPTERS)
	@echo "Building book from chapters: $(CHAPTERS)"
	@mkdir -p $(OUTPUT_DIR)
	@pandoc \
		--pdf-engine=typst \
		--template=_build/template.typ \
		--metadata-file=_build/metadata.yaml \
		--toc \
		--toc-depth=2 \
		--number-sections \
		--shift-heading-level-by=-1 \
		$(CHAPTERS) \
		-o $(PDF_OUTPUT)
	@echo "✓ PDF built: $(PDF_OUTPUT)"

clean:
	@rm -f $(OUTPUT_DIR)/*-book-humans.pdf
	@echo "✓ Cleaned book PDFs from $(OUTPUT_DIR)"

verify_tools:
	@command -v pandoc >/dev/null || (echo "Error: pandoc not found. Install from https://pandoc.org"; exit 1)
	@command -v typst >/dev/null || (echo "Error: typst not found. Install from https://typst.app"; exit 1)
	@command -v python3 >/dev/null || (echo "Error: python3 not found"; exit 1)
	@python3 -c "import yaml" 2>/dev/null || (echo "Error: PyYAML not installed. Run: pip install pyyaml"; exit 1)
	@pandoc --version | grep -q "pandoc 3\.[1-9]" || echo "Warning: pandoc >= 3.1.8 recommended"
	@typst --version | grep -q "typst 0\.[1-9]" || echo "Warning: typst >= 0.11 recommended"
