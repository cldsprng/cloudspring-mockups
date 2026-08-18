#!/usr/bin/env node
// Point git at the versioned hooks in this repo.
//
//   node tools/hooks/install.mjs
//
// Run once per clone. Hooks in .git/hooks are not versioned and do not travel
// with a clone, so the brand gate lives in tools/hooks/ and core.hooksPath
// makes git use it. Any agent or human working in a fresh clone must run this
// before their first push.
//
// Idempotent. Exits non-zero if the gate is not wired afterwards.

import { execFileSync } from 'node:child_process'
import { access, constants } from 'node:fs/promises'
import { join } from 'node:path'

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()

const root = git('rev-parse', '--show-toplevel')
git('config', 'core.hooksPath', 'tools/hooks')

// Git honours the executable bit from the index on POSIX. Make sure it is set
// there so a Linux/macOS clone gets a runnable hook too.
try {
  execFileSync('git', ['update-index', '--chmod=+x', 'tools/hooks/pre-push'], {
    cwd: root,
    stdio: 'ignore',
  })
} catch {
  // Not tracked yet (first install, before the commit) — the file mode in the
  // initial commit will carry it instead.
}

const hook = join(root, 'tools', 'hooks', 'pre-push')
try {
  await access(hook, constants.F_OK)
} catch {
  console.error(`FAIL: ${hook} is missing — the brand gate is not installed.`)
  process.exit(1)
}

const configured = git('config', '--get', 'core.hooksPath')
if (configured !== 'tools/hooks') {
  console.error(`FAIL: core.hooksPath is "${configured}", expected "tools/hooks".`)
  process.exit(1)
}

console.log('Brand gate installed. core.hooksPath = tools/hooks')
console.log('Every push now verifies the mockup folders it touches. There is no override.')
