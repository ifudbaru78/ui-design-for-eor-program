export interface EORDocument {
  id: string; // Internal local storage ID or EOR Number
  principal: string;
  noEor: string;
  eorDate: string;
  noBl: string;
  transactId: string;
  vesselName: string;
  voyage: string;
  customerName: string;
  mnrStatus: 'DRAFT' | 'WAITING APPROVED' | 'APPROVED' | 'REJECTED';
  paymentStatus?: 'PAID' | 'UNPAID'; // Paid/Unpaid Status
  entryBy: string;
  entryDate: string;
  
  // Container Details
  containerNo: string;
  sizeType: string; // 20 GP, 40 HC, etc.
  material: string; // STEEL, ALUMINUM
  condition: string; // DM (Damage), GD (Good)
  ownership: string; // OWNER, LESSOR, LESSEE
  criteria: string; // WW (Water Washing), SW (Sweeping), etc.
  
  // Event Dates
  dateOfSurvey: string;
  dateOfInterchange: string;
  timeOfInterchange: string;
  remark: string;
  
  // Damage Items list
  items: EORDamageItem[];
  
  // Overall Financial Summary
  totalLabourCost: number;
  totalMaterialCost: number;
  totalCost: number;
  currency: 'USD' | 'IDR';
  exchangeRate: number; // e.g. 16000
}

export interface EORDamageItem {
  id: string; // Unique item ID
  responsibility: string; // OWNER - LESSOR, CONSIGNEE - LESSEE, etc.
  description: string; // e.g. ROOF PANEL HC
  componentCode: string; // e.g. PAA
  componentName: string; // e.g. Panel Assembly
  damageCode: string; // e.g. CH
  damageName: string; // e.g. Corroded/Holed
  repairCode: string; // e.g. PT
  repairName: string; // e.g. Patch
  locationCode: string; // e.g. TX24
  locationName: string; // e.g. Left Wall Panel
  repairCategory: string; // WT:Wear and Tear, etc.
  repairType?: string; // S:Square, etc.
  length: number;
  width: number;
  qty: number;
  divisionCode: string;
  
  // Pricing/Estimates
  manHoursRate: number; // Price per Man-Hour or base factor
  hours: number;
  labourCost: number;
  materialCost: number;
  totalCost: number;
}

export interface PresetDamage {
  id: string;
  label: string;
  componentCode: string;
  componentName: string;
  damageCode: string;
  damageName: string;
  repairCode: string;
  repairName: string;
  locationCode: string;
  locationName: string;
  defaultLength: number;
  defaultWidth: number;
  defaultQty: number;
  defaultManHoursRate: number;
  defaultHours: number;
  defaultLabourCost: number;
  defaultMaterialCost: number;
  defaultTotalCost: number;
}
