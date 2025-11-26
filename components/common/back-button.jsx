"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";


export const BackButton = ({ href, label }) => {
  return (
    <Button variant="link" className="font-normal w-full" size="sm" asChild>
      <Link href={href}>{label}</Link>
    </Button>
  );
};
