import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy initialize Gemini client to avoid crashing on startup if key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables. AI features will fallback to smart local rules.");
      throw new Error("GEMINI_API_KEY_MISSING");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: "20mb" }));

// API 1: Parse voice transcription or natural text in Indonesian
app.post("/api/parse-damage-text", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text prompt is required" });
    }

    let ai;
    try {
      ai = getGeminiClient();
    } catch (err) {
      // Fallback response with simulated parsing if API key is not set
      return res.json({
        success: true,
        fallback: true,
        item: getSimulatedTextParsing(text),
        message: "Menggunakan fallback lokal (API Key belum di-set di Settings)."
      });
    }

    const prompt = `Analisis teks laporan kerusakan kontainer berikut (dalam bahasa Indonesia) dan ubah menjadi data JSON terstruktur untuk EOR (Estimate of Repair).
Teks laporan: "${text}"

Sesuaikan teks tersebut dengan kamus kode standar berikut jika memungkinkan:
1. Komponen (Component):
   - PAA: Panel Assembly (Dinding/Panel samping/Atap)
   - MCO: Cargo Container (Struktur utama)
   - DOOR: Door (Pintu kontainer)
   - FLR: Floor (Lantai kayu/besi)
   - COR: Corner Post (Tiang pojok)
   - ROF: Roof (Atap)
2. Kerusakan (Damage):
   - CH: Corroded/Holed (Karat berlubang)
   - CO: Corroded (Karat biasa)
   - DN: Dent (Penyok)
   - BR: Broken (Patah/Rusak parah)
   - DY: Dirty (Kotor perlu dicuci)
   - LS: Loose (Kendor/Lepas)
3. Perbaikan (Repair):
   - PT: Patch (Tambal plat/welding)
   - WW: Water Wash (Cuci air)
   - SR: Straighten (Luruskan penyok)
   - RP: Replace (Ganti baru)
   - CL: Cleaning (Pembersihan umum)

Kembalikan respon JSON murni yang sesuai dengan skema ini:
{
  "responsibility": "O-OWNER - LESSOR" atau "U-USER - LESSEE" atau "C-CONSIGNEE",
  "description": "Deskripsi singkat dalam bahasa Inggris kapital (contoh: ROOF PANEL DAMAGE atau REAR DOOR DENT)",
  "componentCode": "KODE KOMPONEN (PAA / MCO / DOOR / FLR / COR / ROF)",
  "componentName": "Nama Komponen lengkap (Panel Assembly / Cargo Container / Door / Floor / Corner Post / Roof)",
  "damageCode": "KODE KERUSAKAN (CH / CO / DN / BR / DY / LS)",
  "damageName": "Nama Kerusakan lengkap (Corroded/Holed / Corroded / Dent / Broken / Dirty / Loose)",
  "repairCode": "KODE PERBAIKAN (PT / WW / SR / RP / CL)",
  "repairName": "Nama Perbaikan lengkap (Patch / Water Wash / Straighten / Replace / Cleaning)",
  "locationCode": "Kode lokasi (contoh: TX24, ROOF, DOOR-L, DOOR-R, WALL-L, WALL-R, FLOOR)",
  "locationName": "Nama Lokasi lengkap (contoh: Top Roof, Left Wall Panel, Rear Door)",
  "repairCategory": "S:Square" atau "WT:Wear and Tear",
  "length": angka_panjang_dalam_cm,
  "width": angka_lebar_dalam_cm,
  "qty": angka_jumlah_pcs,
  "hours": estimasi_jam_kerja_orang (contoh: 1.5, default 1),
  "labourCost": estimasi_biaya_tenaga_kerja_usd (rata-rata 1.5 - 5 USD, atau disesuaikan),
  "materialCost": estimasi_biaya_bahan_usd (contoh: 10 - 25 USD, atau disesuaikan),
  "totalCost": total_biaya_dalam_usd (labourCost + materialCost)
}

Berikan JSON saja tanpa penjelasan markdown markdown codeblock.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text || "{}";
    const parsed = JSON.parse(resultText.trim());

    return res.json({
      success: true,
      fallback: false,
      item: parsed
    });
  } catch (error: any) {
    console.error("Error in parse-damage-text:", error);
    return res.status(500).json({ error: error.message || "Failed to parse text via Gemini" });
  }
});

// API 2: Analyze Photo of container or damage
app.post("/api/analyze-container-photo", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Image base64 data is required" });
    }

    let ai;
    try {
      ai = getGeminiClient();
    } catch (err) {
      return res.json({
        success: true,
        fallback: true,
        data: getSimulatedPhotoAnalysis(),
        message: "Menggunakan fallback lokal (API Key belum di-set di Settings)."
      });
    }

    // Clean base64 header if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Data,
      },
    };

    const promptPart = {
      text: `Analisis foto kontainer ini. Foto ini dapat berisi keseluruhan kontainer (sehingga kamu bisa mendeteksi nomor seri kontainer) atau foto jarak dekat dari area kerusakan kontainer.
