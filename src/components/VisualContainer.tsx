import React, { useState, useEffect, useRef } from "react";
import { Hammer, MapPin, Layers, Sparkles } from "lucide-react";

interface VisualContainerProps {
  onSelectLocation: (locationCode: string, locationName: string) => void;
  selectedLocationCode: string;
}

type ContainerTab = "kiri" | "kanan" | "depan" | "atas" | "belakang" | "interior" | "unit";

interface Section {
  code: string;
  name: string;
  tab: ContainerTab;
  defaultX: number; // percentage
  defaultY: number; // percentage
  label: string;
}

const SECTIONS: Section[] = [
  // KIRI (Left)
  { code: "L-WALL", name: "Left Side Wall Panel", tab: "kiri", defaultX: 50, defaultY: 55, label: "Left Wall General" },
  { code: "L-BTM-RAIL", name: "Left Side Bottom Rail", tab: "kiri", defaultX: 50, defaultY: 85, label: "Left Bottom Rail" },
  { code: "L-TOP-RAIL", name: "Left Side Top Rail", tab: "kiri", defaultX: 50, defaultY: 15, label: "Left Top Rail" },
  { code: "CORNER-FL", name: "Front Left Corner Post", tab: "kiri", defaultX: 12, defaultY: 60, label: "Front Left Corner Post" },
  { code: "CORNER-RL", name: "Rear Left Corner Post", tab: "kiri", defaultX: 88, defaultY: 60, label: "Rear Left Corner Post" },

  // KANAN (Right)
  { code: "R-WALL", name: "Right Side Wall Panel", tab: "kanan", defaultX: 50, defaultY: 55, label: "Right Wall General" },
  { code: "R-BTM-RAIL", name: "Right Side Bottom Rail", tab: "kanan", defaultX: 50, defaultY: 85, label: "Right Bottom Rail" },
  { code: "R-TOP-RAIL", name: "Right Side Top Rail", tab: "kanan", defaultX: 50, defaultY: 15, label: "Right Top Rail" },
  { code: "CORNER-FR", name: "Front Right Corner Post", tab: "kanan", defaultX: 12, defaultY: 60, label: "Front Right Corner Post" },
  { code: "CORNER-RR", name: "Rear Right Corner Post", tab: "kanan", defaultX: 88, defaultY: 60, label: "Rear Right Corner Post" },

  // DEPAN (Front)
  { code: "FRONT-PANEL", name: "Front End Wall Panel", tab: "depan", defaultX: 50, defaultY: 50, label: "Front Wall Panel" },
  { code: "FRONT-BTM", name: "Front Bottom Rail", tab: "depan", defaultX: 50, defaultY: 85, label: "Front Bottom Rail" },
  { code: "FRONT-TOP", name: "Front Top Rail", tab: "depan", defaultX: 50, defaultY: 15, label: "Front Top Header" },

  // ATAS (Top / Roof)
  { code: "ROOF", name: "Roof Panel General Area", tab: "atas", defaultX: 50, defaultY: 50, label: "Roof General Area" },
  { code: "ROOF-BOW", name: "Roof Bow Support", tab: "atas", defaultX: 45, defaultY: 30, label: "Roof Bow Support" },

  // BELAKANG (Back / Rear Doors)
  { code: "DOOR-L", name: "Left Rear Door Sheet", tab: "belakang", defaultX: 35, defaultY: 50, label: "Left Rear Door" },
  { code: "DOOR-R", name: "Right Rear Door Sheet", tab: "belakang", defaultX: 65, defaultY: 50, label: "Right Rear Door" },
  { code: "REAR-HDR", name: "Rear Top Header", tab: "belakang", defaultX: 50, defaultY: 15, label: "Rear Top Header" },
  { code: "REAR-SILL", name: "Rear Door Sill", tab: "belakang", defaultX: 50, defaultY: 85, label: "Rear Door Sill" },

  // INTERIOR (Interior / Floor)
  { code: "FLOOR-F", name: "Front Floor Panel", tab: "interior", defaultX: 50, defaultY: 30, label: "Floor Front" },
  { code: "FLOOR-C", name: "Center Floor Panel", tab: "interior", defaultX: 50, defaultY: 60, label: "Floor Center" },
  { code: "FLOOR-R", name: "Rear Floor Panel", tab: "interior", defaultX: 50, defaultY: 85, label: "Floor Rear" },
  { code: "UNDER-X", name: "Understructure Crossmembers", tab: "interior", defaultX: 30, defaultY: 70, label: "Crossmembers" },

  // UNIT(MESIN) (Machinery / Unit)
  { code: "COMPRESSOR", name: "Reefer Compressor Unit", tab: "unit", defaultX: 35, defaultY: 65, label: "Compressor Unit" },
  { code: "EVAPORATOR", name: "Evaporator Unit", tab: "unit", defaultX: 50, defaultY: 25, label: "Evaporator Unit" },
  { code: "CONDENSER", name: "Condenser Unit", tab: "unit", defaultX: 65, defaultY: 65, label: "Condenser Unit" },
  { code: "CTRL-BOX", name: "Controller Panel Box", tab: "unit", defaultX: 20, defaultY: 45, label: "Control Panel Box" }
];

