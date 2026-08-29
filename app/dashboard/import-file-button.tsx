"use client";

import { useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ImportFileButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    // ----------------------------------------------------------
    // Validate file type
    // ----------------------------------------------------------

    const fileName = file.name.toLowerCase();

    const isTextFile = fileName.endsWith(".txt");
    const isMarkdownFile = fileName.endsWith(".md");

    if (!isTextFile && !isMarkdownFile) {
      setError(
        "Only .txt and .md files are supported."
      );

      event.target.value = "";
      return;
    }

    try {
      setImporting(true);

      // --------------------------------------------------------
      // Read file
      // --------------------------------------------------------

      const text = await file.text();

      if (!text.trim()) {
        setError("The selected file is empty.");
        return;
      }

      // --------------------------------------------------------
      // Supabase client
      // --------------------------------------------------------

      const supabase = createClient();

      // --------------------------------------------------------
      // Get logged-in user
      // --------------------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(
          "You must be logged in to import a file."
        );
        return;
      }

      // --------------------------------------------------------
      // Convert text into TipTap JSON
      // --------------------------------------------------------

      const content = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text,
              },
            ],
          },
        ],
      };

      // --------------------------------------------------------
      // Create document title
      // --------------------------------------------------------

      const title =
        file.name
          .replace(/\.(txt|md)$/i, "")
          .trim() || "Imported document";

      // --------------------------------------------------------
      // Insert document into Supabase
      // --------------------------------------------------------

      const {
        data,
        error: insertError,
      } = await supabase
        .from("documents")
        .insert({
          owner_id: user.id,
          title,
          content,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error(
          "Failed to import document:",
          insertError
        );

        setError(
          "Could not import the file. Please try again."
        );

        return;
      }

      // --------------------------------------------------------
      // Open imported document
      // --------------------------------------------------------

      router.push(`/documents/${data.id}`);
      router.refresh();

    } catch (err) {
      console.error(
        "File import error:",
        err
      );

      setError(
        "Something went wrong while importing the file."
      );

    } finally {
      setImporting(false);

      // Reset file input so the same file can be selected again
      event.target.value = "";
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,text/plain,text/markdown"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Import button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={importing}
        className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >

        {importing ? (
          <Loader2
            size={17}
            className="animate-spin"
          />
        ) : (
          <FileUp size={17} />
        )}

        {importing
          ? "Importing..."
          : "Import file"}

      </button>

      {/* Supported formats */}
      <p className="text-xs text-slate-500">
        .txt and .md
      </p>

      {/* Error */}
      {error && (
        <p className="max-w-xs text-right text-xs text-red-400">
          {error}
        </p>
      )}

    </div>
  );
}