Lakukan ekstraksi informasi berikut untuk EOR (Estimate of Repair):
1. Nomor seri kontainer (Container Number) jika terlihat di foto. Nomor kontainer standar biasanya memiliki format 4 huruf diikuti oleh 7 angka, contoh: PCIU1467216. Jika tidak ada atau buram, sebutkan NULL.
2. Identifikasi kerusakan jika ini adalah foto bagian yang rusak. 
   - Komponen apa yang rusak? (contoh: Panel samping dinding, Pintu, Atap, Lantai kayu)
   - Apa jenis kerusakannya? (contoh: Karat berlubang, Penyok, Retak, Kotor)
   - Apa saran perbaikannya? (contoh: Tambal/Patch, Luruskan/Straighten, Cuci/Water Wash)
   - Berapa perkiraan dimensi (panjang, lebar dalam cm)?
   
Kembalikan respon JSON murni yang sesuai dengan skema ini:
{
  "containerNo": "NOMOR_KONTAINER" atau null jika tidak terdeteksi,
  "detectedDamage": {
    "hasDamage": true atau false,
    "componentCode": "KODE KOMPONEN (contoh: PAA, DOOR, ROF, FLR, MCO)",
    "componentName": "Nama Komponen lengkap (contoh: Panel Assembly, Door, Roof, Floor, Cargo Container)",
    "damageCode": "KODE KERUSAKAN (contoh: CH, DN, CO, BR, DY)",
    "damageName": "Nama Kerusakan (contoh: Corroded/Holed, Dent, Corroded, Broken, Dirty)",
    "repairCode": "KODE PERBAIKAN (contoh: PT, SR, RP, WW)",
    "repairName": "Nama Perbaikan (contoh: Patch, Straighten, Replace, Water Wash)",
    "locationCode": "Kode lokasi taksiran (contoh: TX24, DOOR-L, ROOF)",
    "locationName": "Nama lokasi (contoh: Panel Samping, Pintu Belakang, Atap)",
    "estimatedLength": angka_panjang_cm,
    "estimatedWidth": angka_lebar_cm,
    "confidenceScore": angka_desimal_0_sampai_100,
    "description": "Deskripsi singkat kerusakan dalam bahasa Inggris kapital"
  }
}

