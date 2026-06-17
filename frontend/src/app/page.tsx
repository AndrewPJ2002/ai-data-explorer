"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    if (saved) setTheme(saved);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setData(result);
    } catch (error) {
      setData({ error: "Failed to connect to backend" });
    }
  };

  const bg = theme === "dark"
    ? "bg-gradient-to-b from-black via-slate-950 to-black text-white"
    : "bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900";

  const card = theme === "dark"
    ? "bg-white/5 border-white/10"
    : "bg-white border-slate-200 shadow-md";

  const subText = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <main className={`min-h-screen p-10 transition-all ${bg}`}>
      <div className="max-w-6xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-6xl font-black bg-gradient-to-r from-violet-400 via-blue-300 to-fuchsia-300 bg-clip-text text-transparent">
              AI Data Explorer
            </h1>

            <p className={subText}>
              Upload a CSV. Explore instantly. Switch themes freely.
            </p>
          </div>

          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-xl border transition ${
              theme === "dark"
                ? "border-white/20 bg-white/5 hover:bg-white/10"
                : "border-slate-300 bg-white hover:bg-slate-100"
            }`}
          >
            {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>

        {/* UPLOAD */}
        <div className={`${card} backdrop-blur-xl rounded-3xl p-10 text-center`}>
          <input
            type="file"
            accept=".csv"
            onChange={handleUpload}
            className={`
              block mx-auto w-full max-w-md text-sm cursor-pointer
              ${theme === "dark" ? "text-slate-300" : "text-slate-700"}
            `}
          />
        </div>

        {/* SUMMARY */}
        {data && (
          <div className={`${card} backdrop-blur-xl rounded-3xl p-8 space-y-6`}>

            <h2 className="text-2xl font-semibold">
              Dataset Overview
            </h2>

            <div className="flex gap-16">
              <div>
                <p className={subText}>Rows</p>
                <p className="text-4xl font-bold text-violet-400">
                  {data.row_count}
                </p>
              </div>

              <div>
                <p className={subText}>Columns</p>
                <p className="text-4xl font-bold text-blue-400">
                  {data.column_count}
                </p>
              </div>
            </div>

            {data?.missing_values && (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Missing Values
                </h3>

                <div className="space-y-1">
                  {Object.entries(data.missing_values).map(
                    ([column, count]: any) => (
                      <p key={column}>
                        <span className="font-medium">{column}</span>
                        {" → "}
                        {String(count)}
                      </p>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CHART */}
        {data?.chart_data?.length > 0 && (
          <div className={`${card} backdrop-blur-xl rounded-3xl p-8 space-y-4`}>

            <h2 className="text-2xl font-semibold">
              Distribution Chart
            </h2>

            <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chart_data}>
                  <CartesianGrid
                    stroke={theme === "dark" ? "#1f2937" : "#e5e7eb"}
                    strokeDasharray="4 4"
                  />

                  <XAxis
                    dataKey="name"
                    stroke={theme === "dark" ? "#cbd5e1" : "#374151"}
                  />

                  <YAxis
                    stroke={theme === "dark" ? "#cbd5e1" : "#374151"}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        theme === "dark" ? "#0b0f19" : "#ffffff",
                      border: "1px solid #ccc",
                      borderRadius: "12px",
                      color: theme === "dark" ? "#fff" : "#111",
                    }}
                  />

                  <Bar
                    dataKey="value"
                    fill="#8b5cf6"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* STATISTICS */}
        {data?.statistics &&
          Object.keys(data.statistics).length > 0 && (
            <div className={`${card} backdrop-blur-xl rounded-3xl p-8 space-y-6`}>

              <h2 className="text-2xl font-semibold">
                Statistics
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(data.statistics).map(
                  ([column, stats]: any) => (
                    <div
                      key={column}
                      className={`rounded-2xl p-5 border ${
                        theme === "dark"
                          ? "bg-white/5 border-white/10"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <h3 className="text-violet-400 font-semibold mb-3">
                        {column}
                      </h3>

                      <p>Mean: {stats.mean}</p>
                      <p>Min: {stats.min}</p>
                      <p>Max: {stats.max}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        {/* TABLE */}
        {data?.columns && data?.rows && (
          <div className={`${card} backdrop-blur-xl rounded-3xl p-8 space-y-4`}>

            <h2 className="text-2xl font-semibold">
              Data Preview
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    {data.columns.map((column: string) => (
                      <th
                        key={column}
                        className={`px-4 py-3 text-left border ${
                          theme === "dark"
                            ? "bg-white/10 border-white/10 text-white"
                            : "bg-slate-100 border-slate-200 text-slate-800"
                        }`}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {data.rows.map((row: any, index: number) => (
                    <tr
                      key={index}
                      className="hover:bg-violet-500/10 transition"
                    >
                      {data.columns.map((column: string) => (
                        <td
                          key={column}
                          className={`px-4 py-3 border ${
                            theme === "dark"
                              ? "border-white/10 text-slate-200"
                              : "border-slate-200 text-slate-700"
                          }`}
                        >
                          {String(row[column] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}