const TAB_IMAGES = {
  kiri: "/src/assets/images/blue_shipping_container_1783046589947.jpg",
  kanan: "/src/assets/images/blue_shipping_container_1783046589947.jpg",
  depan: "/src/assets/images/blue_shipping_container_1783046589947.jpg",
  atas: "/src/assets/images/blue_shipping_container_1783046589947.jpg",
  belakang: "/src/assets/images/blue_shipping_container_1783046589947.jpg",
  interior: "/src/assets/images/blue_shipping_container_1783046589947.jpg",
  unit: "/src/assets/images/blue_shipping_container_1783046589947.jpg"
};

export default function VisualContainer({
  onSelectLocation,
  selectedLocationCode,
}: VisualContainerProps) {
  const [activeTab, setActiveTab] = useState<ContainerTab>("kiri");
  const [markerPos, setMarkerPos] = useState<{ x: number; y: number } | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Auto-switch tab & place marker when selectedLocationCode is updated from outside (e.g. presets or dropdown)
  useEffect(() => {
    const matched = SECTIONS.find((s) => s.code === selectedLocationCode);
    if (matched) {
      setActiveTab(matched.tab);
      setMarkerPos({ x: matched.defaultX, y: matched.defaultY });
    }
  }, [selectedLocationCode]);

  // Handle clicking on the container photo
  const handlePhotoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Filter sections belonging to the current active tab
    const tabSections = SECTIONS.filter((s) => s.tab === activeTab);

    if (tabSections.length === 0) return;

    // Find the closest section using Euclidean distance
    let closestSection = tabSections[0];
    let minDistance = Infinity;

    tabSections.forEach((sec) => {
      const dist = Math.sqrt(
        Math.pow(clickX - sec.defaultX, 2) + Math.pow(clickY - sec.defaultY, 2)
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestSection = sec;
      }
    });

    // Update marker position to where user clicked precisely
    setMarkerPos({ x: clickX, y: clickY });

    // Trigger callback with closest matched structural location code
    onSelectLocation(closestSection.code, closestSection.name);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-xs" id="visual-container-selector">
      <div className="flex flex-col gap-1.5 mb-3">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <Hammer className="w-4 h-4 text-indigo-600" />
              Peta Foto Kerusakan Kontainer
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">Tap langsung pada foto untuk menandai titik kerusakan lapangan.</p>
          </div>
          <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
            Auto-Detect
          </span>
        </div>
      </div>

      {/* Interactive Container Photo Workspace */}
      <div
        ref={imageContainerRef}
        onClick={handlePhotoClick}
        className="relative w-full aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-200 shadow-inner cursor-crosshair group select-none mb-4"
      >
        <img
          src={TAB_IMAGES[activeTab]}
          alt={`Cargo Container ${activeTab} view`}
          className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-300"
          referrerPolicy="no-referrer"
        />

        {/* Ambient overlay guide */}
        <div className="absolute inset-0 bg-slate-900/10 pointer-events-none"></div>

        {/* Coordinates Target Indicator when clicked */}
        {markerPos && (
          <div
            style={{ left: `${markerPos.x}%`, top: `${markerPos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
          >
            {/* Ping animation effect */}
            <span className="absolute inline-flex h-8 w-8 -left-4 -top-4 rounded-full bg-rose-500 opacity-60 animate-ping"></span>
            
            {/* Actual visual Pin Marker */}
            <div className="bg-rose-600 text-white rounded-full p-1.5 shadow-lg border-2 border-white flex items-center justify-center scale-110">
              <MapPin className="w-4 h-4 fill-rose-300" />
            </div>

            {/* Micro tooltip directly on the marker */}
            <div className="absolute left-1/2 -translate-x-1/2 top-7 bg-slate-900/90 text-[9px] font-mono font-bold text-white px-1.5 py-0.5 rounded-md shadow-md border border-slate-700 whitespace-nowrap uppercase tracking-wider">
              {selectedLocationCode}
            </div>
          </div>
        )}

        {/* Highlight Hotspots visually with faint pulsing rings on hover */}
        <div className="absolute inset-0 pointer-events-none">
          {SECTIONS.filter((s) => s.tab === activeTab).map((sec) => (
            <div
              key={sec.code}
              style={{ left: `${sec.defaultX}%`, top: `${sec.defaultY}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <div className="w-3 h-3 rounded-full border border-indigo-400/55 bg-indigo-500/20 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Bagian Kontainer Selector instead of confusing label */}
        <div className="space-y-1">
          <label htmlFor="category-select" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
            Bagian Kontainer (Container Area / Part):
          </label>
          <select
            id="category-select"
            value={activeTab}
            onChange={(e) => {
              const tab = e.target.value as ContainerTab;
              setActiveTab(tab);
              // Auto select first section in this tab
              const firstSec = SECTIONS.find((s) => s.tab === tab);
              if (firstSec) {
                setMarkerPos({ x: firstSec.defaultX, y: firstSec.defaultY });
                onSelectLocation(firstSec.code, firstSec.name);
              }
            }}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 shadow-3xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer font-sans"
          >
            <option value="kiri">KIRI (Left Side)</option>
            <option value="kanan">KANAN (Right Side)</option>
            <option value="depan">DEPAN (Front Panel)</option>
            <option value="atas">ATAS (Top / Roof)</option>
            <option value="belakang">BELAKANG (Back / Rear Doors)</option>
            <option value="interior">INTERIOR (Interior / Floor)</option>
            <option value="unit">UNIT(MESIN) (Machinery / Unit)</option>
          </select>
        </div>

        {/* Quick selection dropdown below */}
        <div className="space-y-1">
          <label htmlFor="location-select" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
            Daftar Titik Lokasi Kontainer:
          </label>
          <select
            id="location-select"
            value={selectedLocationCode}
            onChange={(e) => {
              const sec = SECTIONS.find((s) => s.code === e.target.value);
              if (sec) {
                setMarkerPos({ x: sec.defaultX, y: sec.defaultY });
                onSelectLocation(sec.code, sec.name);
              }
            }}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 shadow-3xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer font-mono"
          >
            <option value="" disabled className="font-sans">-- Pilih Titik Lokasi --</option>
            {SECTIONS.filter((s) => s.tab === activeTab).map((sec) => (
              <option key={sec.code} value={sec.code}>
                {sec.code} - {sec.label.includes("(") ? sec.label.split("(")[0].trim() : sec.label.trim()} ({sec.name})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

