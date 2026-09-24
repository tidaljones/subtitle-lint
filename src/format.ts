import { Issue } from './types'

export interface FormatOptions {
  json?: boolean
}

/**
 * Renders lint issues either as plain text for a terminal or as a JSON
 * string for a caller that wants to pipe results into another tool.
 * The library has no CLI of its own, but this is the piece a CLI wrapper
 * would call to implement its own --json flag.
 */
export function formatIssues(issues: Issue[], options: FormatOptions = {}): string {
  const errorCount = issues.filter((issue) => issue.severity === 'error').length
  const warningCount = issues.filter((issue) => issue.severity === 'warning').length

  if (options.json) {
    return JSON.stringify(
      {
        issueCount: issues.length,
        errorCount,
        warningCount,
        issues,
      },
      null,
      2,
    )
  }

  if (issues.length === 0) {
    return 'no issues found'
  }

  const lines = issues.map(
    (issue) => `[${issue.severity}] cue ${issue.cueIndex}: ${issue.message} (${issue.code})`,
  )
  lines.push('')
  lines.push(
    `${issues.length} issue${issues.length === 1 ? '' : 's'} found ` +
      `(${errorCount} error${errorCount === 1 ? '' : 's'}, ` +
      `${warningCount} warning${warningCount === 1 ? '' : 's'})`,
  )
  return lines.join('\n')
}
