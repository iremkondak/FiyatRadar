import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400 bg-emerald-400/10">
        <span className="text-2xl text-emerald-400">◉</span>
      </div>

      <span className="text-2xl font-bold text-white">
        Fiyat<span className="text-emerald-400">Radar</span>
      </span>
    </Link>
  );
}