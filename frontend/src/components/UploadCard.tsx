"use client";

import { uploadCSV } from "@/lib/api";
import { DatasetResponse } from "@/types/data";

interface Props {
  theme: "dark" | "light";
  setData: React.Dispatch<
    React.SetStateAction<DatasetResponse | null>
  >;
}

export default function UploadCard({
  theme,
  setData,
}: Props) {
  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const result = await uploadCSV(file);
      setData(result);
    } catch {
      alert("Upload failed.");
    }
  }

  return (
    <div
      className={`rounded-3xl border backdrop-blur-xl p-12 text-center transition ${
        theme === "dark"
          ? "bg-white/5 border-white/10"
          : "bg-white border-slate-200 shadow-lg"
      }`}
    >
      <div className="space-y-4">

        <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 flex items-center justify-center text-4xl">

          📊

        </div>

        <div>

          <h2 className="text-2xl font-bold">
            Upload your dataset
          </h2>

          <p
            className={
              theme === "dark"
                ? "text-slate-400"
                : "text-slate-600"
            }
          >
            Drag and drop coming soon.
          </p>

        </div>

        <input
          type="file"
          accept=".csv"
          onChange={handleUpload}
          className={`mx-auto block max-w-md cursor-pointer rounded-xl border p-4 ${
            theme === "dark"
              ? "border-white/10 bg-white/5"
              : "border-slate-300 bg-white"
          }`}
        />

      </div>
    </div>
  );
}