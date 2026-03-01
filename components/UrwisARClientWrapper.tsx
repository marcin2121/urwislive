"use client";

import dynamic from "next/dynamic";

const UrwisAR = dynamic(() => import("@/components/urwisek/UrwisAR"), { ssr: false });

export default function UrwisARClientWrapper() {
  return <UrwisAR />;
}
