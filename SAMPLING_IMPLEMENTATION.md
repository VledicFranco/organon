# MCP Sampling Integration — Implementation Summary

## Overview

Implemented **MCP Sampling** capability for the Organon MCP server, enabling the server to request LLM completions for intelligent analysis of verification issues.

## What is Sampling?

MCP Sampling is a bidirectional protocol feature where:
- **Server** sends a `sampling/createMessage` request to the **Client**
- **Client** maintains control (user approval gates, model selection)
- **LLM** analyzes the issue and returns insights
- **Server** receives analysis and includes it in tool output

**Key benefit:** The server can leverage LLM intelligence without API keys, while the client retains security control.

See [MCP Sampling Spec](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling) for details.

---

## Files Changed

### New Files

**`packages/tools/src/mcp/sampling.ts`**
- Core sampling utility module
- `analyzeVerificationIssues(server, issues)` — requests LLM analysis of verification failures
- Formats verification errors into structured prompt
- Handles graceful degradation if sampling unavailable

**`packages/tools/src/mcp/sampling.test.ts`**
- Unit tests for sampling module
- Validates prompt formatting
- Tests error handling and model preferences
- All 4 tests passing ✓

### Modified Files

**`packages/tools/src/mcp/tools.ts`**
- Added import of `analyzeVerificationIssues`
- Modified `organon_verify` tool:
  - New param: `analyze: boolean` — enables LLM analysis
  - When `analyze=true` and errors exist:
    - Calls `analyzeVerificationIssues(server, ...)`
    - Appends LLM analysis to response content blocks
  - Returns multiple content blocks: verification results + analysis

**`packages/tools/src/mcp/server.ts`**
- No changes needed (sampling supported by default in McpServer)

---

## How It Works

### 1. User calls verify with analyze flag

```bash
organon_verify --analyze
```

### 2. Tool execution flow

```
organon_verify(analyze=true)
  → run all gates (frontmatter, triplets, etc.)
  → if errors found AND analyze=true:
    → analyzeVerificationIssues(server, {errors, warnings, failedGates})
      → format errors into prompt
      → call sampling/createMessage to LLM
      → return analysis
  → return {verification_results + lLM_analysis}
```

### 3. MCP Protocol sequence

```
Client                           Server                      LLM
  │                                │                          │
  ├─ tools/call(verify)           │                          │
  │  (analyze=true)                │                          │
  │─────────────────────────────►  │                          │
  │                                ├─ run verification gates   │
  │                                ├─ find errors             │
  │                                │                          │
  │                                ├─ sampling/createMessage  │
  │                                │─────────────────────────►│
  │                                │ [user approval]          │
  │                                │◄─ LLM response           │
  │                                │                          │
  │◄─ tool response + analysis ─   │
  │   content blocks               │
```

---

## Usage Examples

### Via MCP (Claude Code, cursor, etc.)

```json
{
  "method": "tools/call",
  "params": {
    "name": "organon_verify",
    "arguments": {
      "analyze": true
    }
  }
}
```

Response includes:
```json
{
  "content": [
    {
      "type": "text",
      "text": "{JSON result of verify gates}"
    },
    {
      "type": "text",
      "text": "## LLM Analysis\n\nRoot cause: Missing invariant coverage..."
    }
  ]
}
```

### Via CLI (future enhancement)

```bash
organon verify --analyze
```

---

## Current State

### ✅ Implemented

- [x] Sampling utility module with error formatting
- [x] Integration into `organon_verify` tool
- [x] Model preference hints (claude, intelligencePriority=0.8)
- [x] Error limiting (first 5 errors, first 3 warnings to avoid token bloat)
- [x] Graceful degradation (falls back if sampling unavailable)
- [x] Unit tests (4/4 passing)
- [x] Prompt templating (structured, actionable)

### 🔄 Ready for Testing

- Sampling works with any MCP client that supports the sampling capability
- Requires client to implement human-in-the-loop approval (security best practice)
- Can be tested with:
  - Claude Code (when connected via MCP)
  - Cursor Editor
  - Any custom MCP client with sampling support

### ⚠️ Limitations

- Only available when client declares `sampling` capability
- Requires human approval (client-side enforcement)
- Depends on LLM availability and rate limits
- Token budget: max 500 tokens per analysis

---

## Test Results

### Unit Tests
```
✓ src/mcp/sampling.test.ts (4 tests)
  ✓ should format verification issues into a structured prompt
  ✓ should handle sampling errors gracefully
  ✓ should include model preferences in sampling request
  ✓ should limit error and warning display to avoid token bloat
```

### Integration Verification

Current project state (real errors found):
- **Frontmatter gate:** 13 errors (missing fields, count mismatches)
- **Workflow quality:** 8 errors + 8 warnings
- **References:** 1 error (broken inheritance)

These would be analyzed by LLM when calling `organon_verify --analyze`.

---

## Next Steps

1. **Test with Claude Code MCP client**
   - Connect organon MCP server via `organon mcp`
   - Call `organon_verify` with `analyze=true`
   - Observe LLM analysis in response

2. **Extend to other tools** (if sampling proves valuable)
   - `organon_suggest_tools` — LLM ranks automation opportunities
   - `organon_health` — LLM analyzes coverage gaps
   - Custom diagnostic workflows

3. **Improve prompt quality**
   - Add schema hints (ETHOS, PHILOSOPHY, PROTOCOL structure)
   - Include file relationships for context
   - Ask for specific remediation steps

---

## Technical Notes

### Why Sampling Instead of Direct LLM Calls?

✅ **Sampling (via MCP):**
- Client controls model selection
- Client implements approval gates
- No server-side API keys needed
- Works with any LLM provider

❌ **Direct API calls:**
- Server needs API keys (security risk)
- Can't follow client's model preferences
- Harder to audit/control
- Breaks offline use cases

### Implementation Details

**Prompt structure:**
```
# Organon Verification Analysis

[Issue summary]
[Failed gates]
[Error list - limited to first 5]
[Warning list - limited to first 3]

## Task
1. Most likely root cause?
2. Which gates to fix first?
3. Quick diagnosis steps?
4. Risk of cascade failures?

Be concise and actionable.
```

**Model preferences:**
- hints: ["claude"] (flexible matching)
- intelligencePriority: 0.8 (good analysis needed)
- speedPriority: 0.3 (not time-critical)
- maxTokens: 500 (sufficient for analysis)

---

## References

- [MCP Sampling Specification](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling)
- [MCP GitHub](https://github.com/modelcontextprotocol/modelcontextprotocol)
- Implementation: `packages/tools/src/mcp/sampling.ts`
- Tests: `packages/tools/src/mcp/sampling.test.ts`
- Integration: `packages/tools/src/mcp/tools.ts` (organon_verify tool)
