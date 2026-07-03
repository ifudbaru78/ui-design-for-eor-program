import React, { useState, useEffect } from "react";
import {
  FileText,
  Truck,
  Hammer,
  ClipboardCheck,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Check,
  Percent,
  Calculator,
  RefreshCw,
  Coins,
  DollarSign,
  AlertCircle
} from "lucide-react";
import { EORDocument, EORDamageItem } from "../types";
import { PRINCIPALS, SIZES_TYPES, MATERIALS, CRITERIA_OPTIONS, COMPONENTS, DAMAGES, REPAIRS, LOCATIONS, PRESET_DAMAGES } from "../data";
import VisualContainer from "./VisualContainer";

interface EORWizardProps {
  onSave: (doc: EORDocument) => void;
  onCancel: () => void;
  initialDocument?: EORDocument;
}

export default function EORWizard({ onSave, onCancel, initialDocument }: EORWizardProps) {
  const [step, setStep] = useState(1);
  
  // EOR General State
  const [principal, setPrincipal] = useState(initialDocument?.principal || PRINCIPALS[0]);
  const [noEor, setNoEor] = useState(initialDocument?.noEor || `E${Date.now().toString(16).toUpperCase()}`);
  const [eorDate, setEorDate] = useState(initialDocument?.eorDate || new Date().toISOString().split("T")[0]);
  const [noBl, setNoBl] = useState(initialDocument?.noBl || "");
  const [transactId, setTransactId] = useState(initialDocument?.transactId || `I${Date.now().toString().slice(0,10)}VNF`);
  const [vesselName, setVesselName] = useState(initialDocument?.vesselName || "");
  const [voyage, setVoyage] = useState(initialDocument?.voyage || "");
  const [customerName, setCustomerName] = useState(initialDocument?.customerName || "");
  const [mnrStatus, setMnrStatus] = useState<EORDocument["mnrStatus"]>(initialDocument?.mnrStatus || "WAITING APPROVED");
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'UNPAID'>(initialDocument?.paymentStatus || "UNPAID");
  
  // Container State
  const [containerNo, setContainerNo] = useState(initialDocument?.containerNo || "");
  const [sizeType, setSizeType] = useState(initialDocument?.sizeType || SIZES_TYPES[0]);
  const [material, setMaterial] = useState(initialDocument?.material || MATERIALS[0]);
  const [condition, setCondition] = useState(initialDocument?.condition || "DM");
  const [ownership, setOwnership] = useState(initialDocument?.ownership || "OWNER - LESSOR");
  const [criteria, setCriteria] = useState(initialDocument?.criteria || CRITERIA_OPTIONS[0]);
  
  // Dates
  const [dateOfSurvey, setDateOfSurvey] = useState(initialDocument?.dateOfSurvey || new Date().toISOString().split("T")[0]);
  const [dateOfInterchange, setDateOfInterchange] = useState(initialDocument?.dateOfInterchange || new Date().toISOString().split("T")[0]);
  const [timeOfInterchange, setTimeOfInterchange] = useState(initialDocument?.timeOfInterchange || "12:00");
  const [remark, setRemark] = useState(initialDocument?.remark || "");
  
  // Added Damage Items list
  const [items, setItems] = useState<EORDamageItem[]>(initialDocument?.items || []);

  // Modal State for adding/editing a Damage Item
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // New Item Temporary Fields
  const [itemResponsibility, setItemResponsibility] = useState("O-OWNER - LESSOR");
  const [itemDescription, setItemDescription] = useState("");
  const [itemComponentCode, setItemComponentCode] = useState(COMPONENTS[0].code);
  const [itemComponentName, setItemComponentName] = useState(COMPONENTS[0].name);
  const [itemDamageCode, setItemDamageCode] = useState(DAMAGES[0].code);
  const [itemDamageName, setItemDamageName] = useState(DAMAGES[0].name);
  const [itemRepairCode, setItemRepairCode] = useState(REPAIRS[0].code);
  const [itemRepairName, setItemRepairName] = useState(REPAIRS[0].name);
  const [itemLocationCode, setItemLocationCode] = useState(LOCATIONS[0].code);
  const [itemLocationName, setItemLocationName] = useState(LOCATIONS[0].name);
  const [itemRepairCategory, setItemRepairCategory] = useState("WT:Wear and Tear");
  const [itemRepairType, setItemRepairType] = useState("S:Square");
  const [itemLength, setItemLength] = useState<number>(15);
  const [itemWidth, setItemWidth] = useState<number>(15);
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemDivisionCode, setItemDivisionCode] = useState("DIV-A");
  const [itemManHoursRate, setItemManHoursRate] = useState<number>(1.5);
  const [itemHours, setItemHours] = useState<number>(1.5);
  const [itemLabourCost, setItemLabourCost] = useState<number>(2.25);
  const [itemMaterialCost, setItemMaterialCost] = useState<number>(14.4);
  const [itemTotalCost, setItemTotalCost] = useState<number>(16.65);

  const exchangeRate = 16000;

  // Sync Component & Damage & Repair name whenever code changes
  useEffect(() => {
    const comp = COMPONENTS.find((c) => c.code === itemComponentCode);
    if (comp) setItemComponentName(comp.name.split(" ")[0]);
  }, [itemComponentCode]);

  useEffect(() => {
    const dmg = DAMAGES.find((d) => d.code === itemDamageCode);
    if (dmg) setItemDamageName(dmg.name.split(" ")[0]);
  }, [itemDamageCode]);

  useEffect(() => {
    const rep = REPAIRS.find((r) => r.code === itemRepairCode);
    if (rep) setItemRepairName(rep.name.split(" ")[0]);
  }, [itemRepairCode]);

  useEffect(() => {
    const loc = LOCATIONS.find((l) => l.code === itemLocationCode);
    if (loc) setItemLocationName(loc.name);
  }, [itemLocationCode]);

  // Recalculate Labour & Total costs dynamically as dimensions change
  useEffect(() => {
    // Standard rule: Hours are linked to Length x Width, or defaults
    let computedHours = itemManHoursRate;
    if (itemLength > 30 || itemWidth > 30) {
      computedHours = itemManHoursRate * 1.5;
    }
    setItemHours(parseFloat(computedHours.toFixed(2)));

    // Labour = computedHours * standard manhour rate (e.g. 1.5 USD per hour)
    const computedLabour = computedHours * 1.5 * itemQty;
    setItemLabourCost(parseFloat(computedLabour.toFixed(2)));

    // Total cost
    const computedTotal = computedLabour + (itemMaterialCost * itemQty);
    setItemTotalCost(parseFloat(computedTotal.toFixed(2)));
  }, [itemLength, itemWidth, itemQty, itemManHoursRate, itemMaterialCost]);

  // Handle preset damage click
  const handleApplyPreset = (preset: typeof PRESET_DAMAGES[0]) => {
    setItemComponentCode(preset.componentCode);
    setItemComponentName(preset.componentName);
    setItemDamageCode(preset.damageCode);
    setItemDamageName(preset.damageName);
    setItemRepairCode(preset.repairCode);
    setItemRepairName(preset.repairName);
    setItemLocationCode(preset.locationCode);
    setItemLocationName(preset.locationName);
    setItemLength(preset.defaultLength);
    setItemWidth(preset.defaultWidth);
    setItemQty(preset.defaultQty);
    setItemManHoursRate(preset.defaultManHoursRate);
    setItemHours(preset.defaultHours);
    setItemLabourCost(preset.defaultLabourCost);
    setItemMaterialCost(preset.defaultMaterialCost);
    setItemTotalCost(preset.defaultTotalCost);
    setItemDescription(preset.label.split("(")[0].trim().toUpperCase());
  };

  // Callback from Visual Map selection
  const handleSelectLocationVisual = (code: string, name: string) => {
    setItemLocationCode(code);
    setItemLocationName(name);
  };

  // Callback from AI parse assistant (text or audio transcription)
  const handleAIParsedItem = (parsed: Partial<EORDamageItem>) => {
    if (parsed.responsibility) setItemResponsibility(parsed.responsibility);
    if (parsed.description) setItemDescription(parsed.description);
    if (parsed.componentCode) setItemComponentCode(parsed.componentCode);
    if (parsed.componentName) setItemComponentName(parsed.componentName);
    if (parsed.damageCode) setItemDamageCode(parsed.damageCode);
    if (parsed.damageName) setItemDamageName(parsed.damageName);
    if (parsed.repairCode) setItemRepairCode(parsed.repairCode);
    if (parsed.repairName) setItemRepairName(parsed.repairName);
    if (parsed.locationCode) setItemLocationCode(parsed.locationCode);
    if (parsed.locationName) setItemLocationName(parsed.locationName);
    if (parsed.repairCategory) setItemRepairCategory(parsed.repairCategory);
    if (parsed.repairType) setItemRepairType(parsed.repairType);
    if (parsed.length !== undefined) setItemLength(parsed.length);
    if (parsed.width !== undefined) setItemWidth(parsed.width);
    if (parsed.qty !== undefined) setItemQty(parsed.qty);
    if (parsed.hours !== undefined) setItemManHoursRate(parsed.hours);
    if (parsed.materialCost !== undefined) setItemMaterialCost(parsed.materialCost);
  };

  // Open item modal for creation
  const handleOpenAddItemModal = () => {
    setEditingItemId(null);
    setItemResponsibility("O-OWNER - LESSOR");
    setItemDescription("");
    setItemComponentCode(COMPONENTS[0].code);
    setItemDamageCode(DAMAGES[0].code);
    setItemRepairCode(REPAIRS[0].code);
    setItemLocationCode(LOCATIONS[0].code);
    setItemRepairCategory("WT:Wear and Tear");
    setItemRepairType("S:Square");
    setItemLength(15);
    setItemWidth(15);
    setItemQty(1);
    setItemMaterialCost(14.4);
    setIsItemModalOpen(true);
  };

  // Open item modal for edit
  const handleOpenEditItemModal = (item: EORDamageItem) => {
    setEditingItemId(item.id);
    setItemResponsibility(item.responsibility);
    setItemDescription(item.description);
    setItemComponentCode(item.componentCode);
    setItemComponentName(item.componentName);
    setItemDamageCode(item.damageCode);
    setItemDamageName(item.damageName);
    setItemRepairCode(item.repairCode);
    setItemRepairName(item.repairName);
    setItemLocationCode(item.locationCode);
    setItemLocationName(item.locationName);
    setItemRepairCategory(item.repairCategory || "WT:Wear and Tear");
    setItemRepairType(item.repairType || "S:Square");
    setItemLength(item.length);
    setItemWidth(item.width);
    setItemQty(item.qty);
    setItemDivisionCode(item.divisionCode);
    setItemManHoursRate(item.manHoursRate);
    setItemHours(item.hours);
    setItemLabourCost(item.labourCost);
    setItemMaterialCost(item.materialCost);
    setItemTotalCost(item.totalCost);
    setIsItemModalOpen(true);
  };

  // Save current damage item
  const handleSaveItem = () => {
    const newItem: EORDamageItem = {
      id: editingItemId || `item-${Date.now()}`,
      responsibility: itemResponsibility,
      description: itemDescription || `${itemComponentName.toUpperCase()} ${itemDamageName.toUpperCase()}`,
      componentCode: itemComponentCode,
      componentName: itemComponentName,
      damageCode: itemDamageCode,
      damageName: itemDamageName,
      repairCode: itemRepairCode,
      repairName: itemRepairName,
      locationCode: itemLocationCode,
      locationName: itemLocationName,
      repairCategory: itemRepairCategory,
      repairType: itemRepairType,
      length: itemLength,
      width: itemWidth,
      qty: itemQty,
      divisionCode: itemDivisionCode,
      manHoursRate: itemManHoursRate,
      hours: itemHours,
      labourCost: itemLabourCost,
      materialCost: itemMaterialCost,
      totalCost: itemTotalCost,
    };

    if (editingItemId) {
      setItems(items.map((it) => (it.id === editingItemId ? newItem : it)));
    } else {
      setItems([...items, newItem]);
    }
    setIsItemModalOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((it) => it.id !== id));
  };

  // Calculated General Summaries
  const totalLabourCost = parseFloat(items.reduce((sum, it) => sum + it.labourCost, 0).toFixed(2));
  const totalMaterialCost = parseFloat(items.reduce((sum, it) => sum + it.materialCost * it.qty, 0).toFixed(2));
  const totalCost = parseFloat((totalLabourCost + totalMaterialCost).toFixed(2));

  const getPY = (resp: string) => {
    const first = resp.trim().charAt(0).toUpperCase();
    if (first === "O") return "O";
    if (first === "U" || first === "C" || first === "L") return "U";
    return "T"; // Others
  };

  const totalHours = items.reduce((sum, item) => sum + (item.hours || 0), 0);
  const totalLaborIDR = Math.round(totalLabourCost * exchangeRate);
  const totalMaterialIDR = Math.round(totalMaterialCost * exchangeRate);

  const totalOwnerIDR = Math.round(
    items
      .filter((item) => getPY(item.responsibility) === "O")
      .reduce((sum, item) => sum + item.totalCost, 0) * exchangeRate
  );

  const totalLesseeIDR = Math.round(
    items
      .filter((item) => getPY(item.responsibility) === "U")
      .reduce((sum, item) => sum + item.totalCost, 0) * exchangeRate
  );

  const totalOthersIDR = Math.round(
    items
      .filter((item) => getPY(item.responsibility) !== "O" && getPY(item.responsibility) !== "U")
      .reduce((sum, item) => sum + item.totalCost, 0) * exchangeRate
  );

  const grandTotalIDR = totalOwnerIDR + totalLesseeIDR + totalOthersIDR;

  // Handle final save
  const handleFinalSubmit = () => {
    if (!containerNo.trim()) {
      alert("Nomor kontainer wajib diisi!");
      setStep(2);
      return;
    }

    const finalDoc: EORDocument = {
      id: initialDocument?.id || noEor,
      principal,
      noEor,
      eorDate,
      noBl,
      transactId,
      vesselName,
      voyage,
      customerName,
      mnrStatus,
      paymentStatus,
      entryBy: initialDocument?.entryBy || "YANTO",
      entryDate: initialDocument?.entryDate || new Date().toISOString().replace("T", " ").slice(0, 16),
      containerNo: containerNo.toUpperCase(),
      sizeType,
      material,
      condition,
      ownership,
      criteria,
      dateOfSurvey,
      dateOfInterchange,
      timeOfInterchange,
      remark,
      items,
      totalLabourCost,
      totalMaterialCost,
      totalCost,
      currency: "USD",
      exchangeRate,
    };

    onSave(finalDoc);
  };

  return (
    <div className="space-y-5" id="eor-creation-wizard">
      
      {/* Step Indicators Header */}
      <div className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-1 select-none">
        {[
          { label: "Info BL", stepNum: 1, icon: FileText },
          { label: "Kontainer", stepNum: 2, icon: Truck },
          { label: "Kerusakan", stepNum: 3, icon: Hammer },
          { label: "Review", stepNum: 4, icon: ClipboardCheck },
        ].map((itemIndicator) => {
          const isActive = step === itemIndicator.stepNum;
          const isCompleted = step > itemIndicator.stepNum;
          const IconComponent = itemIndicator.icon;
          return (
            <button
              type="button"
              key={itemIndicator.stepNum}
              onClick={() => setStep(itemIndicator.stepNum)}
              className="flex-1 flex flex-col items-center gap-1.5 focus:outline-hidden"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-4 ring-indigo-100"
                    : isCompleted
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-slate-50 text-slate-400 border-slate-200"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : itemIndicator.stepNum}
              </div>
              <span
                className={`text-[10px] font-bold tracking-wide ${
                  isActive ? "text-indigo-600" : isCompleted ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                {itemIndicator.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* STEP 1: DOCUMENT / LOGISTIC DATA */}
      {step === 1 && (
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-800">1. Informasi Dokumen & Pelayaran</h3>
            <p className="text-xs text-slate-500">Tentukan pelayaran principal, nomor B/L, dan data logistik dasar.</p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-600">Pelayaran (Principal)</label>
              <select
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 transition-all font-medium text-slate-800"
              >
                {PRINCIPALS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">No. EOR</label>
                <input
                  type="text"
                  value={noEor}
                  onChange={(e) => setNoEor(e.target.value)}
                  placeholder="Auto-generated"
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-500 cursor-not-allowed"
                  disabled
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Tanggal EOR</label>
                <input
                  type="date"
                  value={eorDate}
                  onChange={(e) => setEorDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">No. Bill of Lading (B/L)</label>
                <input
                  type="text"
                  value={noBl}
                  onChange={(e) => setNoBl(e.target.value)}
                  placeholder="Contoh: BTU600031600"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Transact ID</label>
                <input
                  type="text"
                  value={transactId}
                  onChange={(e) => setTransactId(e.target.value)}
                  placeholder="Contoh: I20260653759VNF"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="col-span-2 space-y-1">
                <label className="font-semibold text-slate-600">Nama Kapal (Vessel)</label>
                <input
                  type="text"
                  value={vesselName}
                  onChange={(e) => setVesselName(e.target.value)}
                  placeholder="Contoh: HYUNDAI UNITY"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Voyage</label>
                <input
                  type="text"
                  value={voyage}
                  onChange={(e) => setVoyage(e.target.value)}
                  placeholder="0182S"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 font-medium font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600">Nama Pelanggan (Customer Name)</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: PT. PAKOAKUINA"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: CONTAINER DETAILS */}
      {step === 2 && (
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-800">2. Detail Spesifikasi Kontainer</h3>
            <p className="text-xs text-slate-500">Masukkan nomor registrasi kontainer, ukuran, material, dan tanggal serah terima.</p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 flex items-center justify-between">
                <span>No. Kontainer</span>
                <span className="text-[10px] text-indigo-600 font-bold tracking-wider">Format: PCIU1467216</span>
              </label>
              <input
                type="text"
                value={containerNo}
                onChange={(e) => setContainerNo(e.target.value.toUpperCase())}
                placeholder="Masukkan Nomor Kontainer"
                className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-mono font-extrabold text-slate-800 tracking-wider focus:bg-white focus:border-indigo-500 focus:outline-hidden uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Ukuran / Tipe</label>
                <select
                  value={sizeType}
                  onChange={(e) => setSizeType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  {SIZES_TYPES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Material Kontainer</label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  {MATERIALS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 block">Kondisi Saat Ini</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCondition("DM")}
                    className={`p-2.5 rounded-xl border font-bold text-center transition-all ${
                      condition === "DM"
                        ? "bg-amber-50 border-amber-400 text-amber-700 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    DM (Damage)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCondition("GD")}
                    className={`p-2.5 rounded-xl border font-bold text-center transition-all ${
                      condition === "GD"
                        ? "bg-emerald-50 border-emerald-400 text-emerald-700 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    GD (Good)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Kepemilikan</label>
                <input
                  type="text"
                  value={ownership}
                  onChange={(e) => setOwnership(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600">Kriteria Cuci (Washing Criteria)</label>
              <select
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                {CRITERIA_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Tgl. Survey</label>
                <input
                  type="date"
                  value={dateOfSurvey}
                  onChange={(e) => setDateOfSurvey(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Tgl. Interchange</label>
                <input
                  type="date"
                  value={dateOfInterchange}
                  onChange={(e) => setDateOfInterchange(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Waktu Interchange</label>
                <input
                  type="time"
                  value={timeOfInterchange}
                  onChange={(e) => setTimeOfInterchange(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: ESTIMATED ITEMS (DAMAGES & REPAIR ENTRY) */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
          
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">3. Rincian Kerusakan & Estimasi Biaya</h3>
                <p className="text-xs text-slate-500">Taksir item kerusakan, ukuran perbaikan, dan biaya penyelesaian.</p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddItemModal}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Item</span>
              </button>
            </div>

            {/* List of current damage items */}
            <div className="space-y-3">
              {items.length > 0 ? (
                items.map((it, index) => (
                  <div
                    key={it.id}
                    className="border border-slate-100 rounded-xl p-3.5 bg-slate-50 flex flex-col gap-2.5 text-xs hover:border-slate-200 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-800 font-mono">
                            #{index + 1}: {it.componentCode}
                          </span>
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded uppercase font-mono">
                            {it.damageCode}
                          </span>
                          <span className="text-[9px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded uppercase font-mono">
                            {it.repairCode}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-semibold uppercase">{it.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditItemModal(it)}
                          className="px-2 py-1 text-[10px] font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-md shadow-2xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(it.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-[10px] border-t border-slate-200/50 pt-2 text-slate-500">
                      <div>
                        <span className="block font-medium">Lokasi:</span>
                        <span className="font-semibold text-slate-700 font-mono">{it.locationCode}</span>
                      </div>
                      <div>
                        <span className="block font-medium">Dimensi:</span>
                        <span className="font-semibold text-slate-700 font-mono">
                          {it.length > 0 ? `${it.length}x${it.width} cm` : "-"}
                        </span>
                      </div>
                      <div>
                        <span className="block font-medium">Pcs:</span>
                        <span className="font-bold text-slate-700 font-mono">{it.qty}</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-medium">Responsibilitas:</span>
                        <span className="font-bold text-slate-700 font-mono text-[9px]">
                          {it.responsibility.split(" ")[0]}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 text-[10px]">
                      <span className="font-semibold text-slate-500">Estimasi Biaya Item:</span>
                      <div className="text-right font-mono">
                        <span className="font-extrabold text-slate-800 font-mono">${it.totalCost.toFixed(2)} USD</span>
                        <span className="text-slate-400 font-semibold block text-[8px]">
                          ≈ Rp {(it.totalCost * exchangeRate).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-400 border border-dashed border-slate-200 space-y-1">
                  <Calculator className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                  <p className="text-xs font-semibold">Belum ada item kerusakan ditambahkan</p>
                  <p className="text-[10px]">Silakan tap tombol &quot;Tambah Item&quot; di kanan atas untuk melapor.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Summary card */}
          {items.length > 0 && (
            <div className="bg-slate-900 text-white rounded-2xl p-4.5 shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">Estimasi Sementara</span>
                <span className="font-mono text-base font-black text-amber-400">${totalCost.toFixed(2)} USD</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">Equiv. Rupiah</span>
                <span className="font-mono text-sm font-black text-slate-200">
                  Rp {(totalCost * exchangeRate).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: REMARK & REVIEW */}
      {step === 4 && (
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="border-b border-slate-100 pb-2 pt-1">
            <h3 className="text-sm font-bold text-slate-800">4. Dokumentasi & Tinjau Kembali</h3>
            <p className="text-xs text-slate-500">Beri catatan tambahan dan simpan berkas EOR.</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Remark Area */}
            <div className="space-y-1">
              <label className="font-bold text-slate-600 block">Remark / Catatan Tambahan Depo</label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Tulis instruksi tambahan perihal kondisi kontainer, masalah pembongkaran, dll."
                className="w-full h-20 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 resize-none font-medium text-slate-700"
              />
            </div>

            {/* Overall Grand Total Review (Direct Replica of Screenshot style) */}
            <div className="bg-indigo-950 text-white rounded-2xl p-4 shadow-md border border-indigo-900 space-y-3 select-none">
              <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-indigo-300">
                <span>Rangkuman Estimasi Final (IDR)</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono text-[9px]">
                  {mnrStatus}
                </span>
              </div>

              <div className="border-t border-indigo-900/60 pt-2.5 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Total Hour:</span>
                  <span className="text-slate-200 font-bold">{totalHours.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Labor Cost:</span>
                  <span className="text-slate-200">Rp {totalLaborIDR.toLocaleString("id-ID")}.00</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Material Cost:</span>
                  <span className="text-slate-200">Rp {totalMaterialIDR.toLocaleString("id-ID")}.00</span>
                </div>
                <div className="border-t border-indigo-900/40 my-1"></div>
                <div className="flex justify-between text-indigo-300">
                  <span>Total Cost Owner (O):</span>
                  <span className="font-bold">Rp {totalOwnerIDR.toLocaleString("id-ID")}.00</span>
                </div>
                <div className="flex justify-between text-indigo-300">
                  <span>Total Cost Lessee (U):</span>
                  <span className="font-bold">Rp {totalLesseeIDR.toLocaleString("id-ID")}.00</span>
                </div>
                {totalOthersIDR > 0 && (
                  <div className="flex justify-between text-indigo-300">
                    <span>Total Cost Others:</span>
                    <span className="font-bold">Rp {totalOthersIDR.toLocaleString("id-ID")}.00</span>
                  </div>
                )}
              </div>

              <div className="border-t border-indigo-900 pt-2.5 flex justify-between items-center bg-indigo-900/30 p-2 rounded-xl">
                <span className="text-xs font-bold text-slate-100 uppercase font-mono">Grand Total:</span>
                <span className="font-mono text-base font-black text-amber-400">
                  Rp {grandTotalIDR.toLocaleString("id-ID")}.00
                </span>
              </div>

              <div className="text-[9px] text-slate-400 font-medium flex justify-between items-center border-t border-indigo-900/40 pt-2 font-mono">
                <span>Kurs PIL Depot:</span>
                <span>1 USD = Rp {exchangeRate.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons Row */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-250 text-slate-600 rounded-xl font-bold text-xs transition-all"
          >
            Batal
          </button>
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-1.5 ml-auto bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md"
          >
            <span>Selanjutnya</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinalSubmit}
            className="flex items-center gap-1.5 ml-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 py-2.5 rounded-xl transition-all shadow-lg active:scale-95"
          >
            <span>Simpan Berkas EOR</span>
            <Check className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* DAMAGE ITEM ENTRY DRAWER MODAL */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Drawer Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                {editingItemId ? "Ubah Item Kerusakan" : "Tambah Item Kerusakan Baru"}
              </h4>
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-xs uppercase"
              >
                Tutup
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
              
              {/* Visual SVG Map interactive picker */}
              <VisualContainer
                onSelectLocation={handleSelectLocationVisual}
                selectedLocationCode={itemLocationCode}
              />

              {/* Interactive Form Fields */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase tracking-wide text-[10px]">Responsibilitas (Responsibility)</label>
                    <select
                      value={itemResponsibility}
                      onChange={(e) => setItemResponsibility(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                    >
                      <option value="O-OWNER - LESSOR">O - OWNER (Lessor)</option>
                      <option value="U-USER - LESSEE">U - USER (Lessee)</option>
                      <option value="C-CONSIGNEE">C - CONSIGNEE</option>
                      <option value="T-THIRD PARTY">T - THIRD PARTY</option>
                    </select>
                  </div>

                  {/* Repair Type & Category dual combo row */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[9px]">Klasifikasi Pekerjaan (Repair Type & Category)</label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <div className="bg-[#e2fcd4] border border-[#a3e635] text-[#14532d] px-3.5 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-wider flex items-center justify-center whitespace-nowrap shadow-3xs">
                        Repair Type / Category
                      </div>
                      <select
                        value={itemRepairType}
                        onChange={(e) => setItemRepairType(e.target.value)}
                        className="flex-1 min-w-[100px] p-1.5 bg-[#fef9c3] border border-[#facc15] text-slate-900 font-extrabold rounded-sm text-xs cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-yellow-500/20"
                      >
                        <option value="S:Square">S:Square</option>
                        <option value="L:Linear">L:Linear</option>
                        <option value="P:Piece">P:Piece</option>
                        <option value="A:Area">A:Area</option>
                      </select>
                      <select
                        value={itemRepairCategory}
                        onChange={(e) => setItemRepairCategory(e.target.value)}
                        className="flex-1 min-w-[130px] p-1.5 bg-[#fef9c3] border border-[#facc15] text-slate-900 font-extrabold rounded-sm text-xs cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-yellow-500/20"
                      >
                        <option value="WT:Wear and Tear">WT:Wear and Tear</option>
                        <option value="UC:User Damage">UC:User Damage</option>
                        <option value="O:Owner Damage">O:Owner Damage</option>
                        <option value="T:Third Party">T:Third Party</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">EOR Deskripsi Kerusakan (Description)</label>
                  <input
                    type="text"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value.toUpperCase())}
                    placeholder="Contoh: ROOF PANEL DAMAGE"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold uppercase text-slate-800"
                  />
                </div>

                {/* Code pickers */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-500 text-[10px]">Komponen (Comp)</label>
                    <select
                      value={itemComponentCode}
                      onChange={(e) => setItemComponentCode(e.target.value)}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold"
                    >
                      {COMPONENTS.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-500 text-[10px]">Kerusakan (Dmg)</label>
                    <select
                      value={itemDamageCode}
                      onChange={(e) => setItemDamageCode(e.target.value)}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold"
                    >
                      {DAMAGES.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-500 text-[10px]">Perbaikan (Rep)</label>
                    <select
                      value={itemRepairCode}
                      onChange={(e) => setItemRepairCode(e.target.value)}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold"
                    >
                      {REPAIRS.map((r) => (
                        <option key={r.code} value={r.code}>
                          {r.code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 text-[9px] block uppercase">Panjang (cm)</label>
                    <input
                      type="number"
                      value={itemLength}
                      onChange={(e) => setItemLength(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-md font-mono text-center text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 text-[9px] block uppercase">Lebar (cm)</label>
                    <input
                      type="number"
                      value={itemWidth}
                      onChange={(e) => setItemWidth(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-md font-mono text-center text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 text-[9px] block uppercase">Jumlah (Qty)</label>
                    <input
                      type="number"
                      value={itemQty}
                      onChange={(e) => setItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-md font-mono text-center text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 text-[9px] block uppercase">Div. Code</label>
                    <input
                      type="text"
                      value={itemDivisionCode}
                      onChange={(e) => setItemDivisionCode(e.target.value.toUpperCase())}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-md font-mono text-center text-xs"
                    />
                  </div>
                </div>

                {/* Estimate calculations & custom pricing fields */}
                <div className="bg-slate-900 text-white rounded-xl p-3.5 space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold tracking-wider uppercase">
                    <span>Estimasi Formula Harga</span>
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[10px] border-b border-slate-800 pb-2.5">
                    <div className="space-y-1">
                      <label className="text-slate-400 block font-semibold">Tingkat Man-Hour (Hour Rate)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={itemManHoursRate}
                        onChange={(e) => setItemManHoursRate(parseFloat(e.target.value) || 0)}
                        className="w-full p-1 bg-slate-800 border border-slate-700 rounded-sm font-mono text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 block font-semibold">Bahan / Material Cost (USD)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={itemMaterialCost}
                        onChange={(e) => setItemMaterialCost(parseFloat(e.target.value) || 0)}
                        className="w-full p-1 bg-slate-800 border border-slate-700 rounded-sm font-mono text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] text-center">
                    <div>
                      <span className="text-slate-400 block">Jam Kerja (Hr)</span>
                      <span className="font-mono font-bold text-slate-200 text-xs">{itemHours}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Labour Cost</span>
                      <span className="font-mono font-bold text-slate-200 text-xs">${itemLabourCost}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Total Item (USD)</span>
                      <span className="font-mono font-bold text-amber-400 text-xs">${itemTotalCost}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="bg-slate-50 p-4 border-t border-slate-150 shrink-0 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Item</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
