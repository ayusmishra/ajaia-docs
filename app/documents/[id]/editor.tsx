"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Save,
  Share2,
  X,
  Check,
} from "lucide-react";

type EditorProps = {
  documentId: string;
  title: string;
  content: Record<string, unknown>;
};

export default function Editor({
  documentId,
  title: initialTitle,
  content,
}: EditorProps) {
  const supabase = createClient();

  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);

  const [showShare, setShowShare] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [shareError, setShareError] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content,
    immediatelyRender: false,
    onUpdate: () => {
      setSaved(false);
    },
  });

  useEffect(() => {
    if (!editor) return;

    editor.commands.setContent(content);
  }, [editor, content]);

  async function saveDocument() {
    if (!editor) return;

    setSaving(true);

    const { error } = await supabase
      .from("documents")
      .update({
        title: title.trim() || "Untitled document",
        content: editor.getJSON(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    if (error) {
      console.error("Failed to save document:", error);
      alert("Could not save the document.");
    } else {
      setSaved(true);
    }

    setSaving(false);
  }

  async function shareDocument() {
    setShareError("");
    setShareMessage("");

    const email = shareEmail.trim().toLowerCase();

    if (!email) {
      setShareError("Please enter an email address.");
      return;
    }

    setSharing(true);

    try {
      /*
       * Find the user from the profiles table.
       */
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", email)
        .single();

      if (profileError || !profile) {
        setShareError("No user found with that email address.");
        setSharing(false);
        return;
      }

      /*
       * Prevent sharing with yourself.
       */
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && profile.id === user.id) {
        setShareError("You cannot share a document with yourself.");
        setSharing(false);
        return;
      }

      /*
       * Check whether the document is already shared.
       */
      const { data: existingShare } = await supabase
        .from("document_shares")
        .select("document_id, user_id")
        .eq("document_id", documentId)
        .eq("user_id", profile.id)
        .maybeSingle();

      if (existingShare) {
        setShareError("This document is already shared with that user.");
        setSharing(false);
        return;
      }

      /*
       * Create the share.
       */
      const { error: shareError } = await supabase
        .from("document_shares")
        .insert({
          document_id: documentId,
          user_id: profile.id,
        });

      if (shareError) {
        console.error("Failed to share document:", shareError);
        setShareError("Could not share the document.");
      } else {
        setShareMessage(`Document shared with ${email}`);
        setShareEmail("");
      }
    } catch (error) {
      console.error(error);
      setShareError("Something went wrong while sharing.");
    }

    setSharing(false);
  }

  if (!editor) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <a
              href="/dashboard"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white font-bold text-slate-950"
            >
              A
            </a>

            <input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setSaved(false);
              }}
              onBlur={saveDocument}
              className="min-w-0 flex-1 bg-transparent px-2 py-1 text-lg font-semibold outline-none"
              placeholder="Untitled document"
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-xs text-slate-500 sm:inline">
              {saving ? "Saving..." : saved ? "Saved" : "Unsaved changes"}
            </span>

            <button
              onClick={saveDocument}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              onClick={() => {
                setShowShare(true);
                setShareMessage("");
                setShareError("");
              }}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-800"
            >
              <Share2 size={16} />
              Share
            </button>
          </div>
        </div>
      </header>

      {/* Share modal */}
      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Share document</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Give another user access to this document.
                </p>
              </div>

              <button
                onClick={() => setShowShare(false)}
                className="rounded-lg p-2 hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              User email
            </label>

            <input
              type="email"
              value={shareEmail}
              onChange={(event) => setShareEmail(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  shareDocument();
                }
              }}
              placeholder="user@example.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
            />

            {shareError && (
              <div className="mt-3 rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                {shareError}
              </div>
            )}

            {shareMessage && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-900 bg-green-950/40 px-3 py-2 text-sm text-green-300">
                <Check size={16} />
                {shareMessage}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowShare(false)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={shareDocument}
                disabled={sharing}
                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200 disabled:opacity-50"
              >
                <Share2 size={16} />
                {sharing ? "Sharing..." : "Share"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center gap-1 px-6 py-2">
          <button
            onClick={() =>
              editor.chain().focus().toggleBold().run()
            }
            className={`rounded p-2 hover:bg-slate-800 ${
              editor.isActive("bold") ? "bg-slate-700" : ""
            }`}
            title="Bold"
          >
            <Bold size={18} />
          </button>

          <button
            onClick={() =>
              editor.chain().focus().toggleItalic().run()
            }
            className={`rounded p-2 hover:bg-slate-800 ${
              editor.isActive("italic") ? "bg-slate-700" : ""
            }`}
            title="Italic"
          >
            <Italic size={18} />
          </button>

          <button
            onClick={() =>
              editor.chain().focus().toggleUnderline().run()
            }
            className={`rounded p-2 hover:bg-slate-800 ${
              editor.isActive("underline") ? "bg-slate-700" : ""
            }`}
            title="Underline"
          >
            <UnderlineIcon size={18} />
          </button>

          <div className="mx-2 h-6 w-px bg-slate-700" />

          <button
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({ level: 1 })
                .run()
            }
            className={`rounded px-3 py-2 text-sm font-bold hover:bg-slate-800 ${
              editor.isActive("heading", { level: 1 })
                ? "bg-slate-700"
                : ""
            }`}
            title="Heading 1"
          >
            H1
          </button>

          <button
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({ level: 2 })
                .run()
            }
            className={`rounded px-3 py-2 text-sm font-bold hover:bg-slate-800 ${
              editor.isActive("heading", { level: 2 })
                ? "bg-slate-700"
                : ""
            }`}
            title="Heading 2"
          >
            H2
          </button>

          <div className="mx-2 h-6 w-px bg-slate-700" />

          <button
            onClick={() =>
              editor.chain().focus().toggleBulletList().run()
            }
            className={`rounded p-2 hover:bg-slate-800 ${
              editor.isActive("bulletList") ? "bg-slate-700" : ""
            }`}
            title="Bullet list"
          >
            <List size={18} />
          </button>

          <button
            onClick={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
            className={`rounded p-2 hover:bg-slate-800 ${
              editor.isActive("orderedList") ? "bg-slate-700" : ""
            }`}
            title="Numbered list"
          >
            <ListOrdered size={18} />
          </button>

          <div className="mx-2 h-6 w-px bg-slate-700" />

          <button
            onClick={() =>
              editor.chain().focus().undo().run()
            }
            disabled={!editor.can().undo()}
            className="rounded p-2 hover:bg-slate-800 disabled:opacity-30"
            title="Undo"
          >
            <Undo2 size={18} />
          </button>

          <button
            onClick={() =>
              editor.chain().focus().redo().run()
            }
            disabled={!editor.can().redo()}
            className="rounded p-2 hover:bg-slate-800 disabled:opacity-30"
            title="Redo"
          >
            <Redo2 size={18} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="min-h-[700px] rounded-xl border border-slate-800 bg-white p-10 text-slate-900 shadow-xl">
          <EditorContent editor={editor} />
        </div>
      </main>
    </div>
  );
}