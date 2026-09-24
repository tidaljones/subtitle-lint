import { Cue, Issue } from './types'

/** viewers start losing track around this many characters per second of screen time */
const DEFAULT_MAX_CHARS_PER_SECOND = 21

export interface LintOptions {
  maxCharsPerSecond?: number
}

export function lint(cues: Cue[], options: LintOptions = {}): Issue[] {
  const maxCps = options.maxCharsPerSecond ?? DEFAULT_MAX_CHARS_PER_SECOND
  const issues: Issue[] = []
  let previous: Cue | null = null

  for (const cue of cues) {
    if (cue.text.trim().length === 0) {
      issues.push({
        code: 'empty-text',
        severity: 'error',
        cueIndex: cue.index,
        message: 'cue has no text',
      })
    }

    if (cue.end <= cue.start) {
      issues.push({
        code: 'non-positive-duration',
        severity: 'error',
        cueIndex: cue.index,
        message: `end time (${cue.end}ms) is not after start time (${cue.start}ms)`,
      })
    }

    if (previous && cue.start < previous.end) {
      issues.push({
        code: 'overlap',
        severity: 'warning',
        cueIndex: cue.index,
        message: `starts at ${cue.start}ms, before previous cue ends at ${previous.end}ms`,
      })
    }

    const durationSeconds = (cue.end - cue.start) / 1000
    if (durationSeconds > 0) {
      const charCount = cue.text.replace(/\n/g, ' ').trim().length
      const cps = charCount / durationSeconds
      if (cps > maxCps) {
        issues.push({
          code: 'reading-speed',
          severity: 'warning',
          cueIndex: cue.index,
          message: `reading speed is ${cps.toFixed(1)} chars/sec, above the ${maxCps} threshold`,
        })
      }
    }

    previous = cue
  }

  return issues
}
