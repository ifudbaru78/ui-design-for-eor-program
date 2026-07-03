import { PresetDamage, EORDocument } from "./types";

export const PRINCIPALS = [
  "PIL - PACIFIC INTERNATIONAL LINES INDONESIA",
  "MSK - MAERSK LINE",
  "CMA - CMA CGM",
  "ONE - OCEAN NETWORK EXPRESS",
  "MSC - MEDITERRANEAN SHIPPING COMPANY",
  "HMM - HYUNDAI MERCHANT MARINE"
];

export const SIZES_TYPES = [
  "20 GP - General Purpose",
  "40 GP - General Purpose",
  "40 HC - High Cube",
  "20 OT - Open Top",
  "40 FR - Flat Rack",
  "20 RF - Reefer"
];

export const MATERIALS = [
  "STEEL",
  "ALUMINUM",
  "CORTEN STEEL",
  "FIBERGLASS"
];

export const CRITERIA_OPTIONS = [
  "WW - WATER WASHING",
  "SR - SWEEPING",
  "CW - CHEMICAL WASH",
  "DF - DEGREASING / ODOR ELIMINATION"
];

export const COMPONENTS = [
  { code: "PAA", name: "Panel Assembly (Dinding Samping)" },
  { code: "MCO", name: "Cargo Container (Struktur Utama)" },
  { code: "DOOR", name: "Rear Door Assembly (Pintu)" },
  { code: "FLR", name: "Wood Floor Board (Lantai)" },
  { code: "COR", name: "Corner Post (Tiang Pojok)" },
  { code: "ROF", name: "Roof Panel (Atap)" },
  { code: "GOL", name: "Gooseneck Tunnel" },
  { code: "ULR", name: "Understructure (Rangka Bawah)" }
];

export const DAMAGES = [
  { code: "CH", name: "Corroded/Holed (Karat Berlubang)" },
  { code: "CO", name: "Corroded (Karat Biasa)" },
  { code: "DN", name: "Dent (Penyok)" },
  { code: "BR", name: "Broken / Fractured (Patah)" },
  { code: "DY", name: "Dirty (Kotor)" },
  { code: "LS", name: "Loose / Separated (Kendor)" },
  { code: "MS", name: "Missing (Hilang)" },
  { code: "CT", name: "Cut / Split (Robek)" }
];

export const REPAIRS = [
  { code: "PT", name: "Patch (Tambal Plat)" },
  { code: "WW", name: "Water Wash (Cuci Air)" },
  { code: "SR", name: "Straighten (Luruskan)" },
  { code: "RP", name: "Replace Component (Ganti)" },
  { code: "CL", name: "Cleaning (Pembersihan Umum)" },
  { code: "WD", name: "Welding Repair (Las)" },
  { code: "RF", name: "Refit / Tighten (Kencangkan)" }
];

export const LOCATIONS = [
  // KIRI (Left)
  { code: "L-WALL", name: "Left Side Wall Panel" },
  { code: "L-BTM-RAIL", name: "Left Side Bottom Rail" },
  { code: "L-TOP-RAIL", name: "Left Side Top Rail" },
  { code: "CORNER-FL", name: "Front Left Corner Post" },
  { code: "CORNER-RL", name: "Rear Left Corner Post" },
  
  // KANAN (Right)
  { code: "R-WALL", name: "Right Side Wall Panel" },
  { code: "R-BTM-RAIL", name: "Right Side Bottom Rail" },
  { code: "R-TOP-RAIL", name: "Right Side Top Rail" },
  { code: "CORNER-FR", name: "Front Right Corner Post" },
  { code: "CORNER-RR", name: "Rear Right Corner Post" },

  // DEPAN (Front)
  { code: "FRONT-PANEL", name: "Front End Wall Panel" },
  { code: "FRONT-BTM", name: "Front Bottom Rail" },
  { code: "FRONT-TOP", name: "Front Top Rail" },

  // ATAS (Top / Roof)
  { code: "ROOF", name: "Roof Panel General Area" },
  { code: "ROOF-BOW", name: "Roof Bow Support" },

  // BELAKANG (Back / Rear Doors)
  { code: "DOOR-L", name: "Left Rear Door Sheet" },
  { code: "DOOR-R", name: "Right Rear Door Sheet" },
  { code: "REAR-HDR", name: "Rear Top Header" },
  { code: "REAR-SILL", name: "Rear Door Sill" },

  // INTERIOR (Interior / Floor)
  { code: "FLOOR-F", name: "Front Floor Panel" },
  { code: "FLOOR-C", name: "Center Floor Panel" },
  { code: "FLOOR-R", name: "Rear Floor Panel" },
  { code: "UNDER-X", name: "Understructure Crossmembers" },

  // UNIT(MESIN) (Machinery / Unit)
  { code: "COMPRESSOR", name: "Reefer Compressor Unit" },
  { code: "EVAPORATOR", name: "Evaporator Unit" },
  { code: "CONDENSER", name: "Condenser Unit" },
  { code: "CTRL-BOX", name: "Controller Panel Box" }
];

