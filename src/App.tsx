/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Ship, ClipboardCheck, LayoutGrid, Info, ShieldCheck, User } from "lucide-react";
import { EORDocument } from "./types";
import { INITIAL_EORS } from "./data";
import EORList from "./components/EORList";
import EORWizard from "./components/EORWizard";
import EORPrintPreview from "./components/EORPrintPreview";

export default function App() {
  const [documents, setDocuments] = useState<EORDocument[]>(() => {
    const saved = localStorage.getItem("eor_kontainer_docs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Gagal memuat EOR dari local storage, memuat data bawaan.", e);
      }
    }
    return INITIAL_EORS;
  });

  const [activeView, setActiveView] = useState<"list" | "create" | "edit">("list");
  const [editingDoc, setEditingDoc] = useState<EORDocument | undefined>(undefined);
  const [selectedDocForPrint, setSelectedDocForPrint] = useState<EORDocument | null>(null);

  // Sync to local storage for offline preservation
  useEffect(() => {
    localStorage.setItem("eor_kontainer_docs", JSON.stringify(documents));
  }, [documents]);

  const handleSaveDocument = (savedDoc: EORDocument) => {
    const exists = documents.some((doc) => doc.id === savedDoc.id);
    if (exists) {
      setDocuments(documents.map((doc) => (doc.id === savedDoc.id ? savedDoc : doc)));
    } else {
      setDocuments([savedDoc, ...documents]);
    }
    setActiveView("list");
    setEditingDoc(undefined);
  };

  const handleDeleteDocument = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus dokumen EOR ini dari sistem?")) {
      setDocuments(documents.filter((doc) => doc.id !== id));
    }
  };

  const handleEditDocument = (doc: EORDocument) => {
    setEditingDoc(doc);
    setActiveView("edit");
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col max-w-md mx-auto shadow-2xl relative border-x border-slate-200">
      
      {/* Mobile Top App Bar */}
      <header className="bg-slate-900 text-white px-4 py-4 shrink-0 flex items-center justify-between shadow-md sticky top-0 z-40 select-none">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Ship className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight uppercase">EOR Kontainer</h1>
            <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-ping"></span>
              DEPO TANJUNG PRIOK
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Field Inspector Badge */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-xl">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-200">YANTO</span>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 overflow-y-auto pb-10">
        
        {/* Welcome / Instruction Callout only on List Dashboard */}
        {activeView === "list" && (
          <div className="bg-white border border-slate-100 rounded-2xl p-4.5 mb-4 shadow-3xs flex items-start gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Redesign Portal EOR Mobile</h2>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                Versi mobile yang dioptimalkan untuk pengisian cepat di lapangan. Gunakan <span className="font-bold text-indigo-600">Asisten AI</span> atau <span className="font-bold text-indigo-600">Peta Visual</span> saat menambahkan item estimasi perbaikan.
              </p>
            </div>
          </div>
        )}

        {activeView === "list" ? (
          <EORList
            documents={documents}
            onSelectDocument={handleEditDocument}
            onPrintDocument={(doc) => setSelectedDocForPrint(doc)}
            onDeleteDocument={handleDeleteDocument}
            onUpdateDocument={handleSaveDocument}
            onCreateNew={() => {
              setEditingDoc(undefined);
              setActiveView("create");
            }}
          />
        ) : (
          <EORWizard
            onSave={handleSaveDocument}
            onCancel={() => {
              setActiveView("list");
              setEditingDoc(undefined);
            }}
            initialDocument={editingDoc}
          />
        )}
      </main>

      {/* Persistent Mobile Bottom Navigation (Safe Frame Disclaimer) */}
      <footer className="bg-white border-t border-slate-200 px-4 py-2 shrink-0 text-center select-none text-[9px] text-slate-400 font-semibold flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Sistem Taksiran Lapangan Depo Utama v3.2.1 • Offline-Ready</span>
      </footer>

      {/* Printable EOR Sheet Overlay */}
      {selectedDocForPrint && (
        <EORPrintPreview
          document={selectedDocForPrint}
          onClose={() => setSelectedDocForPrint(null)}
        />
      )}
    </div>
  );
}
