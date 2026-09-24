export interface Cue {
  /** the number printed above the timing line in the source file, not necessarily sequential */
  index: number
  /** start time in milliseconds */
  start: number
  /** end time in milliseconds */
  end: number
  text: string
}

export type Severity = 'error' | 'warning'

export interface Issue {
  code: string
  severity: Severity
  cueIndex: number
  message: string
}
