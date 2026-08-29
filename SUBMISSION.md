# Ajaia Docs — Submission

## Included

This submission contains:

- Source code
- README.md
- ARCHITECTURE.md
- AI_WORKFLOW.md
- SUBMISSION.md
- Automated tests
- Supabase-backed persistence
- Rich-text document editor
- TXT file import
- Document sharing
- Authentication

## Core Features

### Document Creation

Users can create new documents from the dashboard.

### Document Editing

Documents support:

- Bold
- Italic
- Underline
- Headings
- Bullet lists
- Numbered lists
- Undo
- Redo

### Persistence

Documents are stored in Supabase and remain available after refresh.

### File Import

TXT files can be imported into the application as editable documents.

### Sharing

A document owner can share a document with another registered user.

Shared documents appear separately under "Shared With Me".

### Authentication

Users authenticate through Supabase Auth.

## Automated Testing

Vitest is included.

Run:

npm test

The current test suite passes successfully.

## Supported File Types

Currently supported:

- .txt

DOCX and other formats were intentionally not implemented within the timebox.

## Known Limitations

- No real-time simultaneous editing
- Basic sharing permissions
- TXT import only
- No version history
- No comments
- No advanced collaboration features

## What I Would Build Next

With another 2–4 hours I would prioritize:

1. Real-time collaboration indicators
2. Improved sharing permissions
3. Version history
4. Additional file import formats
5. More integration and end-to-end tests

## Live Product

[VERCEL LINK](https://ajaia-docs-two-psi.vercel.app/)

## Walkthrough Video

[VIDEO LINK](https://youtu.be/6m7cVXN1SW8)

## Test Account

Reviewer credentials should be provided separately or through the submission platform if required.

## Local Setup

See README.md for complete setup instructions.
