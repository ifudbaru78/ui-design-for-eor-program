import React from "react";
import { Printer, X, FileText, CheckCircle, ShieldCheck, Mail, Globe, MapPin } from "lucide-react";
import { EORDocument } from "../types";

interface EORPrintPreviewProps {
  document: EORDocument;
  onClose: () => void;
}

export default function EORPrintPreview({ document, onClose }: EORPrintPreviewProps) {
  const handlePrint = () => {
    window.print();
  };

  const getStatusLabel = (status: EORDocument["mnrStatus"]) => {
    switch (status) {
      case "APPROVED":
        return "APPROVED (DISETUJUI)";
      case "WAITING APPROVED":
        return "WAITING FOR APPROVAL (MENUNGGU)";
      case "REJECTED":
        return "REJECTED (DITOLAK)";
      default:
        return "DRAFT";
    }
  };

  const exchangeRate = document.exchangeRate || 16000;

  const getPY = (resp: string) => {
    const first = resp.trim().charAt(0).toUpperCase();
    if (first === "O") return "O";
    if (first === "U" || first === "C" || first === "L") return "U";
    return "T"; // Others
  };

  // Calculations in IDR matching the exact math
  const totalHours = document.items.reduce((sum, item) => sum + (item.hours || 0), 0);
  const totalLaborIDR = Math.round(document.totalLabourCost * exchangeRate);
  const totalMaterialIDR = Math.round(document.totalMaterialCost * exchangeRate);

  const totalOwnerIDR = Math.round(
    document.items
      .filter((item) => getPY(item.responsibility) === "O")
      .reduce((sum, item) => sum + item.totalCost, 0) * exchangeRate
  );

  const totalLesseeIDR = Math.round(
    document.items
      .filter((item) => getPY(item.responsibility) === "U")
      .reduce((sum, item) => sum + item.totalCost, 0) * exchangeRate
  );

  const totalOthersIDR = Math.round(
    document.items
      .filter((item) => getPY(item.responsibility) !== "O" && getPY(item.responsibility) !== "U")
      .reduce((sum, item) => sum + item.totalCost, 0) * exchangeRate
  );

  const grandTotalIDR = totalOwnerIDR + totalLesseeIDR + totalOthersIDR;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto" id="print-preview-modal">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header (Controls) */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold text-sm">Pratinjau Cetak EOR Kontainer</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md"
            >
              <Printer className="w-4 h-4" />
              Cetak Berkas
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg transition-all text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Printable Sheet Container */}
        <div className="overflow-y-auto p-8 bg-slate-100 flex-1 print:bg-white print:p-0 print:overflow-visible">
          
          {/* Paper Sheet */}
          <div className="bg-white w-[210mm] min-h-[297mm] mx-auto p-10 shadow-lg border border-slate-200/50 rounded-xs print:shadow-none print:border-none print:p-0 print:w-full">
            
            {/* Logo and Header Block */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-6">
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">DEPO KONTAINER UTAMA INDONESIA</h1>
                <p className="text-xs text-slate-500 font-medium">Logistic Hub & Container Repair Depot Services</p>
                <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-2 font-medium">
                  <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> Jl. Logistik Raya No. 42, Tanjung Priok, Jakarta</span>
                  <span className="flex items-center gap-0.5"><Globe className="w-3 h-3" /> www.depoutamaindo.co.id</span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md tracking-wider block uppercase">
                  Estimate of Repair (EOR)
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${
                    (document.paymentStatus || "UNPAID") === "PAID"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-rose-50 text-rose-700 border-rose-300"
                  }`}>
                    {(document.paymentStatus || "UNPAID")}
                  </span>
                </div>
                <span className="font-mono text-sm font-extrabold text-slate-900 block mt-1">{document.noEor}</span>
                <span className="text-[10px] text-slate-400 block font-medium">Tanggal: {document.eorDate}</span>
              </div>
            </div>

            {/* Document details section */}
            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200/50 mb-6 text-xs print:p-2 print:mb-4">
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2 uppercase tracking-wide text-[10px]">Document & Shipping Info</h3>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500 font-semibold">Principal:</span>
                  <span className="col-span-2 text-slate-900 font-medium">{document.principal}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500 font-semibold">No. BL:</span>
                  <span className="col-span-2 font-mono text-slate-900 font-medium">{document.noBl}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500 font-semibold">Vessel / Voyage:</span>
                  <span className="col-span-2 text-slate-900 font-medium">{document.vesselName} ({document.voyage})</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500 font-semibold">Customer Name:</span>
                  <span className="col-span-2 text-slate-900 font-medium">{document.customerName}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2 uppercase tracking-wide text-[10px]">Container Info</h3>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500 font-semibold">Container NO:</span>
                  <span className="col-span-2 font-mono font-extrabold text-slate-900 text-sm">{document.containerNo}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500 font-semibold">Size / Type:</span>
                  <span className="col-span-2 text-slate-900 font-medium">{document.sizeType}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500 font-semibold">Material / Cond:</span>
                  <span className="col-span-2 text-slate-900 font-medium">{document.material} ({document.condition === "DM" ? "DAMAGED" : "GOOD"})</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500 font-semibold">Survey Date:</span>
                  <span className="col-span-2 text-slate-900 font-medium">{document.dateOfSurvey} {document.timeOfInterchange}</span>
                </div>
              </div>
            </div>

            {/* Repair estimate table (Polished standard depot format in IDR) */}
            <div className="mb-6 select-none">
              <h3 className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wide mb-2.5">Itemized Damage & Repair Estimates (IDR)</h3>
              <table className="w-full text-[11px] border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[9px] font-bold tracking-wider">
                    <th className="py-2.5 px-3 border border-slate-300 text-left">No</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-left">Component & Description</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-center">Loc</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-center">Qty</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-center">Py</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-center">Hour</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-right">Labour</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-right">Material</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {document.items.map((item, idx) => {
                    const pyCode = getPY(item.responsibility);
                    const labourVal = Math.round(item.labourCost * exchangeRate);
                    const materialVal = Math.round(item.materialCost * item.qty * exchangeRate);
                    const totalVal = Math.round(item.totalCost * exchangeRate);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 border border-slate-200 text-slate-600 font-semibold text-center">{idx + 1}</td>
                        <td className="py-2 px-3 border border-slate-200">
                          <div className="font-bold text-slate-800">{item.componentCode} - {item.componentName}</div>
                          <div className="text-[10px] text-slate-500 font-sans">{item.description}</div>
                        </td>
                        <td className="py-2 px-3 border border-slate-200 text-center text-slate-700">{item.locationCode}</td>
                        <td className="py-2 px-3 border border-slate-200 text-center text-slate-700 font-semibold">{item.qty}</td>
                        <td className="py-2 px-3 border border-slate-200 text-center font-bold text-indigo-600">{pyCode}</td>
                        <td className="py-2 px-3 border border-slate-200 text-center text-slate-600">{item.hours.toFixed(2)}</td>
                        <td className="py-2 px-3 border border-slate-200 text-right text-slate-700">{labourVal > 0 ? labourVal.toLocaleString("id-ID") : "0"}</td>
                        <td className="py-2 px-3 border border-slate-200 text-right text-slate-700">{materialVal > 0 ? materialVal.toLocaleString("id-ID") : "0"}</td>
                        <td className="py-2 px-3 border border-slate-200 text-right font-bold text-slate-900">{totalVal.toLocaleString("id-ID")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Box (Direct Replica of Screenshot) */}
            <div className="grid grid-cols-2 gap-6 items-stretch mb-8">
              <div className="border border-slate-300 p-4 rounded-xl bg-slate-50 flex flex-col justify-between font-mono text-slate-700">
                <div>
                  <div className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1 text-[11px] tracking-wider uppercase">C U S T O M E R</div>
                  <div className="text-[11px] leading-relaxed text-slate-600">
                    Please proceed to repair for the above container damage as estimated.
                  </div>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-500">DATE / TANGGAL:</span>
                  <span className="font-bold text-slate-800">{document.eorDate}</span>
                </div>
              </div>

              <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 font-mono space-y-2">
                <div className="flex justify-between items-center text-slate-700 text-[11px]">
                  <span>Total Hour :</span>
                  <span className="font-bold">{totalHours.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200/60 my-1"></div>
                <div className="flex justify-between items-center text-slate-700 text-[11px]">
                  <span>Labor Cost :</span>
                  <span className="font-bold">{totalLaborIDR.toLocaleString("id-ID")}.00</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 text-[11px]">
                  <span>Material Cost :</span>
                  <span className="font-bold">{totalMaterialIDR.toLocaleString("id-ID")}.00</span>
                </div>
                <div className="border-t border-slate-200/60 my-1"></div>
                <div className="flex justify-between items-center text-slate-700 text-[11px]">
                  <span>Total Cost Owner :</span>
                  <span className="font-bold">{totalOwnerIDR.toLocaleString("id-ID")}.00</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 text-[11px]">
                  <span>Total Cost Lessee :</span>
                  <span className="font-bold">{totalLesseeIDR.toLocaleString("id-ID")}.00</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 text-[11px]">
                  <span>Total Cost Others :</span>
                  <span className="font-bold">{totalOthersIDR > 0 ? `${totalOthersIDR.toLocaleString("id-ID")}.00` : "-"}</span>
                </div>
                <div className="border-t border-slate-300 pt-2 flex justify-between items-center text-slate-900">
                  <span className="font-black text-xs uppercase tracking-wider">Grand Total :</span>
                  <span className="font-black text-[13px] bg-indigo-50 border-2 border-indigo-950/20 px-2 py-0.5 rounded">
                    {grandTotalIDR.toLocaleString("id-ID")}.00
                  </span>
                </div>
              </div>
            </div>

            {/* Name, Sign & Stamp Signature Panel */}
            <div className="grid grid-cols-2 gap-12 text-xs mt-12 pt-6 border-t border-slate-100 font-mono">
              <div>
                <span className="text-slate-500 font-bold block mb-14 uppercase tracking-wider text-[10px]">Name, Sign & Stamp</span>
                <div className="border-b border-slate-400 w-3/4 mb-1 h-6"></div>
                <span className="text-[10px] text-slate-400 font-semibold">Inspected By Surveyor Depot</span>
              </div>

              <div className="text-right">
                <span className="text-slate-500 font-bold block mb-14 uppercase tracking-wider text-[10px]">Customer / Lessee Approval</span>
                <div className="border-b border-slate-400 w-3/4 ml-auto mb-1 h-6"></div>
                <span className="text-[10px] text-slate-400 font-semibold">Tanda Tangan & Cap Penyewa</span>
              </div>
            </div>

            {/* Print Footer */}
            <div className="text-[9px] text-slate-400 text-center font-medium mt-16 pt-3 border-t border-slate-150">
              Dokumen ini diterbitkan secara otomatis oleh sistem depo EOR Kontainer Mobile Utama. Validitas digital terjamin.
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
