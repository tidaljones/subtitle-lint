import { Cue } from './types'

const TIMESTAMP_RE =
  /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/

function timestampToMs(h: string, m: string, s: string, ms: string): number {
  return (
    parseInt(h, 10) * 3600000 +
    parseInt(m, 10) * 60000 +
    parseInt(s, 10) * 1000 +
    parseInt(ms, 10)
  )
}

/** formats milliseconds back into an SRT timestamp like "00:01:02,345" */
export function formatTimestamp(totalMs: number): string {
  const ms = Math.max(0, Math.round(totalMs))
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  const millis = ms % 1000
  const pad = (n: number, width: number) => String(n).padStart(width, '0')
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)},${pad(millis, 3)}`
}

/**
 * Parses an SRT file into a list of cues. Blocks without a valid timing line
 * are skipped rather than throwing, since real-world SRT files are often
 * hand-edited and slightly malformed.
 */
export function parseSrt(input: string): Cue[] {
  const normalized = input.replace(/^﻿/, '').replace(/\r\n?/g, '\n')
  const blocks = normalized
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)

  const cues: Cue[] = []

  for (const block of blocks) {
    const lines = block.split('\n')
    let lineIndex = 0
    let index = cues.length + 1

    if (/^\d+$/.test(lines[0].trim())) {
      index = parseInt(lines[0].trim(), 10)
      lineIndex = 1
    }

    const timingLine = lines[lineIndex]
    const match = timingLine ? timingLine.match(TIMESTAMP_RE) : null
    if (!match) {
      continue
    }

    const start = timestampToMs(match[1], match[2], match[3], match[4])
    const end = timestampToMs(match[5], match[6], match[7], match[8])
    const text = lines
      .slice(lineIndex + 1)
      .join('\n')
      .trim()

    cues.push({ index, start, end, text })
  }

  return cues
}
