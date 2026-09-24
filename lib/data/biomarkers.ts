import type { BiomarkerMeta, ReferenceRange } from "@/lib/types";

export type BiomarkerWithRange = BiomarkerMeta;

const R = (min: number, max: number): ReferenceRange => ({ min, max });

export const BIOMARKERS: BiomarkerWithRange[] = [
  {
    id: "hba1c",
    name: "Glycated Haemoglobin",
    shortName: "HbA1c",
    category: "Blood Sugar",
    panel: "Diabetes Panel",
    unit: "%",
    range: R(4.0, 5.6),
    layExplanation:
      "HbA1c is your 90-day average blood sugar, recorded in your haemoglobin. Think of it as your sugar report card for the whole quarter — unlike a daily reading, it can't be gamed by skipping dessert yesterday.",
    mechanism:
      "Glucose attaches to haemoglobin inside red blood cells. The more glucose circulating over ~3 months, the higher the percentage that gets glycated. Red cells live about 90 days, so the value reflects long-term exposure.",
    adjustments: [
      "Cut refined carbs (white rice, maida, sugar) before cutting total calories — timing and type matter more than volume.",
      "Walk 10–15 minutes after your two largest meals; post-meal walks blunt glucose spikes measurably.",
      "Aim for 7–8h sleep; short sleep raises fasting glucose through cortisol and appetite hormones.",
      "Add protein to breakfast — it flattens the mid-morning crash that drives cravings.",
    ],
    confidence: "High",
    confidenceNote: "ADA-endorsed diagnostic standard with decades of trial data (DCCT, UKPDS).",
    linkedSpecialties: ["Endocrinology", "General Physician"],
  },
  {
    id: "glucose-fasting",
    name: "Fasting Glucose",
    shortName: "Glucose F",
    category: "Blood Sugar",
    panel: "Diabetes Panel",
    unit: "mg/dL",
    range: R(70, 99),
    layExplanation:
      "Your blood sugar after a 10–12 hour fast — the cleanest single reading of how well your body holds the line overnight.",
    mechanism:
      "Insulin keeps liver glucose output suppressed between meals. When insulin resistance builds, the liver leaks glucose overnight and fasting numbers creep up first.",
    adjustments: [
      "Last meal 3h before bed; late dinners reliably raise next-morning glucose.",
      "Resistance training 2–3x per week increases muscle glucose uptake.",
      "Don't chase a single high reading — track the 2-week trend instead.",
    ],
    confidence: "High",
    confidenceNote: "ADA standard of care, universally used for diabetes screening.",
    linkedSpecialties: ["Endocrinology", "General Physician"],
  },
  {
    id: "ldl",
    name: "LDL Cholesterol",
    shortName: "LDL",
    category: "Cholesterol",
    panel: "Lipid Panel",
    unit: "mg/dL",
    range: R(0, 99),
    layExplanation:
      "The cholesterol particle most responsible for artery plaque. Lower is genuinely better here — this is the one number on your report worth obsessing over.",
    mechanism:
      "LDL particles ferry cholesterol from liver to tissues. When they lodge in injured artery walls they oxidise, trigger inflammation, and form plaque — the root event of most heart attacks.",
    adjustments: [
      "Replace saturated fat (ghee, butter, coconut) with unsaturated (groundnut/mustard oil, nuts, fish).",
      "10g soluble fibre daily (oats, isabgol, beans) can drop LDL 5–10%.",
      "Aerobic exercise raises the protective HDL that helps clear LDL.",
      "Recheck in 3 months if borderline; discuss statin eligibility if persistently high.",
    ],
    confidence: "High",
    confidenceNote: "Causal relationship proven beyond doubt — RCT evidence is as strong as medicine gets.",
    linkedSpecialties: ["Cardiology", "General Physician"],
  },
  {
    id: "hdl",
    name: "HDL Cholesterol",
    shortName: "HDL",
    category: "Cholesterol",
    panel: "Lipid Panel",
    unit: "mg/dL",
    range: R(40, 80),
    alt: { label: "Female", min: 50, max: 90 },
    layExplanation:
      "The scavenger cholesterol — it patrols blood vessels, collects excess cholesterol, and returns it to the liver. Higher is protective up to a point.",
    mechanism:
      "ApoA-I particles accept cholesterol from tissues, mature through the reverse-cholesterol-transport pathway, and deliver it to the liver for disposal or recycling.",
    adjustments: [
      "Aerobic exercise is the most reliable HDL raiser — 150 min/week of brisk activity.",
      "Stopping smoking raises HDL within weeks.",
      "Replacing refined carbs with healthy fats (nuts, olive oil, fish) helps.",
      "Extremely high HDL is no longer considered protective — the relationship flattens.",
    ],
    confidence: "Moderate",
    confidenceNote: "Low HDL predicts risk reliably, but drugs that raise HDL have failed to reduce events — treat it as a marker, not a target.",
    linkedSpecialties: ["Cardiology", "General Physician"],
  },
  {
    id: "triglycerides",
    name: "Triglycerides",
    shortName: "TG",
    category: "Cholesterol",
    panel: "Lipid Panel",
    unit: "mg/dL",
    range: R(0, 150),
    layExplanation:
      "Circulating fat built from excess sugar, alcohol, and refined carbs — the report line most responsive to diet change.",
    mechanism:
      "The liver packages surplus calories as VLDL particles; what they shed in circulation is measured as TG. Insulin resistance floods this pipeline.",
    adjustments: [
      "Cut sugar and refined carbs first — TG responds within weeks.",
      "Zero alcohol is the fastest TG intervention that exists.",
      "Omega-3 (fish 2x per week) reliably lowers TG.",
      "Fasted sample only; a recent meal can triple the reading.",
    ],
    confidence: "High",
    confidenceNote: "Standard lipid analyte; dietary response is repeatedly demonstrated.",
    linkedSpecialties: ["Cardiology", "Endocrinology"],
  },
  {
    id: "creatinine",
    name: "Serum Creatinine",
    shortName: "Creat",
    category: "Kidney",
    panel: "Kidney Panel",
    unit: "mg/dL",
    range: R(0.7, 1.3),
    layExplanation:
      "Muscle waste your kidneys clear around the clock. It's the simplest smoke detector for kidney function — by the time it rises, some filtering capacity is already gone.",
    mechanism:
      "Creatine phosphate in muscle degrades to creatinine at a near-constant rate. It's cleared almost entirely by glomerular filtration, so blood levels rise as filtering slows.",
    adjustments: [
      "Creatinine varies with muscle mass — don't compare your number to a bodybuilder's.",
      "High-protein loads and creatine supplements can nudge it up without kidney damage.",
      "Dehydration concentrates it — test well-hydrated for a fair reading.",
    ],
    confidence: "High",
    confidenceNote: "Universal renal marker for a century; interpretation is nephrology-standard.",
    linkedSpecialties: ["Nephrology", "General Physician"],
  },
  {
    id: "egfr",
    name: "eGFR (Kidney Function)",
    shortName: "eGFR",
    category: "Kidney",
    panel: "Kidney Panel",
    unit: "mL/min/1.73m2",
    range: R(90, 120),
    layExplanation:
      "An estimate of how much blood your kidneys clean per minute. Above 90 is full marks; below 60 sustained means meaningful loss of filtering capacity.",
    mechanism:
      "Calculated from creatinine, age, and sex. Creatinine is muscle waste; kidneys clear it constantly. When filtering slows, creatinine accumulates and eGFR falls.",
    adjustments: [
      "Keep BP below 130/80 — hypertension is the #1 kidney killer after diabetes.",
      "Avoid NSAID painkillers (ibuprofen-type) for routine aches when possible.",
      "Hydrate steadily; both dehydration and overhydration stress kidneys.",
      "Control blood sugar — diabetic kidney disease is the leading cause of dialysis.",
    ],
    confidence: "High",
    confidenceNote: "KDIGO-standard equation, universally reported with creatinine.",
    linkedSpecialties: ["Nephrology", "General Physician"],
  },
  {
    id: "tsh",
    name: "Thyroid Stimulating Hormone",
    shortName: "TSH",
    category: "Thyroid",
    panel: "Thyroid Panel",
    unit: "uIU/mL",
    range: R(0.4, 4.0),
    layExplanation:
      "The thermostat of your metabolism. Your pituitary releases TSH to push the thyroid — high TSH means the thyroid is underperforming, low TSH means it's overactive.",
    mechanism:
      "The pituitary senses circulating thyroid hormone. When levels dip it secretes more TSH to stimulate the thyroid; excess hormone suppresses TSH. It's the most sensitive early indicator of thyroid dysfunction.",
    adjustments: [
      "Test in the morning; TSH peaks overnight and dips after meals.",
      "Biotin supplements (hair vitamins) interfere with the assay — stop 48h before testing.",
      "If on levothyroxine, test 6–8 weeks after any dose change.",
    ],
    confidence: "High",
    confidenceNote: "The single best-studied screening analyte in endocrinology.",
    linkedSpecialties: ["Endocrinology", "General Physician"],
  },
  {
    id: "t3",
    name: "Triiodothyronine",
    shortName: "T3",
    category: "Thyroid",
    panel: "Thyroid Panel",
    unit: "pg/mL",
    range: R(2.3, 4.2),
    layExplanation:
      "The active thyroid hormone, made mostly by converting T4 in tissues. It's what your cells actually burn.",
    mechanism:
      "The thyroid mostly secretes T4; deiodinase enzymes strip an iodine atom to make T3 at the point of use. T3 drives metabolic rate, thermogenesis, and gut motility.",
    adjustments: [
      "Take thyroid medication away from calcium, iron, and soy — they block absorption.",
      "Selenium (Brazil nuts, fish) supports T4-to-T3 conversion.",
      "Crucifers affect thyroid only at extreme intakes — normal amounts are fine.",
    ],
    confidence: "Moderate",
    confidenceNote: "T3 has circadian and assay variability; interpret alongside TSH.",
    linkedSpecialties: ["Endocrinology"],
  },
  {
    id: "vitamin-d",
    name: "Vitamin D (25-OH)",
    shortName: "Vit D",
    category: "Vitamins",
    panel: "Micronutrients",
    unit: "ng/mL",
    range: R(30, 100),
    layExplanation:
      "The sunshine hormone that gates calcium absorption, muscle function, and immune tone. Deficiency is near-universal in urban India.",
    mechanism:
      "UVB converts skin cholesterol to a precursor, the liver hydroxylates it (25-OH is what we measure), and the kidney finishes activation. It regulates hundreds of genes via the VDR receptor.",
    adjustments: [
      "10–15 min midday sun on arms/legs, 3–4x per week — glass blocks UVB, so balcony sun doesn't count.",
      "Take D3 with the largest fat-containing meal; it's fat-soluble or it's not absorbed.",
      "Recheck after 3 months of supplementation; more is not better.",
    ],
    confidence: "High",
    confidenceNote: "Deficiency thresholds are consensus-backed (Endocrine Society); supplementation RCTs in deficient adults are solid.",
    linkedSpecialties: ["Endocrinology", "General Physician"],
  },
  {
    id: "b12",
    name: "Vitamin B12",
    shortName: "B12",
    category: "Vitamins",
    panel: "Micronutrients",
    unit: "pg/mL",
    range: R(200, 900),
    layExplanation:
      "The nerve vitamin — it insulates nerves and builds red cells and DNA. Low B12 often masquerades as fatigue, tingling, or brain fog.",
    mechanism:
      "Absorbed via intrinsic factor in the terminal ileum. Stored for years in the liver, so deficiency reflects long-term low intake or absorption failure (gastritis, metformin, PPIs).",
    adjustments: [
      "If vegetarian, this is the one nutrient you genuinely must supplement.",
      "Dairy and eggs help but rarely fix deficiency alone.",
      "If on metformin long-term, test B12 annually.",
    ],
    confidence: "High",
    confidenceNote: "WHO-recognised deficiency disorder with clear haematological and neurological markers.",
    linkedSpecialties: ["Neurology", "General Physician"],
  },
  {
    id: "hemoglobin",
    name: "Haemoglobin",
    shortName: "Hb",
    category: "Blood Count",
    panel: "CBC",
    unit: "g/dL",
    range: R(13, 17),
    alt: { label: "Female", min: 12, max: 15 },
    layExplanation:
      "The oxygen-carrying cargo capacity of your blood. Low means fatigue and breathlessness; high can mean dehydration or smoking.",
    mechanism:
      "Bone marrow builds red cells using iron, B12, folate, and erythropoietin (a kidney hormone). Any shortage in the chain shows up as anaemia.",
    adjustments: [
      "Pair iron sources (greens, ragi, meat) with vitamin C; tea/coffee within an hour blocks absorption.",
      "Menstruating women should recheck after treating iron, not before.",
      "Persistently high Hb warrants a morning fasting check.",
    ],
    confidence: "High",
    confidenceNote: "WHO anaemia thresholds; century-old, extremely well validated.",
    linkedSpecialties: ["General Physician", "Haematology"],
  },
  {
    id: "wbc",
    name: "White Blood Cell Count",
    shortName: "WBC",
    category: "Blood Count",
    panel: "CBC",
    unit: "/uL",
    range: R(4000, 11000),
    layExplanation:
      "Your immune system's troop count. High usually means active infection or stress; low suggests viral recovery phases or marrow suppression.",
    mechanism:
      "Made in bone marrow, WBCs patrol blood and tissues. Bacterial infections recruit neutrophils (raises count); many viral infections temporarily suppress it.",
    adjustments: [
      "A mildly high count during infection is expected — retest 2–4 weeks after recovery.",
      "Chronic low-grade elevation warrants medical review, not self-treatment.",
      "Cortisone-type medications raise WBC; mention them before testing.",
    ],
    confidence: "High",
    confidenceNote: "Standard haematology reference with wide global consensus.",
    linkedSpecialties: ["General Physician"],
  },
  {
    id: "platelets",
    name: "Platelet Count",
    shortName: "Plt",
    category: "Blood Count",
    panel: "CBC",
    unit: "/uL",
    range: R(150000, 410000),
    layExplanation:
      "Your clotting forces. Low raises bleeding risk; high can reflect inflammation, iron deficiency, or marrow activity.",
    mechanism:
      "Budded off from megakaryocytes in marrow. Cleared by the spleen; inflammation raises counts via thrombopoietin dynamics.",
    adjustments: [
      "Dengue-season lows need medical follow-up, not panic — most recover spontaneously.",
      "Iron deficiency commonly raises counts; fixing iron normalises them.",
      "Avoid aspirin/ibuprofen when counts are very low.",
    ],
    confidence: "High",
    confidenceNote: "Standard haematology reference.",
    linkedSpecialties: ["General Physician", "Haematology"],
  },
  {
    id: "alt",
    name: "ALT (SGPT)",
    shortName: "ALT",
    category: "Liver",
    panel: "Liver Panel",
    unit: "U/L",
    range: R(0, 50),
    alt: { label: "Female", min: 0, max: 35 },
    layExplanation:
      "An enzyme that leaks into blood when liver cells are irritated. Fatty liver is now the most common cause of mildly raised ALT.",
    mechanism:
      "ALT lives inside hepatocytes. When fat, alcohol, viruses, or drugs inflame the liver, membranes leak and serum ALT rises within days.",
    adjustments: [
      "Weight loss of 5–10% is the single best treatment for fatty-liver ALT elevation.",
      "Stop alcohol for 6 weeks and retest — often normalises.",
      "Avoid unnecessary supplements; 'liver tonics' are a common hidden cause.",
    ],
    confidence: "High",
    confidenceNote: "Standard LFT with well-characterised causes of elevation.",
    linkedSpecialties: ["Gastroenterology", "General Physician"],
  },
  {
    id: "bilirubin",
    name: "Total Bilirubin",
    shortName: "Bili",
    category: "Liver",
    panel: "Liver Panel",
    unit: "mg/dL",
    range: R(0.2, 1.2),
    layExplanation:
      "The yellow pigment from recycled red cells. Mildly raised in isolation (Gilbert's) is benign; rising with other LFTs is not.",
    mechanism:
      "Spleen frees haem, liver conjugates it, bile excretes it. Blockage anywhere yellows you: pre-hepatic (excess breakdown), hepatic (liver disease), post-hepatic (stones/obstruction).",
    adjustments: [
      "Fasting can bump Gilbert's — retest fed if mildly high with otherwise normal LFTs.",
      "Rising bilirubin plus dark urine and pale stool means same-week medical review.",
      "Stay hydrated; dehydration concentrates readings mildly.",
    ],
    confidence: "High",
    confidenceNote: "Classic LFT analyte, long-established interpretation.",
    linkedSpecialties: ["Gastroenterology"],
  },
  {
    id: "hs-crp",
    name: "hs-CRP",
    shortName: "hs-CRP",
    category: "Inflammation",
    panel: "Cardiac Risk",
    unit: "mg/L",
    range: R(0, 3),
    layExplanation:
      "A low-grade inflammation barometer for cardiovascular risk. High-normal isn't disease, but it raises the stakes of everything else on the report.",
    mechanism:
      "The liver dumps CRP into blood during systemic inflammation, including the vascular inflammation driven by plaque and visceral fat.",
    adjustments: [
      "Visceral fat is the main driver — waist management beats every supplement.",
      "Periodontal disease raises hs-CRP; dental health is cardiac health.",
      "Retest when well — infection skews it for weeks.",
    ],
    confidence: "Moderate",
    confidenceNote: "Risk-marker validated in cohorts (JUPITER), but it refines rather than replaces standard risk scores.",
    linkedSpecialties: ["Cardiology"],
  },
  {
    id: "ferritin",
    name: "Ferritin",
    shortName: "Ferritin",
    category: "Iron Studies",
    panel: "Iron Panel",
    unit: "ng/mL",
    range: R(30, 300),
    alt: { label: "Female", min: 15, max: 150 },
    layExplanation:
      "Your iron savings account — ferritin is stored iron, and it falls before haemoglobin does. Low ferritin with normal Hb is latent iron deficiency; catch it here.",
    mechanism:
      "Ferritin stores iron inside cells and releases it as needed. Serum ferritin roughly mirrors body iron stores, but it's also an acute-phase reactant — inflammation inflates it.",
    adjustments: [
      "Take iron every other day — daily dosing saturates absorption pathways and works worse.",
      "Iron plus vitamin C in the morning, away from tea, coffee, calcium, and antacids.",
      "If ferritin is high with normal iron saturation, think inflammation first — retest when well.",
    ],
    confidence: "High",
    confidenceNote: "Best single marker of iron stores; interpretation caveats are well characterised.",
    linkedSpecialties: ["General Physician", "Haematology"],
  },
  {
    id: "uric-acid",
    name: "Uric Acid",
    shortName: "Uric Acid",
    category: "Metabolic",
    panel: "Metabolic Panel",
    unit: "mg/dL",
    range: R(3.5, 7.2),
    layExplanation:
      "Purine breakdown product. High levels crystallise in joints (gout) and kidneys (stones) and travel with metabolic syndrome.",
    mechanism:
      "Humans lost the uricase enzyme in evolution, so we excrete uric acid only via the kidneys. Fructose metabolism generates it directly; insulin resistance reduces its excretion.",
    adjustments: [
      "Beer and spirits raise it more than wine; total alcohol matters most.",
      "Fructose-sweetened drinks are the modern driver — cut them first.",
      "Dairy and cherry intake associate with fewer attacks.",
      "Hydrate well; concentrated urine crystallises it.",
    ],
    confidence: "High",
    confidenceNote: "Gout thresholds are rheumatology-standard; asymptomatic hyperuricemia management is debated.",
    linkedSpecialties: ["Rheumatology", "Nephrology"],
  },
];
