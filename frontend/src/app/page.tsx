"use client";

import { useState } from "react";

import Header from "@/components/Header";
import UploadCard from "@/components/UploadCard";


import StatisticsGrid from "@/components/StatisticsGrid";

import ThemeToggle from "@/components/ThemeToggle";
import DashboardCards from "@/components/DashboardCards";

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
            <DashboardCards
                data={data}
                theme={theme}
            />
        )}

        {data?.statistics && (
            <StatisticsGrid
                data={data}
                theme={theme}
            />
        )}
      </div>
    </main>
  );
}