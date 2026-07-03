import React, { useState } from "react";
import { Search, Plus, Eye, Printer, Trash2, ShieldCheck, Clock, CheckCircle2, AlertTriangle, Truck, Coins, DollarSign, CreditCard } from "lucide-react";
import { EORDocument } from "../types";

interface EORListProps {
  documents: EORDocument[];
  onSelectDocument: (doc: EORDocument) => void;
  onPrintDocument: (doc: EORDocument) => void;
  onDeleteDocument: (id: string) => void;
  onUpdateDocument?: (doc: EORDocument) => void;
  onCreateNew: () => void;
}

export default function EORList({
  documents,
  onSelectDocument,
  onPrintDocument,
  onDeleteDocument,
  onUpdateDocument,
  onCreateNew,
}: EORListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.noEor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.containerNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.noBl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.vesselName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.principal.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || doc.mnrStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: EORDocument["mnrStatus"]) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            APPROVED
          </span>
        );
      case "WAITING APPROVED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full animate-pulse">
            <Clock className="w-3 h-3 text-amber-600" />
            WAITING APPROVAL
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            REJECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3 h-3 text-slate-500" />
            DRAFT
          </span>
        );
    }
  };



  return (
    <div className="space-y-4" id="eor-list-dashboard">
      {/* Quick Summary Widgets */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total EOR</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-slate-800">{documents.length}</span>
            <span className="text-[9px] text-slate-400 font-medium">Berkas</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Menunggu</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-amber-700">
              {documents.filter((d) => d.mnrStatus === "WAITING APPROVED").length}
            </span>
            <span className="text-[9px] text-amber-500 font-medium">Persetujuan</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Disetujui</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-emerald-700">
              {documents.filter((d) => d.mnrStatus === "APPROVED").length}
            </span>
            <span className="text-[9px] text-emerald-500 font-medium">Selesai</span>
          </div>
        </div>
      </div>



      {/* Control Bar */}
      <div className="flex flex-col gap-2.5 bg-white border border-slate-100 p-3.5 rounded-2xl shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari EOR, No. Kontainer, Kapal, BL..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Filters Group */}
        <div className="space-y-2.5 pt-1.5 border-t border-slate-100">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider w-12 shrink-0">M&R:</span>
            <div className="flex bg-slate-50 p-0.5 rounded-lg text-[10px] overflow-x-auto gap-0.5 w-full">
              {["ALL", "DRAFT", "WAITING APPROVED", "APPROVED"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`flex-1 px-2 py-1 rounded-md font-bold whitespace-nowrap transition-all ${
                    statusFilter === status
                      ? "bg-white text-slate-800 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {status === "ALL"
                    ? "Semua"
                    : status === "WAITING APPROVED"
                    ? "Menunggu"
                    : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onCreateNew}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat EOR Baru</span>
          </button>
        </div>
      </div>

      {/* EOR List Grid */}
      <div className="space-y-3">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start gap-2 border-b border-slate-50 pb-3 mb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-extrabold text-slate-800">
                      {doc.containerNo}
                    </span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded font-bold font-mono">
                      {doc.sizeType.split(" ")[0]}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {doc.principal.length > 30 ? doc.principal.substring(0, 30) + "..." : doc.principal}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {getStatusBadge(doc.mnrStatus)}
                </div>
              </div>

              {/* Card Body */}
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs mb-3.5">
                <div>
                  <span className="text-slate-400 block font-medium">No. EOR:</span>
                  <span className="font-mono font-medium text-slate-700 truncate block">{doc.noEor}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">No. BL:</span>
                  <span className="font-mono font-medium text-slate-700 truncate block">{doc.noBl}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Kapal (Vessel):</span>
                  <span className="font-medium text-slate-700 truncate block">{doc.vesselName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Tanggal Survey:</span>
                  <span className="font-medium text-slate-700 block">{doc.dateOfSurvey}</span>
                </div>
              </div>

              {/* Item and Cost details */}
              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-2.5 mb-4 border border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium">
                  {doc.items.length} Item kerusakan terdaftar
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800">
                    USD ${doc.totalCost.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold font-mono">
                    ≈ Rp {(doc.totalCost * doc.exchangeRate).toLocaleString("id-ID")}
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex justify-between items-center gap-2">
                <button
                  type="button"
                  onClick={() => onDeleteDocument(doc.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Hapus EOR"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectDocument(doc)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detail</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onPrintDocument(doc)}
                    className="flex items-center gap-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-xl transition-all shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak EOR</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-400 space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
              <Truck className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium">Tidak ada berkas EOR ditemukan</p>
            <p className="text-xs text-slate-400">Silakan tambahkan EOR baru dengan tombol di kanan atas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