Berikan JSON saja tanpa penjelasan markdown markdown codeblock.`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, promptPart] },
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text || "{}";
    const parsed = JSON.parse(resultText.trim());

    return res.json({
      success: true,
      fallback: false,
      data: parsed
    });
  } catch (error: any) {
    console.error("Error in analyze-container-photo:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze photo via Gemini" });
  }
});

// Fallback logic for offline/non-configured API keys
function getSimulatedTextParsing(text: string) {
  const lower = text.toLowerCase();
  
  let componentCode = "PAA";
  let componentName = "Panel Assembly";
  let damageCode = "DN";
  let damageName = "Dent";
  let repairCode = "SR";
  let repairName = "Straighten";
  let locationCode = "TX24";
  let locationName = "Roof Panel HC";
  let responsibility = "O-OWNER - LESSOR";
  let length = 15;
  let width = 15;
  let qty = 1;

  if (lower.includes("atap") || lower.includes("roof") || lower.includes("genteng")) {
    componentCode = "ROF";
    componentName = "Roof Panel";
    locationCode = "ROOF";
    locationName = "Top Roof Section";
  } else if (lower.includes("pintu") || lower.includes("door")) {
    componentCode = "DOOR";
    componentName = "Rear Door Assembly";
    locationCode = "DOOR-L";
    locationName = "Left Rear Door";
  } else if (lower.includes("lantai") || lower.includes("floor") || lower.includes("alas")) {
    componentCode = "FLR";
    componentName = "Wood Floor Board";
    locationCode = "FLOOR";
    locationName = "Floor Plank No.3";
  }

  if (lower.includes("korosi") || lower.includes("karat") || lower.includes("bolong") || lower.includes("bocor")) {
    damageCode = "CH";
    damageName = "Corroded/Holed";
    repairCode = "PT";
    repairName = "Patch (Tambal Plat)";
  } else if (lower.includes("kotor") || lower.includes("cuci") || lower.includes("bau")) {
    damageCode = "DY";
    damageName = "Dirty";
    repairCode = "WW";
    repairName = "Water Wash (Cuci Air)";
  } else if (lower.includes("patah") || lower.includes("pecah") || lower.includes("hancur")) {
    damageCode = "BR";
    damageName = "Broken / Fractured";
    repairCode = "RP";
    repairName = "Replace Component";
  }

  if (lower.includes("user") || lower.includes("penyewa") || lower.includes("consignee") || lower.includes("pelanggan")) {
    responsibility = "U-USER - LESSEE";
  }

  // Regex extract numbers for length/width
  const dimensions = text.match(/(\d+)\s*(x|kali|by)\s*(\d+)/i);
  if (dimensions) {
    length = parseInt(dimensions[1]);
    width = parseInt(dimensions[3]);
  } else {
    const singleNumbers = text.match(/\d+/g);
    if (singleNumbers && singleNumbers.length >= 2) {
      length = parseInt(singleNumbers[0]);
      width = parseInt(singleNumbers[1]);
    }
  }

  const hours = length > 30 ? 2.5 : 1.5;
  const labourCost = hours * 1.5;
  const materialCost = length > 30 ? 25.0 : 14.4;
  const totalCost = labourCost + materialCost;

  return {
    responsibility,
    description: `${componentName.toUpperCase()} ${damageName.toUpperCase()}`,
    componentCode,
    componentName,
    damageCode,
    damageName,
    repairCode,
    repairName,
    locationCode,
    locationName,
    repairCategory: "S:Square",
    length,
    width,
    qty,
    hours,
    labourCost,
    materialCost,
    totalCost
  };
}

function getSimulatedPhotoAnalysis() {
  // Let's randomize a bit to make simulated experience feel alive
  const prefixes = ["PCIU", "TGBU", "GESU", "DFSU"];
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomSerial = Math.floor(1000000 + Math.random() * 9000000);
  const containerNo = `${randomPrefix}${randomSerial}`;

  const damages = [
    {
      componentCode: "PAA",
      componentName: "Panel Assembly",
      damageCode: "CH",
      damageName: "Corroded/Holed",
      repairCode: "PT",
      repairName: "Patch",
      locationCode: "TX24",
      locationName: "Left Wall Side Panel",
      estimatedLength: 25,
      estimatedWidth: 20,
      description: "CORRODED HOLE ON LEFT WALL PANEL",
    },
    {
      componentCode: "DOOR",
      componentName: "Door Assembly",
      damageCode: "DN",
      damageName: "Dent",
      repairCode: "SR",
      repairName: "Straighten",
      locationCode: "DOOR-R",
      locationName: "Right Rear Door Panel",
      estimatedLength: 45,
      estimatedWidth: 30,
      description: "MEDIUM DENT ON RIGHT REAR DOOR PANEL",
    },
    {
      componentCode: "MCO",
      componentName: "Cargo Container Structure",
      damageCode: "DY",
      damageName: "Dirty",
      repairCode: "WW",
      repairName: "Water Wash",
      locationCode: "FLOOR",
      locationName: "Floor Surface",
      estimatedLength: 200,
      estimatedWidth: 100,
      description: "CONTAINER INTERIOR REQUIRING WATER WASH",
    }
  ];

  const selectedDamage = damages[Math.floor(Math.random() * damages.length)];

  return {
    containerNo,
    detectedDamage: {
      hasDamage: true,
      ...selectedDamage,
      confidenceScore: 88.5
    }
  };
}

// Vite and Static File Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    // Catch-all route to serve spa
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EOR Kontainer Mobile Server is running on port ${PORT}`);
  });
}

startServer();
