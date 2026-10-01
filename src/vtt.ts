import { Cue } from './types'

// Unlike SRT, the hours part is optional and the millisecond separator is a dot.
const TIMESTAMP_RE =
  /(?:(\d+):)?(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(?:(\d+):)?(\d{2}):(\d{2})\.(\d{3})/

const NON_CUE_BLOCK_RE = /^(WEBVTT|NOTE|STYLE|REGION)(\s|$)/

function timestampToMs(
  h: string | undefined,
  m: string,
  s: string,
  ms: string
): number {
  return (
    (h ? parseInt(h, 10) : 0) * 3600000 +
    parseInt(m, 10) * 60000 +
    parseInt(s, 10) * 1000 +
    parseInt(ms, 10)
  )
}

/**
 * Parses a WebVTT file into the same Cue shape that parseSrt produces, so the
 * lint rules work on either format. Header, NOTE, STYLE and REGION blocks are
 * dropped, as are cue settings after the timing ("align:start" and so on),
 * because Cue has nowhere to keep them. Cue identifiers are used as the index
 * only when they are plain numbers; otherwise the cue is numbered by position.
 * Blocks without a valid timing line are skipped, same as in parseSrt.
 */
export function parseVtt(input: string): Cue[] {
  const normalized = input.replace(/^﻿/, '').replace(/\r\n?/g, '\n')
  const blocks = normalized
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)

  const cues: Cue[] = []

  for (const block of blocks) {
    if (NON_CUE_BLOCK_RE.test(block)) {
      continue
    }

    const lines = block.split('\n')
    // the timing line is either the first line or follows a one-line identifier
    const timingIndex = TIMESTAMP_RE.test(lines[0]) ? 0 : 1
    const match = lines[timingIndex]
      ? lines[timingIndex].match(TIMESTAMP_RE)
      : null
    if (!match) {
      continue
    }

    let index = cues.length + 1
    if (timingIndex === 1 && /^\d+$/.test(lines[0].trim())) {
      index = parseInt(lines[0].trim(), 10)
    }

    const start = timestampToMs(match[1], match[2], match[3], match[4])
    const end = timestampToMs(match[5], match[6], match[7], match[8])
    const text = lines
      .slice(timingIndex + 1)
      .join('\n')
      .trim()

    cues.push({ index, start, end, text })
  }

  return cues
}
