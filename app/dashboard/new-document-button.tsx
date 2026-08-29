"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus } from "lucide-react";

export default function NewDocumentButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function createDocument() {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("documents")
        .insert({
          title: "Untitled document",
          content: {
            type: "doc",
            content: [
              {
                type: "paragraph",
              },
            ],
          },
          owner_id: user.id,
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      router.push(`/documents/${data.id}`);
    } catch (error) {
      console.error("Failed to create document:", error);
      alert("Could not create document. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={createDocument}
      disabled={loading}
      className="flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Plus size={18} />

      {loading ? "Creating..." : "New document"}
    </button>
  );
}