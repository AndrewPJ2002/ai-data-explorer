"use client";

import { useState } from "react";

export default function Home() {
  const [data, setData] = useState<any>(null);

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
    } catch (err) {
      setData({ error: "Failed to connect to backend" });
    }
  };

  // 🚨 ERROR STATE (early return)
  if (data?.error) {
    return (
      <main className="max-w-5xl mx-auto p-10">
        <h1 className="text-red-500 text-xl font-bold">
          Upload Error
        </h1>
        <p>{data.error}</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-10">
      <h1 className="text-4xl font-bold mb-6">
        AI Data Explorer
      </h1>

      <input type="file" accept=".csv" onChange={handleUpload} />

      {/* SUMMARY */}
      {data && (
        <div className="mt-6 mb-6 border rounded-lg p-4">
          <h2 className="text-2xl font-semibold mb-2">
            Dataset Summary
          </h2>

          <div className="flex gap-8">
            <div>
              <p className="text-sm text-gray-500">Rows</p>
              <p className="text-xl font-bold">
                {data.row_count}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Columns</p>
              <p className="text-xl font-bold">
                {data.column_count}
              </p>
            </div>
          </div>

          {/* Missing Values */}
          {data?.missing_values && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">
                Missing Values
              </h2>

              {Object.entries(data.missing_values).map(
                ([column, count]) => (
                  <p key={column}>
                    {column}: {String(count)}
                  </p>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* TABLE */}
      {data?.columns && data?.rows && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mt-4 mb-2">
            Data Preview
          </h2>

          <div className="overflow-x-auto">
            <table className="table-auto border-collapse border border-gray-300">
              <thead>
                <tr>
                  {data?.columns?.map((column: string) => (
                    <th
                      key={column}
                      className="border border-gray-300 px-4 py-2"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {data?.rows?.map((row: any, index: number) => (
                  <tr key={index}>
                    {data?.columns?.map((column: string) => (
                      <td
                        key={column}
                        className="border border-gray-300 px-4 py-2"
                      >
                        {String(row?.[column] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}