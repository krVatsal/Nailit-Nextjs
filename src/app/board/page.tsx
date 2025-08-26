"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const SprintBoard = dynamic(() => import("../../components/SprintBoard"), { ssr: false });

export default function BoardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, [router]);

  return <SprintBoard />;
}
