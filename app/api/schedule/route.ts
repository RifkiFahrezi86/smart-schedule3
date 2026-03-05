// app/api/schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runDaily, runWeekly, runMonthly } from "@/lib/scheduler-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, payload } = body;

    // Validate input
    if (!mode || !payload) {
      return NextResponse.json(
        {
          success: false,
          errors: [
            {
              type: "Validation",
              message: "Mode and payload are required",
            },
          ],
        },
        { status: 400 }
      );
    }

    // Run TypeScript scheduler directly (no Python needed)
    let result;

    if (mode === "daily") {
      result = runDaily(payload);
    } else if (mode === "weekly") {
      result = runWeekly(payload);
    } else if (mode === "monthly") {
      result = runMonthly(payload);
    } else {
      result = {
        success: false,
        errors: [{ type: "System", message: `Unknown mode: ${mode}` }],
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Schedule API Error:", error);
    return NextResponse.json(
      {
        success: false,
        errors: [
          {
            type: "System",
            message: error instanceof Error ? error.message : "Internal server error",
          },
        ],
        suggestions: [
          "Periksa koneksi internet Anda",
          "Coba refresh halaman",
          "Hubungi admin jika masalah berlanjut",
        ],
      },
      { status: 500 }
    );
  }
}