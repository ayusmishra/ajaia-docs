import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogOut, FileText, Users } from "lucide-react";
import NewDocumentButton from "./new-document-button";
import ImportFileButton from "./import-file-button";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get currently logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in, redirect to login
  if (!user) {
    redirect("/login");
  }

  // ============================================================
  // MY DOCUMENTS
  // ============================================================

  const {
    data: documents,
    error: documentsError,
  } = await supabase
    .from("documents")
    .select("id, title, created_at, updated_at")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  if (documentsError) {
    console.error("Failed to load documents:", documentsError);
  }

  // ============================================================
  // SHARED WITH ME
  // ============================================================

  const {
    data: shares,
    error: sharesError,
  } = await supabase
    .from("document_shares")
    .select("document_id, permission")
    .eq("user_id", user.id);

  if (sharesError) {
    console.error("Failed to load document shares:", sharesError);
  }

  let sharedDocuments: {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
  }[] = [];

  if (shares && shares.length > 0) {
    const sharedDocumentIds = shares.map(
      (share) => share.document_id
    );

    const {
      data: sharedDocs,
      error: sharedDocsError,
    } = await supabase
      .from("documents")
      .select("id, title, created_at, updated_at")
      .in("id", sharedDocumentIds)
      .order("updated_at", { ascending: false });

    if (sharedDocsError) {
      console.error(
        "Failed to load shared documents:",
        sharedDocsError
      );
    } else {
      sharedDocuments = sharedDocs ?? [];
    }
  }

  // ============================================================
  // USER DISPLAY NAME
  // ============================================================

  const fullName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "User";

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* Logo / Brand */}
          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white font-bold text-slate-950">
              A
            </div>

            <div>
              <h1 className="font-semibold">
                Ajaia Docs
              </h1>

              <p className="text-xs text-slate-500">
                Collaborative workspace
              </p>
            </div>

          </div>

          {/* User + Logout */}
          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {fullName}
              </p>

              <p className="text-xs text-slate-500">
                {user.email}
              </p>
            </div>

            <form
              action="/auth/signout"
              method="post"
            >
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm transition hover:bg-slate-800"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </form>

          </div>

        </div>
      </header>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Welcome section */}
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h2 className="text-2xl font-semibold">
              Welcome, {fullName}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Create, edit, and collaborate on your documents.
            </p>
          </div>

          {/* Document actions */}
          <div className="flex flex-wrap items-center gap-3">
            <ImportFileButton />
            <NewDocumentButton />
          </div>

        </div>

        {/* ====================================================
            DOCUMENT SECTIONS
        ==================================================== */}

        <div className="grid gap-6 md:grid-cols-2">

          {/* ==================================================
              MY DOCUMENTS
          ================================================== */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            {/* Section heading */}
            <div className="mb-6 flex items-center gap-3">

              <div className="rounded-lg bg-slate-800 p-2">
                <FileText size={20} />
              </div>

              <div>
                <h3 className="font-semibold">
                  My Documents
                </h3>

                <p className="text-sm text-slate-500">
                  Documents you own
                </p>
              </div>

            </div>

            {/* Documents */}
            {documents && documents.length > 0 ? (

              <div className="space-y-3">

                {documents.map((document) => (

                  <a
                    key={document.id}
                    href={`/documents/${document.id}`}
                    className="block rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:border-slate-600 hover:bg-slate-900"
                  >

                    <p className="truncate font-medium text-white">
                      {document.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Updated{" "}
                      {new Date(
                        document.updated_at
                      ).toLocaleDateString()}
                    </p>

                  </a>

                ))}

              </div>

            ) : (

              <div className="rounded-xl border border-dashed border-slate-700 px-6 py-12 text-center">

                <FileText
                  size={32}
                  className="mx-auto mb-3 text-slate-600"
                />

                <p className="font-medium text-slate-300">
                  No documents yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Create your first document to get started.
                </p>

              </div>

            )}

          </section>

          {/* ==================================================
              SHARED WITH ME
          ================================================== */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            {/* Section heading */}
            <div className="mb-6 flex items-center gap-3">

              <div className="rounded-lg bg-slate-800 p-2">
                <Users size={20} />
              </div>

              <div>
                <h3 className="font-semibold">
                  Shared With Me
                </h3>

                <p className="text-sm text-slate-500">
                  Documents others shared with you
                </p>
              </div>

            </div>

            {/* Shared documents */}
            {sharedDocuments.length > 0 ? (

              <div className="space-y-3">

                {sharedDocuments.map((document) => (

                  <a
                    key={document.id}
                    href={`/documents/${document.id}`}
                    className="block rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:border-slate-600 hover:bg-slate-900"
                  >

                    <p className="truncate font-medium text-white">
                      {document.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Updated{" "}
                      {new Date(
                        document.updated_at
                      ).toLocaleDateString()}
                    </p>

                  </a>

                ))}

              </div>

            ) : (

              <div className="rounded-xl border border-dashed border-slate-700 px-6 py-12 text-center">

                <Users
                  size={32}
                  className="mx-auto mb-3 text-slate-600"
                />

                <p className="font-medium text-slate-300">
                  No shared documents
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Documents others share with you will appear here.
                </p>

              </div>

            )}

          </section>

        </div>

      </div>

    </main>
  );
}