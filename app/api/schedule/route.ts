import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { mode, payload } = await request.json();

    if (!mode || !payload) {
      return NextResponse.json(
        { success: false, errors: [{ type: "System", message: "Missing parameters" }] },
        { status: 400 }
      );
    }

    // Path to Python script
    const pythonScript = path.join(process.cwd(), "python", "main.py");
    
    // Prepare payload
    const payloadJson = JSON.stringify(payload).replace(/"/g, '\\"');
    
    // Execute Python script
    const command = `python3 "${pythonScript}" "${mode}" "${payloadJson}"`;
    
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    });

    if (stderr && !stdout) {
      console.error("Python error:", stderr);
      return NextResponse.json(
        {
          success: false,
          errors: [{ type: "System", message: "Scheduler execution failed" }],
        },
        { status: 500 }
      );
    }

    // Parse Python output
    const result = JSON.parse(stdout);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        success: false,
        errors: [
          {
            type: "System",
            message: error.message || "Internal server error",
          },
        ],
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "Use POST method to run scheduler" },
    { status: 405 }
  );
}