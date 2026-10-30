# Culture — for Srijita

A complete personal microbiology interview website, personalized from the supplied CV. It is a static site with no runtime dependencies, logins, API keys, analytics, or paid services.

## Deploy to Netlify

The production build is already in `dist/`. The ready-to-upload archive is `culture-netlify.zip`.

1. Extract `culture-netlify.zip` into a folder. Confirm `index.html` is directly inside it.
2. Sign in to [Netlify](https://app.netlify.com/). Use the manual deploy / drag-and-drop option and drop that extracted folder into the deploy area.
3. Open the resulting Netlify URL and share it with Srijita. Rename the Netlify project if you want a friendlier address.

For Git-based continuous deployment, connect [Ranger10sam/microbiology-interview-prep](https://github.com/Ranger10sam/microbiology-interview-prep) to Netlify and select the **master** production branch. Keep the base directory at the repository root. The included `netlify.toml` sets:

- Build command: `npm run build`
- Publish directory: `dist`
- Node: 22
- Environment variables: none

All navigation uses hash routes, so refreshes and deep links work without server-side routing. Security and no-index headers are included both in `netlify.toml` and the built `dist/_headers`, so manual uploads receive them too.

Generated `dist/` files are excluded from Git. Netlify creates them during each build. The downloadable ZIP files mentioned above are local delivery artifacts; for repository deployment, use the build settings above.

Netlify documentation: [create deploys](https://docs.netlify.com/deploy/create-deploys/) and [build configuration](https://docs.netlify.com/build/configure-builds/overview/).

## Included

- 84 questions: 74 technical answers plus 10 original HR coaching prompts; basic, intermediate, and advanced levels.
- 14-day guided plan and four role tracks: Pharma QC, Food & water, Research, and Clinical research.
- Search, combined filters, bookmarks, reviewed status, and print-friendly revision pages.
- Randomized five- or ten-question mocks, an optional timer, written drafts, self-assessment, and the last 30 completed sessions.
- Eight company guides: Sun Pharma, Dr. Reddy’s, Cipla, Biocon, Syngene, Eurofins, SGS, and IQVIA.
- Six attributed public accounts, with dates, geography, seniority, source links, and limitations. Company topics, paraphrased prompts, and author-written answers are explicitly distinguished. Companies without verified reports say so.
- 24 company-specific suggested practice answers, official role context, and private notes for her own interview experiences.
- Six CV-based project/internship stories, follow-ups, editable verified details, and 12 HR rehearsal answers.
- Local application tracker, interview-day checklist, backup import/export, and gentle hidden encouragements.
- 63 reference records, with primary guidance, textbooks, official employer pages, and community accounts separated.

## Run locally

Install Node.js 22 or later. No package installation is needed.

```sh
npm run dev
```

Open `http://localhost:4173`. Opening `index.html` directly as a local file will not work because the browser needs to fetch the JSON content over HTTP.

```sh
npm test
npm run build
npm run preview
```

`build` validates the content and copies only the production files into `dist/`. The CV PDF, screenshots, test backups, and development scripts are never included in the deployed site.

## Progress and privacy

Progress is stored in the visitor’s browser using localStorage. Each device/browser has its own data. Use the settings icon beside her name to export a JSON backup and import it on another device. Import replaces existing progress after confirmation. Completed mocks are included; an unfinished mock draft stays in its current browser and is excluded from backups. Imports clear any unfinished local mock.

No CV phone number, email, street address, or original CV file is shipped. The website does include her name, education, and professional background for personalization. A normal Netlify deployment is reachable by anyone with its URL; `noindex` discourages search indexing and does not create password protection. There is no cloud sync or automatic application submission.

## Content and research

Reviewed on **30 October 2026**. References are linked beside the technical answers and collected in the source library. The date is a research snapshot, not a claim of automatic updates. Technical content is for interview education, not a laboratory SOP. Applicable local requirements, current standards, approved methods, and site procedures govern actual work.

Company reports are anecdotal. The available accounts include overseas and experienced-role interviews; they do not establish what an Indian fresher will be asked. A search-index-only SGS account was deliberately excluded. Some external pages may later move, require sign-in, or disappear. Official job descriptions are skills context, not a live vacancy feed.

The preparation does not invent project results, industrial experience, salaries, success rates, hiring probabilities, or “most asked” rankings. Difficulty labels and the study plan are editorial. Personalized scripts must be checked against her actual project reports before use.

Edit the JSON files in `content/` to update material, then run `npm test` and `npm run build`. Keep source IDs stable and update the research date in `app.js` when conducting a new review. The build checks source references and schema consistency.

## Verification

`npm test` runs content integrity, source resolution, combined filtering, mock selection, backup normalization, and HTML/link safety checks.

The optional browser scripts use Playwright and require its Chromium runtime. With Playwright available locally, run:

```sh
node scripts/browser-check.mjs
node scripts/edge-check.mjs
```

Set `PLAYWRIGHT_MODULE` to an absolute installed Playwright package path if needed, and `TEST_URL` to test another local origin. Browser checks cover navigation, saved progress, full mock completion, notes, application CRUD, backup round trip, mobile layout, keyboard navigation, draft recovery, timer pausing, cancellation, and stale backup handling. They create screenshots in `output/playwright/` and never contact employers.

## The little surprises

For the person gifting the site: try the tiny star near the microscope, the quiet heart in the footer, and the heart beside the daily encouragement. Edit `journey.notes` in `content/journey.json` to make the words more personal. No relationship memories or personal signatures were invented.
