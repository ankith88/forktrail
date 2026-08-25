---
name: git-commit-and-push
description: >-
  Automates checking git status, verifying ignored sensitive files (such as .env.local),
  staging changes, generating conventional commit messages, committing, pushing to remote,
  and verifying execution success. Activate whenever the user asks to commit and push local changes to GitHub.
---

# Git Commit and Push Workflow

This skill defines the standardized step-by-step workflow for staging, committing, and pushing local repository changes to GitHub cleanly, safely, and predictably.

---

## Workflow Steps

### Step 1: Pre-Flight Security & Ignores Audit
Before staging any files, verify that sensitive credentials or secret files (e.g., `.env`, `.env.local`, API keys, certificates) are properly ignored:
1. Run `git status` to inspect all untracked and modified files.
2. Check that sensitive files like `.env.local` are covered by `.gitignore`:
   ```bash
   git check-ignore -v .env.local
   ```
3. If any sensitive file is unignored, exclude it from staging or add it to `.gitignore` first.

### Step 2: Context Analysis & Diff Inspection
Analyze the scope of changes across the repository:
1. Run `git diff --stat` to review changed lines and file modifications.
2. Categorize the primary changes using Conventional Commits types:
   - `feat`: New features, components, or API endpoints.
   - `fix`: Bug fixes, layout corrections, error handling adjustments.
   - `chore`: Configuration, package dependencies, asset additions, maintenance.
   - `refactor`: Restructuring code without changing functionality.
   - `docs`: Documentation updates.

### Step 3: Staging Changes
Stage all modified, deleted, and untracked non-sensitive files:
```bash
git add .
```
Verify staged files:
```bash
git status
```

### Step 4: Crafting & Executing Commit
1. Formulate a concise Conventional Commits subject line:
   - Format: `<type>: <summary of primary changes>`
   - Example: `feat: add Google Places API integration and dashboard modal`
2. Execute the commit:
   ```bash
   git commit -m "<type>: <summary of primary changes>"
   ```

### Step 5: Pushing to Remote Repository
Push the commit to the target branch (e.g., `main`):
```bash
git push origin main
```

### Step 6: Verification & Reporting
1. Run `git status` to verify the working tree is clean and up-to-date with `origin/main`.
2. Summarize the committed files, commit hash, branch, and remote repository URL for the user.
