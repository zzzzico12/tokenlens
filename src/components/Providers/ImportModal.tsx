import { useRef, useState } from "react";
import { X, Upload, AlertCircle } from "lucide-react";
import { useStore } from "@/store";
import { parseCSV } from "@/providers";

const PROVIDERS = [
  { name: "OpenAI",      color: "#10A37F", steps: "platform.openai.com → Usage → Export" },
  { name: "Anthropic",   color: "#D4A574", steps: "console.anthropic.com → Usage → Export" },
  { name: "Google AI",   color: "#4285F4", steps: "console.cloud.google.com → Billing → Export" },
];

export function ImportModal({ onClose }: { onClose: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addRecords = useStore((s) => s.addRecords);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const firstLine = text.split("\n")[0] ?? "(empty)";
      const parsed = parseCSV(text);
      if (parsed.length > 0) {
        addRecords(parsed);
        onClose();
      } else {
        setError(
          `Could not parse "${file.name}". ` +
          `Detected header: ${firstLine.slice(0, 120)}. ` +
          `Make sure you exported a Usage CSV (not billing summary).`
        );
      }
    };
    reader.readAsText(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface-card border border-surface-border rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
          <h2 className="text-sm font-semibold text-white/90">Import Usage Data</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-surface-border hover:border-accent-purple/50 rounded-lg p-6 text-center cursor-pointer transition-colors group"
          >
            <Upload size={20} className="mx-auto mb-2 text-white/20 group-hover:text-accent-purple/60 transition-colors" />
            <p className="text-sm text-white/40 group-hover:text-white/60 transition-colors">
              Drop CSV here or <span className="text-accent-purple/70">choose file</span>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle size={13} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-red-400/90 leading-relaxed break-all">{error}</p>
            </div>
          )}

          {/* Provider instructions */}
          <div className="space-y-1.5">
            <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider px-0.5">
              How to export
            </p>
            {PROVIDERS.map((p) => (
              <div key={p.name} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface/50">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.color }} />
                <span className="text-xs text-white/50 font-medium w-20 shrink-0">{p.name}</span>
                <span className="text-[11px] text-white/30 font-mono">{p.steps}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
