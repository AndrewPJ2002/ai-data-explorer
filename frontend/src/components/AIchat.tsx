"use client";

import { askAI } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  theme: "dark" | "light";
  question: string;
  setQuestion: (q: string) => void;
  answer: string;
  setAnswer: (a: string) => void;
  loading: boolean;
  setLoading: (b: boolean) => void;
}

export default function AIChat({
  theme,
  question,
  setQuestion,
  answer,
  setAnswer,
  loading,
  setLoading,
}: Props) {
  async function handleAsk() {
    if (!question.trim()) return;

    setLoading(true);

    try {
      const result = await askAI(question);
      setAnswer(result.answer);
    } catch {
      setAnswer("Unable to contact AI.");
    }

    setLoading(false);
  }

  return (
    <div
      className={`rounded-3xl border p-8 backdrop-blur-xl ${
        theme === "dark"
          ? "bg-white/5 border-white/10"
          : "bg-white border-slate-200 shadow-lg"
      }`}
    >
      <h2 className="text-2xl font-bold mb-5">
        🤖 AI Dataset Assistant
      </h2>

      <textarea
        rows={4}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask anything about your dataset..."
        className={`w-full rounded-xl p-4 border resize-none ${
          theme === "dark"
            ? "bg-black/20 border-white/10 text-white"
            : "bg-white border-slate-300"
        }`}
      />

      <button
        onClick={handleAsk}
        disabled={loading}
        className="mt-4 rounded-xl bg-violet-600 hover:bg-violet-700 px-6 py-3 font-semibold transition"
      >
        {loading ? "Thinking..." : "Ask AI"}
      </button>

      {answer && (
        <div
          className={`mt-6 rounded-xl p-5 ${
            theme === "dark"
              ? "bg-black/30"
              : "bg-slate-100"
          }`}
        >
          <h3 className="font-semibold mb-2">
            AI Response
          </h3>

          <div
            className={`prose max-w-none ${
                theme === "dark"
                ? "prose-invert prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white prose-li:text-slate-300"
                : "prose-slate"
            }`}
            >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {answer}
            </ReactMarkdown>
            </div>
        </div>
      )}
    </div>
  );
}