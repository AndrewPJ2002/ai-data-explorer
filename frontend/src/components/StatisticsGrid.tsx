import { DatasetResponse } from "@/types/data";

interface Props {
  data: DatasetResponse;
  theme: "dark" | "light";
}

export default function StatisticsGrid({
  data,
  theme,
}: Props) {

  return (
    <div className="grid lg:grid-cols-2 gap-6">

      {Object.entries(data.statistics).map(
        ([name, stats]) => (

          <div
            key={name}
            className={`rounded-3xl border p-6 ${
              theme === "dark"
                ? "bg-white/5 border-white/10"
                : "bg-white border-slate-200 shadow"
            }`}
          >

            <h2 className="text-xl font-bold mb-5">
              {name}
            </h2>

            <div className="grid grid-cols-3 gap-4">

              <Stat
                label="Mean"
                value={stats.mean}
              />

              <Stat
                label="Min"
                value={stats.min}
              />

              <Stat
                label="Max"
                value={stats.max}
              />

            </div>

          </div>

        )
      )}

    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>

      <p className="text-sm opacity-60">
        {label}
      </p>

      <p className="text-2xl font-bold">
        {value}
      </p>

    </div>
  );
}