// Classification helpers for Codex thread/resume failures.
//
// Kept in a standalone module so tests can import them without pulling
// in the full runtimes.js dependency graph (opencode-ai SDK, etc.).
// runtimes.js re-imports and uses these in the controller.

export function detectCodexResumeFailure(error) {
  const message = String(error?.message || error || "");
  const noRollout = message.includes("no rollout found for thread id");
  // "AbsolutePathBuf deserialized without a base path" and the newer
  // "AbsolutePathBufGuard" variant both mean Codex app-server tried to
  // load this thread's on-disk rollout and a path field inside it was
  // rejected by the deserializer. Usually the stored cwd was captured
  // in a form Codex can no longer parse (backslash Windows path from
  // a pre-fix wrapper). Nothing we send matters because we haven't
  // sent anything yet — the error happens reading the rollout file.
  const corruptRollout =
    message.includes("AbsolutePathBuf deserialized") ||
    message.includes("AbsolutePathBufGuard");
  return {
    noRollout,
    corruptRollout,
    shouldHeal: noRollout || corruptRollout,
    healReason: corruptRollout ? "corrupt_rollout" : (noRollout ? "no_rollout" : null),
  };
}
