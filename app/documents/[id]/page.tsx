import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Editor from "./editor";

type DocumentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DocumentPage({
  params,
}: DocumentPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: document, error } = await supabase
    .from("documents")
    .select("id, title, content")
    .eq("id", id)
    .single();

  if (error || !document) {
    notFound();
  }

  return (
    <Editor
      documentId={document.id}
      title={document.title}
      content={document.content}
    />
  );
}