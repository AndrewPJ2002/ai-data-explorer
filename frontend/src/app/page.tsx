"use client";

import { useState } from "react";

import Header from "@/components/Header";
import UploadCard from "@/components/UploadCard";
import DatasetOverview from "@/components/DatasetOverview";
import Histogram from "@/components/Histogram";
import Statistics from "@/components/Statistics";
import DataTable from "@/components/DataTable";
import ThemeToggle from "@/components/ThemeToggle";

import { DatasetResponse } from "@/types/data";

export default function Home() {
  const [data, setData] = useState<DatasetResponse | null>(null);

  const [theme, setTheme] = useState<"dark" | "light">("dark");

  return (
    <main
      className={`min-h-screen transition-all duration-500 ${
        theme === "dark"
          ? "bg-gradient-to-b from-black via-slate-950 to-black text-white"
          : "bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto p-10 space-y-8">

        <div className="flex justify-between items-start">
          <Header theme={theme} />

          <ThemeToggle
            theme={theme}
            setTheme={setTheme}
          />
        </div>

        <UploadCard
          setData={setData}
          theme={theme}
        />

        {data && (
          <>
            <DatasetOverview
              data={data}
              theme={theme}
            />

            <Histogram
              data={data}
              theme={theme}
            />

            <Statistics
              data={data}
              theme={theme}
            />

            <DataTable
              data={data}
              theme={theme}
            />
          </>
        )}
      </div>
    </main>
  );
}