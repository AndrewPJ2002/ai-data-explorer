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
      const response = await fetch(
        "http://127.0.0.1:8000/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      setData(result);
    } catch (error) {
      setData({
        error: "Failed to connect to backend",
      });
    }
  };

  if (data?.error) {
    return (
      <main className="max-w-5xl mx-auto p-10">
        <h1 className="text-red-500 text-2xl font-bold">
          Upload Error
        </h1>

        <p className="mt-2">{data.error}</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-10">
      <h1 className="text-4xl font-bold mb-6">
        AI Data Explorer
      </h1>

      <input
        type="file"
        accept=".csv"
        onChange={handleUpload}
      />

      {data && (
        <div className="mt-6 mb-6 border rounded-lg p-4">
          <h2 className="text-2xl font-semibold mb-4">
            Dataset Summary
          </h2>

          <div className="flex gap-10">
            <div>
              <p className="text-sm text-white-500">Rows</p>
              <p className="text-xl font-bold">
                {data.row_count}
              </p>
            </div>

            <div>
              <p className="text-sm text-white-500">Columns</p>
              <p className="text-xl font-bold">
                {data.column_count}
              </p>
            </div>
          </div>

          {data?.missing_values && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">
                Missing Values
              </h3>

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

      {data?.statistics &&
        Object.keys(data.statistics).length > 0 && (
          <div className="mt-6 mb-6 border rounded-lg p-4">
            <h2 className="text-2xl font-semibold mb-4">
              Statistics
            </h2>

            {Object.entries(data.statistics).map(
              ([column, stats]: [string, any]) => (
                <div key={column} className="mb-4">
                  <h3 className="text-lg font-bold">
                    {column}
                  </h3>

                  <p>Mean: {stats.mean}</p>
                  <p>Min: {stats.min}</p>
                  <p>Max: {stats.max}</p>
                </div>
              )
            )}
          </div>
        )}

      {data?.columns && data?.rows && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-2">
            Data Preview
          </h2>

          <div className="overflow-x-auto">
            <table className="table-auto border-collapse border border-gray-300">
              <thead>
                <tr>
                  {data.columns.map((column: string) => (
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
                {data.rows.map(
                  (row: any, index: number) => (
                    <tr key={index}>
                      {data.columns.map(
                        (column: string) => (
                          <td
                            key={column}
                            className="border border-gray-300 px-4 py-2"
                          >
                            {String(
                              row[column] ?? ""
                            )}
                          </td>
                        )
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}