# AI Workflow

## AI Tools Used

- ChatGPT
- AI-assisted development during implementation

## How AI Helped

AI was used as a development accelerator for:

- Project planning
- Component structure
- Supabase query implementation
- TipTap editor integration
- UI implementation
- Debugging
- Test creation
- Documentation

## Where AI Materially Sped Up Development

The biggest productivity gains came from quickly generating implementation approaches for the document editor, Supabase persistence, sharing workflow, and UI states.

This allowed more time to be spent testing the actual product flows.

## Human Review and Decisions

AI-generated code was not treated as automatically correct.

I reviewed and adapted generated code to match:

- The existing project structure
- The actual Supabase schema
- The authentication model
- The application's UX
- The assignment requirements

Some generated approaches made assumptions about database fields and user records. These were changed after checking the actual database and running the application.

## Verification

Correctness was verified through:

- Running the Next.js application locally
- Creating documents
- Editing documents
- Renaming documents
- Saving and reopening documents
- Refreshing the application to verify persistence
- Importing a TXT file
- Testing document sharing
- Checking owned versus shared documents
- Running the Vitest test suite

## AI Judgment

The objective was to use AI to reduce implementation time while retaining engineering judgment.

AI was primarily used for acceleration, debugging, and exploration. Final implementation decisions were based on the application's actual behavior and the assignment's time constraints.
