import { DatasetResponse } from "@/types/data";

interface Props {
  data: DatasetResponse;
  theme: "dark" | "light";
}

export default function DashboardCards({
  data,
  theme,
}: Props) {

  const card =
    theme === "dark"
      ? "bg-white/5 border-white/10"
      : "bg-white border-slate-200 shadow";

  const totalCells =
    data.row_count * data.column_count;

  const missing = Object.values(
    data.missing_values
  ).reduce((a, b) => a + b, 0);

  const completeness = (
    ((totalCells - missing) /
      totalCells) *
    100
  ).toFixed(1);

  const numeric = data.numeric_columns.length;

  const textColumns =
    data.column_count - numeric;

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">

      <MetricCard
        title="Rows"
        value={data.row_count.toLocaleString()}
        color="from-violet-500 to-fuchsia-500"
        card={card}
      />

      <MetricCard
        title="Columns"
        value={data.column_count}
        color="from-blue-500 to-cyan-500"
        card={card}
      />

      <MetricCard
        title="Numeric"
        value={numeric}
        color="from-emerald-500 to-green-400"
        card={card}
      />

      <MetricCard
        title="Text"
        value={textColumns}
        color="from-orange-500 to-yellow-400"
        card={card}
      />

      <MetricCard
        title="Completeness"
        value={`${completeness}%`}
        color="from-pink-500 to-rose-500"
        card={card}
      />

    </div>
  );
}

interface MetricProps {
  title: string;
  value: string | number;
  color: string;
  card: string;
}

function MetricCard({
  title,
  value,
  color,
  card,
}: MetricProps) {
  return (
    <div
      className={`${card}
      rounded-3xl
      border
      p-6
      transition-all
      duration-300
      hover:-translate-y-1
      hover:shadow-2xl`}
    >

      <div
        className={`h-2 rounded-full bg-gradient-to-r ${color}`}
      />

      <p className="mt-5 text-sm opacity-70">
        {title}
      </p>

      <h2 className="mt-2 text-4xl font-black">
        {value}
      </h2>

    </div>
  );
}