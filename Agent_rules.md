# Project Rules for AI Coding Agent

> Paste this file's content (or attach it) at the start of every session/prompt.
> Goal: production-quality, human-reviewed-feeling code — not "vibe coded."

---

## 0. Stay in Scope — Only Touch What's Asked
- These rules are standards/guardrails for how you write code — they are NOT a to-do list to act on all at once.
- Only work on the specific feature/file/bug I mention in the task. Do not proactively "fix" other files, features, or issues you notice, even if they violate a rule below.
- If you notice an unrelated issue while working (e.g. another file also has mock data, or another screen has bad loading states), just **mention it briefly at the end of your summary** — don't fix it unless I explicitly ask.
- One task = one focused change. Wait for my next instruction before moving to the next feature.

## 1. No Mock / Placeholder Data — Ever, Unless Explicitly Asked
- Never create, generate, or insert mock/fake/placeholder data on your own initiative — not inline, not in a separate mock file, not "temporarily."
- If a feature needs real data but the backend/API isn't ready or reachable, **stop and ask me** what to do instead of silently faking data to make the UI look functional.
- The only exception: if I explicitly say "use mock data for this," then isolate it in a single clearly-named file (e.g. `mocks/lessons.mock.ts`), never inline inside UI components, and mark it with:
  ```
  // TODO(mock): replace with real API call — <ticket/reason>
  ```
- Before finishing a task, **grep for any mock/fake data or TODOs** and report them explicitly instead of silently shipping them.
- If content is dynamically generated (e.g. per-category/per-hobby), verify the correct parameter/key is actually being passed end-to-end — do not assume. Show me the request and response for at least 2 different inputs to prove it's not hardcoded/cached wrong.

## 2. Explicit State Handling (No Silent Bugs)
Every data-fetching component must handle these states **separately and visibly**:
- `loading`
- `error`
- `empty` (no data returned)
- `success`

Don't collapse these into one boolean. Use a consistent pattern (custom hook or wrapper component) across the whole app — don't reinvent it per screen.

## 3. Navigation 
- Any change to default route must be called out in the summary of changes — don't let it silently change.

## 4. No Hardcoded Styling / "Random Color" Problem
- All colors, spacing, and typography must come from a single design tokens/theme file (e.g. `constants/theme.ts` or `theme/colors.ts`).
- No inline hex codes or magic numbers in component files. If one is needed temporarily, flag it explicitly in your response.
- Before adding a new color, check if an existing token can be reused.

## 5. File & Folder Structure
- Static/constant data → `constants/` directory, split by domain (e.g. `constants/hobbies.ts`, `constants/lessons.ts`). Never inline large data blocks inside UI files.
- Each screen file should primarily compose smaller components, not contain large inline JSX blocks. If a screen file exceeds ~150 lines, split it into subcomponents and say so.
- Do not create empty files, stub files, or placeholder files "for later" unless I explicitly ask for scaffolding. If you do create a stub, list it clearly in your summary so it doesn't get forgotten.

## 6. No Dead / Unused Code
- no comments with third person perpective write it as u are the person and u are writing it.
- Before marking a task complete, check for and report:
  - Unused files
  - Unused imports/functions/variables
  - Empty files with no real implementation
- Do not leave "just in case" code. If something is unused, either wire it up or delete it — don't leave it silently in the repo.

## 7. Documentation
- Any time you add/change a feature that affects setup, run steps, env variables, or folder structure, update the README in the same task — don't treat docs as optional.
- README must always include: tech stack, setup/run steps, folder structure overview, and any required env vars.

## 8. Backend/Server Code Specific Rules
- No placeholder route handlers that return dummy success without real logic — if a route isn't implemented, say so explicitly rather than faking a 200 response.
- Keep one clear responsibility per file (controllers, routes, services, models separated) — don't mix DB logic directly into route handlers.
- Every new server file must be actually imported/used somewhere, or explicitly called out as unused.

## 9. Communication / Reporting Back
At the end of every task, agent must give me a short summary with:
1. **What changed** (files touched)
2. **What was intentionally left as TODO/mock**, and why
3. **Any new files created**, and whether they're fully wired up or just scaffolding
4. **Anything uncertain** that needs my review before considering it "done"

## 10. Before Claiming "Done"
Agent must self-check against this list before saying a task is complete:
- [ ] No mock/hardcoded data left unintentionally
- [ ] Loading/error/empty states handled
- [ ] No unused files/imports
- [ ] Colors/spacing use theme tokens, not inline values
- [ ] Static data lives in `constants/`, not inline in UI
- [ ] README updated if setup/structure changed
- [ ] Large components split appropriately

---

### How to use this file
Paste the whole file (or link it) at the start of a new agent conversation, then add your specific task below it, e.g.:

```
[paste rules above]

Task: <describe the specific feature/fix you're working on>
```