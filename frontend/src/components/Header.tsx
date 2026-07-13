interface HeaderProps {
  theme: "dark" | "light";
}

export default function Header({ theme }: HeaderProps) {
  const subText =
    theme === "dark"
      ? "text-slate-400"
      : "text-slate-600";

  return (
    <div className="space-y-5">

      <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1">
        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />

        <span className="text-sm font-medium text-violet-400">
          AI Powered Analytics
        </span>
      </div>

      <div>

        <h1 className="text-6xl font-black tracking-tight bg-gradient-to-r from-violet-500 via-blue-400 to-cyan-300 bg-clip-text text-transparent">

          AI Data Explorer

        </h1>

        <p className={`mt-4 max-w-2xl text-lg ${subText}`}>
          Upload any CSV and instantly
          analyze, summarize, and chat with your data
          using AI.
        </p>

      </div>

    </div>
  );
}