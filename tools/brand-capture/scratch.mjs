// Where per-run pipeline scratch lives.
//
// This repo is public. Sweep inputs and outputs are step artifacts, not source:
// they belong on the Trello card and in the issue thread, and on disk they go to
// PAPERCLIP_RUN_SCRATCH_DIR. Writing them to the repo root is how four of them
// ended up tracked and published (CLO-95).
//
// Fallback is the current directory so the scripts stay usable interactively,
// outside a Paperclip run. The generated names are gitignored, so a fallback
// write does not put them back under version control.

import { join, isAbsolute } from 'node:path'
import { existsSync } from 'node:fs'

/** Directory for run scratch. Falls back to cwd for interactive use. */
export function scratchDir() {
  return (
    process.env.PAPERCLIP_RUN_SCRATCH_DIR || process.env.PAPERCLIP_SCRATCH_DIR || process.cwd()
  )
}

/** Absolute path to write a scratch file to. Absolute input is passed through. */
export function scratchPath(name) {
  return isAbsolute(name) ? name : join(scratchDir(), name)
}

/**
 * Absolute path to read a scratch file from: scratch dir first, then cwd.
 * Returns the scratch-dir path when neither exists, so the caller's error
 * message points at where the file is supposed to be.
 */
export function resolveScratchInput(name) {
  if (isAbsolute(name)) return name
  const preferred = join(scratchDir(), name)
  if (existsSync(preferred)) return preferred
  const local = join(process.cwd(), name)
  if (existsSync(local)) return local
  return preferred
}
