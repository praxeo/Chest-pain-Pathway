import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

/**
 * Chest‑Pain Evaluation Pathway – MDCalc‑style interface
 * Logic:
 *   1. STEMI? → Activate protocol
 *   2. Ischemic ECG? → Treat as NSTE‑ACS
 *   3. Troponin rapid rule‑out / rule‑in
 *   4. HEART‑score risk stratification
 */

const YesNoToggle = ({ label, value, setValue }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm">{label}</span>
    <div className="space-x-2">
      <Button
        variant={value === "no" ? "default" : "outline"}
        onClick={() => setValue("no")}
      >
        No
      </Button>
      <Button
        variant={value === "yes" ? "default" : "outline"}
        onClick={() => setValue("yes")}
      >
        Yes
      </Button>
    </div>
  </div>
);

export default function ChestPainPathway() {
  // Form state
  const [stemi, setStemi] = useState("no");
  const [ischemicECG, setIschemicECG] = useState("no");
  const [symptom3h, setSymptom3h] = useState("yes");
  const [cTn0, setCTn0] = useState("");
  const [cTn2h, setCTn2h] = useState("");
  const [heart, setHeart] = useState("");

  const result = useMemo(() => {
    // 1. STEMI
    if (stemi === "yes")
      return {
        title: "STEMI detected",
        msg: "Activate STEMI protocol immediately.",
        style: "bg-red-600 text-white",
      };

    // 2. Ischemic ECG
    if (ischemicECG === "yes")
      return {
        title: "Ischemic ECG changes",
        msg: "Treat as NSTE‑ACS, admit/observe with cardiology consult.",
        style: "bg-yellow-600 text-white",
      };

    // Parse troponins
    const t0 = parseFloat(cTn0);
    const t2 = parseFloat(cTn2h);
    if (!Number.isFinite(t0)) return null; // need baseline

    // 3a. Rapid rule‑out
    if (
      ((symptom3h === "yes" && t0 < 3) ||
        (symptom3h === "no" && Number.isFinite(t2) && t0 < 3 && t2 < 3)) &&
      Math.abs(t2 - t0) < 2
    )
      return {
        title: "Rapid Rule‑Out",
        msg: "hs‑cTn consistently <3 ng/L → discharge / PCP follow‑up ≤14 d.",
        style: "bg-emerald-600 text-white",
      };

    // 3b. Rule‑in
    if (t0 > 88 || (Number.isFinite(t2) && Math.abs(t2 - t0) >= 22))
      return {
        title: "Troponin Rule‑In",
        msg: "Marked elevation or Δ≥22 ng/L → cardiology consult & admit.",
        style: "bg-red-600 text-white",
      };

    // 4. HEART score branch
    const h = parseInt(heart, 10);
    if (Number.isFinite(h)) {
      if (h <= 3)
        return {
          title: "Low Risk (HEART 0‑3)",
          msg: "Discharge; PCP / PDC follow‑up ≤14 d.",
          style: "bg-emerald-600 text-white",
        };
      if (h >= 7)
        return {
          title: "High Risk (HEART ≥7)",
          msg: "Admit (medicine or cardiology).",
          style: "bg-red-600 text-white",
        };
      return {
        title: "Intermediate Risk (HEART 4‑6)",
        msg: "Observe for serial troponin / CTA or stress testing.",
        style: "bg-yellow-600 text-white",
      };
    }
    return null;
  }, [stemi, ischemicECG, symptom3h, cTn0, cTn2h, heart]);

  return (
    <Card className="max-w-xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Chest‑Pain Pathway (MDCalc style)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* binary inputs */}
        <YesNoToggle label="ST‑Elevation (STEMI)" value={stemi} setValue={setStemi} />
        <YesNoToggle label="Ischemic ECG changes" value={ischemicECG} setValue={setIschemicECG} />
        <Separator />
        <YesNoToggle
          label="Symptom onset ≥3 h ago"
          value={symptom3h}
          setValue={setSymptom3h}
        />

        {/* Troponins */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1">hs‑cTn 0 h (ng/L)</label>
            <Input value={cTn0} onChange={(e) => setCTn0(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs mb-1">hs‑cTn 2 h (ng/L)</label>
            <Input value={cTn2h} onChange={(e) => setCTn2h(e.target.value)} />
          </div>
        </div>

        {/* HEART */}
        <div>
          <label className="block text-xs mb-1">HEART score (0‑10)</label>
          <Input value={heart} onChange={(e) => setHeart(e.target.value)} />
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-lg p-4 text-center font-semibold ${result.style}`}>
            <h3 className="text-lg mb-1">{result.title}</h3>
            <p className="text-sm leading-relaxed">{result.msg}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
