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

    const response = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    setData(result);
  };

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">
        AI Data Explorer 🚀
      </h1>

      <input
        type="file"
        accept=".csv"
        onChange={handleUpload}
      />

      {data && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">
            Columns
          </h2>

          <pre>{JSON.stringify(data.columns, null, 2)}</pre>

          <h2 className="text-xl font-semibold mt-4 mb-2">
            Rows
          </h2>

          <pre>{JSON.stringify(data.rows, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}