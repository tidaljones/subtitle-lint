# subtitle-lint

Subtitle files are plain text and easy to hand-edit, which means they
accumulate small mistakes that are hard to spot by eye: two cues that
overlap in time, a cue with no text left in it after a translation pass,
a line that flashes by faster than anyone can read. This library parses
SRT files and checks them for that class of problem.

It is a library, not a command line tool. The intent is that you wire
`lint()` into whatever you're already building - a pre-commit check, a CI
job, an upload pipeline for a video platform - and use `formatIssues()` to
render the result either for a person or for another program.

## Install

No published package yet. Copy `src/` into your project or add this repo
as a git dependency once it has a tag.

## Usage

```ts
import { parseSrt, lint, formatIssues } from 'subtitle-lint'

const srt = `1
00:00:01,000 --> 00:00:04,000
Hello there.

2
00:00:03,500 --> 00:00:05,000
This one overlaps the cue above.
`

const cues = parseSrt(srt)
const issues = lint(cues)

console.log(formatIssues(issues))
// [warning] cue 2: starts at 3500ms, before previous cue ends at 4000ms (overlap)
//
// 1 issue found (0 errors, 1 warning)

console.log(formatIssues(issues, { json: true }))
// {
//   "issueCount": 1,
//   "errorCount": 0,
//   "warningCount": 1,
//   "issues": [
//     {
//       "code": "overlap",
//       "severity": "warning",
//       "cueIndex": 2,
//       "message": "starts at 3500ms, before previous cue ends at 4000ms"
//     }
//   ]
// }
```

The `{ json: true }` option is the whole point of `formatIssues` existing
as a separate function from `lint`: the checks themselves are structured
data, and rendering is a separate, swappable step. A CLI wrapper around
this library gets its own `--json` flag almost for free by passing that
flag straight through.

## WebVTT

`parseVtt()` takes a `.vtt` file and returns the same `Cue[]` as
`parseSrt()`, so `lint()` and `formatIssues()` work on either format.
Header, `NOTE`, `STYLE` and `REGION` blocks are skipped. Cue settings
(`align:start`, `position:10%`) are dropped since `Cue` has no field for
them. Timestamps may omit the hours (`01:02.345`).

```ts
import { parseVtt, lint } from 'subtitle-lint'

const issues = lint(parseVtt(vttText))
```

## What gets checked

- `empty-text` - a cue with no visible text (error)
- `non-positive-duration` - a cue whose end time is not after its start time (error)
- `overlap` - a cue that starts before the previous one has finished (warning)
- `reading-speed` - a cue that requires reading faster than ~21 characters
  per second to finish in time (warning, threshold configurable via
  `lint(cues, { maxCharsPerSecond })`)

## Building

```
npm run build
```

compiles `src/` to `dist/` with the TypeScript compiler. There is no
runtime dependency to install - only `typescript` itself, as a dev
dependency, is needed to build.

## License

MIT, see LICENSE.
