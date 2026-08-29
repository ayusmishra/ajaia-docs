# Ajaia Docs — Architecture

## Overview

Ajaia Docs is a lightweight collaborative document editor built as a focused product slice for the Ajaia AI-Native Full Stack Developer assignment.

The application supports authentication, document creation, rich-text editing, persistence, TXT file import, and document sharing.

## Technology Stack

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL
- TipTap
- Lucide React
- Vitest

## Application Architecture

The application uses the Next.js App Router.

### Frontend

React and Tailwind CSS provide the application interface.

The main surfaces are:

- Login
- Dashboard
- Document editor
- Share dialog
- File import workflow

TipTap provides the rich-text editing experience.

### Backend and Persistence

Supabase provides:

- Authentication
- PostgreSQL database
- Persistent document storage
- Document sharing records

The authenticated Supabase user ID is used to associate documents with their owner.

## Data Model

### profiles

Stores application user profile information.

Important fields:

- id
- email
- full_name

### documents

Stores editable documents.

Important fields:

- id
- owner_id
- title
- content
- created_at
- updated_at

The `content` field stores TipTap's JSON document structure so rich-text formatting survives page refreshes.

### document_shares

Stores document access granted to other users.

Important fields:

- document_id
- user_id
- permission

## Authentication

Supabase Auth identifies the current user.

Protected pages check for an authenticated user and redirect unauthenticated users to `/login`.

## Document Flow

1. User signs in.
2. Dashboard loads documents owned by the current user.
3. User creates a document.
4. User opens the document editor.
5. TipTap manages rich-text editing.
6. The document title and editor JSON are saved to Supabase.
7. The document can be reopened after refresh.

## File Import Flow

The current implementation supports TXT file import.

The uploaded text is converted into document content and persisted as a new editable document.

The supported file type is intentionally limited to keep the implementation focused within the assignment timebox.

## Sharing Flow

1. Document owner opens Share.
2. Owner enters another registered user's email.
3. The application resolves the user through the profiles table.
4. A document share record is created.
5. The shared document appears in the recipient's "Shared With Me" section.

## Validation and Error Handling

The application includes basic validation and error handling for:

- Authentication state
- Missing documents
- Database query failures
- Failed document saves
- Invalid sharing targets
- Unsupported file types

## Testing

Vitest is used for automated testing.

The current test suite validates document-related behavior including:

- Valid document structure
- Fallback behavior for empty document titles

Manual testing was also used for the primary end-to-end flows.

## Product Tradeoffs

The goal was to build a reliable core product slice rather than replicate Google Docs.

Prioritized:

- Document lifecycle
- Rich-text editing
- Persistence
- File import
- Sharing
- Usable dashboard

Deprioritized:

- Real-time multiplayer editing
- Comments
- Version history
- Advanced permissions
- Complex file formats

These features could be added later without changing the core document model.

## Future Improvements

With another 2–4 hours, the highest-value improvements would be:

1. Real-time collaboration indicators
2. More granular sharing permissions
3. Document version history
4. DOCX/Markdown import
5. Better automated integration tests
6. Improved deployment observability
