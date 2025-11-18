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
              className="relative bg-[#FEF4AB] text-[#240943] font-semibold px-4 py-1.5 rounded-xl border border-[#240943] shadow-[0_4px_0_0_#240943] transform translate-y-0 transition-all duration-150 hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#240943] active:translate-y-[2px] active:shadow-[0_2px_0_0_#240943] cursor-pointer text-xs sm:text-sm whitespace-nowrap shrink-0 flex items-center gap-1.5"
              style={{
                fontFamily: "var(--font-domine), serif",
              }}
            >
              Ta kontakt
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Disclaimer Alert */}
      <div
        className="border-b"
        style={{ backgroundColor: "rgb(241, 229, 254)" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <p
            className="text-sm"
            style={{
              fontFamily: "var(--font-domine), serif",
              color: "rgb(36, 9, 67)",
            }}
          >
            Dette er en raskt laget prototype for å demonstrere hva som er mulig.
            Feil og problemer kan oppstå.
          </p>
        </div>
      </div>
    </>
  );
}
