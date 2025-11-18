"use client";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ExternalLink, InfoIcon } from "lucide-react";

export function YobrBanner() {
  return (
    <>
      {/* Yobr Banner */}
      <div
        className="border-b shadow-sm"
        style={{ backgroundColor: "rgb(249, 247, 251)" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="font-bold text-xl tracking-tight"
                  style={{
                    fontFamily: "var(--font-domine), serif",
                    color: "rgb(36, 9, 67)",
                  }}
                >
                  Yobr
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded font-medium"
                  style={{
                    backgroundColor: "rgb(241, 229, 254)",
                    color: "rgb(36, 9, 67)",
                  }}
                >
                  Prototype
                </span>
              </div>
              <p
                className="text-sm sm:text-base leading-relaxed"
                style={{
                  fontFamily: "var(--font-domine), serif",
                  color: "rgb(36, 9, 67)",
                }}
              >
                Dette er en rask prototype som demonstrerer{" "}
                <strong>OpenAI Agents Builder</strong> med et verktøy som søker
                i{" "}
                <strong>
                  <a
                    href="https://www.meny.no"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Meny.no
                  </a>
                </strong>{" "}
                sine oppskrifter. Synes du dette er kult og ønsker en prat om
                hvordan vi kan ta i bruk Agents Builder til å lage noe med deg?
              </p>
            </div>
            <a
              href="https://www.yobr.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative bg-[#FEF4AB] text-[#240943] font-semibold px-6 py-2 rounded-xl border border-[#240943] shadow-[0_6px_0_0_#240943] transform translate-y-0 transition-all duration-150 hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#240943] active:translate-y-[4px] active:shadow-[0_2px_0_0_#240943] cursor-pointer text-sm sm:text-base whitespace-nowrap shrink-0 flex items-center gap-2"
              style={{
                fontFamily: "var(--font-domine), serif",
              }}
            >
              Ta kontakt
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Disclaimer Alert */}
      <Alert
        variant="destructive"
        className="rounded-none border-x-0 border-t-0 pl-20"
        style={{
          backgroundColor: "rgb(241, 229, 254)",
          borderColor: "rgb(241, 229, 254)",
        }}
      >
        <AlertDescription
          className="text-sm"
          style={{
            fontFamily: "var(--font-domine), serif",
            color: "rgb(36, 9, 67)",
            marginTop: "2px",
          }}
        >
          Dette er en raskt laget prototype for å demonstrere hva som er mulig.
          Feil og problemer kan oppstå.
        </AlertDescription>
      </Alert>
    </>
  );
}
