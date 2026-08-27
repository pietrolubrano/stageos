"use client";

import dynamic from "next/dynamic";

const StageOSPrototype = dynamic(
  () => import("@/components/stageos-prototype").then((module) => module.StageOSPrototype),
  {
    ssr: false,
    loading: () => (
      <main className="grid min-h-screen place-items-center text-slate-400">
        Caricamento StageOS
      </main>
    )
  }
);

export default function Home() {
  return <StageOSPrototype />;
}