export const PRESET_DAMAGES: PresetDamage[] = [
  {
    id: "preset-1",
    label: "Tambal Dinding Samping Berlubang (PAA - CH - PT)",
    componentCode: "PAA",
    componentName: "Panel Assembly",
    damageCode: "CH",
    damageName: "Corroded/Holed",
    repairCode: "PT",
    repairName: "Patch",
    locationCode: "TX24",
    locationName: "Left Side Wall - Panel 24",
    defaultLength: 15,
    defaultWidth: 15,
    defaultQty: 3,
    defaultManHoursRate: 1.5,
    defaultHours: 1.5,
    defaultLabourCost: 2.25,
    defaultMaterialCost: 14.4,
    defaultTotalCost: 16.65
  },
  {
    id: "preset-2",
    label: "Cuci Kontainer Kotor (MCO - DY - WW)",
    componentCode: "MCO",
    componentName: "Cargo Container",
    damageCode: "DY",
    damageName: "Dirty",
    repairCode: "WW",
    repairName: "Water Wash",
    locationCode: "FLOOR-C",
    locationName: "Center Floor Panel",
    defaultLength: 0,
    defaultWidth: 0,
    defaultQty: 1,
    defaultManHoursRate: 0,
    defaultHours: 0,
    defaultLabourCost: 0,
    defaultMaterialCost: 10.0,
    defaultTotalCost: 10.0
  },
  {
    id: "preset-3",
    label: "Luruskan Pintu Penyok (DOOR - DN - SR)",
    componentCode: "DOOR",
    componentName: "Rear Door Assembly",
    damageCode: "DN",
    damageName: "Dent",
    repairCode: "SR",
    repairName: "Straighten",
    locationCode: "DOOR-R",
    locationName: "Right Rear Door Sheet",
    defaultLength: 30,
    defaultWidth: 20,
    defaultQty: 1,
    defaultManHoursRate: 2.0,
    defaultHours: 2.0,
    defaultLabourCost: 3.0,
    defaultMaterialCost: 5.0,
    defaultTotalCost: 8.0
  },
  {
    id: "preset-4",
    label: "Ganti Lantai Kayu Lapuk (FLR - BR - RP)",
    componentCode: "FLR",
    componentName: "Wood Floor Board",
    damageCode: "BR",
    damageName: "Broken / Fractured",
    repairCode: "RP",
    repairName: "Replace Component",
    locationCode: "FLOOR-F",
    locationName: "Front Floor Panel",
    defaultLength: 120,
    defaultWidth: 30,
    defaultQty: 1,
    defaultManHoursRate: 3.5,
    defaultHours: 3.5,
    defaultLabourCost: 5.25,
    defaultMaterialCost: 45.0,
    defaultTotalCost: 50.25
  },
  {
    id: "preset-5",
    label: "Las Rangka Bawah Retak (ULR - BR - WD)",
    componentCode: "ULR",
    componentName: "Understructure",
    damageCode: "BR",
    damageName: "Broken / Fractured",
    repairCode: "WD",
    repairName: "Welding Repair",
    locationCode: "FLOOR-C",
    locationName: "Center Floor Panel",
    defaultLength: 10,
    defaultWidth: 1,
    defaultQty: 1,
    defaultManHoursRate: 1.5,
    defaultHours: 1.5,
    defaultLabourCost: 2.25,
    defaultMaterialCost: 8.0,
    defaultTotalCost: 10.25
  }
];

export const INITIAL_EORS: EORDocument[] = [
  {
    id: "E20260686241F52",
    principal: "PIL - PACIFIC INTERNATIONAL LINES INDONESIA",
    noEor: "E20260686241F52",
    eorDate: "2026-06-25",
    noBl: "BTU600031600",
    transactId: "I20260653759VNF",
    vesselName: "HYUNDAI UNITY",
    voyage: "0182S",
    customerName: "PT. PAKOAKUINA",
    mnrStatus: "WAITING APPROVED",
    paymentStatus: "UNPAID",
    entryBy: "YANTO",
    entryDate: "2026-06-25 07:47",
    
    containerNo: "PCIU1467216",
    sizeType: "20 GP - General Purpose",
    material: "STEEL",
    condition: "DM",
    ownership: "OWNER - LESSOR",
    criteria: "WW - WATER WASHING",
    
    dateOfSurvey: "2026-06-25",
    dateOfInterchange: "2026-06-25",
    timeOfInterchange: "05:14",
    remark: "Ada karat berlubang di panel samping kiri, perlu cuci dalam kontainer karena kotor sisa muatan kayu.",
    
    items: [
      {
        id: "item-101",
        responsibility: "O-OWNER - LESSOR",
        description: "ROOF PANEL HC",
        componentCode: "PAA",
        componentName: "Panel Assembly",
        damageCode: "CH",
        damageName: "Corroded/Holed",
        repairCode: "PT",
        repairName: "Patch",
        locationCode: "TX24",
        locationName: "Left Side Wall - Panel 24",
        repairCategory: "S:Square",
        length: 15,
        width: 15,
        qty: 3,
        divisionCode: "DIV-A",
        manHoursRate: 1.5,
        hours: 1.5,
        labourCost: 2.25,
        materialCost: 14.4,
        totalCost: 16.65
      },
      {
        id: "item-102",
        responsibility: "O-OWNER - LESSOR",
        description: "CARGO CONTAINER CLEANING",
        componentCode: "MCO",
        componentName: "Cargo Container",
        damageCode: "DY",
        damageName: "Dirty",
        repairCode: "WW",
        repairName: "Water Wash",
        locationCode: "FLOOR-C",
        locationName: "Center Floor Panel",
        repairCategory: "WT:Wear and Tear",
        length: 0,
        width: 0,
        qty: 1,
        divisionCode: "DIV-B",
        manHoursRate: 0,
        hours: 0,
        labourCost: 0,
        materialCost: 10.0,
        totalCost: 10.0
      }
    ],
    totalLabourCost: 2.25,
    totalMaterialCost: 24.4,
    totalCost: 26.65,
    currency: "USD",
    exchangeRate: 16000
  },
  {
    id: "E20260711904X12",
    principal: "MSK - MAERSK LINE",
    noEor: "E20260711904X12",
    eorDate: "2026-07-01",
    noBl: "MSK900142100",
    transactId: "I20260700142MSK",
    vesselName: "MAERSK MC-KINNEY MOLLER",
    voyage: "2408W",
    customerName: "PT. INDORAYA LOGISTIK",
    mnrStatus: "APPROVED",
    paymentStatus: "PAID",
    entryBy: "YUSUF",
    entryDate: "2026-07-01 14:32",
    
    containerNo: "MSKU8829104",
    sizeType: "40 HC - High Cube",
    material: "CORTEN STEEL",
    condition: "DM",
    ownership: "OWNER - LESSOR",
    criteria: "WW - WATER WASHING",
    
    dateOfSurvey: "2026-07-01",
    dateOfInterchange: "2026-07-01",
    timeOfInterchange: "11:20",
    remark: "Penyok pintu belakang akibat benturan forklift, struktur engsel masih aman.",
    
    items: [
      {
        id: "item-201",
        responsibility: "U-USER - LESSEE",
        description: "REAR DOOR SHEET DENT",
        componentCode: "DOOR",
        componentName: "Rear Door Assembly",
        damageCode: "DN",
        damageName: "Dent",
        repairCode: "SR",
        repairName: "Straighten",
        locationCode: "DOOR-R",
        locationName: "Right Rear Door Sheet",
        repairCategory: "S:Square",
        length: 45,
        width: 30,
        qty: 1,
        divisionCode: "DIV-M",
        manHoursRate: 2.0,
        hours: 2.0,
        labourCost: 3.0,
        materialCost: 5.0,
        totalCost: 8.0
      }
    ],
    totalLabourCost: 3.0,
    totalMaterialCost: 5.0,
    totalCost: 8.0,
    currency: "USD",
    exchangeRate: 16000
  }
];
