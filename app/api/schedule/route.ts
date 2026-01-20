// app/api/schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

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

    // Call Python scheduler
    const result = await runPythonScheduler(mode, payload);

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

/**
 * Run Python scheduler script
 */
function runPythonScheduler(mode: string, payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonPath = process.env.PYTHON_PATH || "python3";
    const scriptPath = path.join(process.cwd(), "python", "main.py");

    console.log("Running Python scheduler:", { mode, pythonPath, scriptPath });

    const pythonProcess = spawn(pythonPath, [
      scriptPath,
      mode,
      JSON.stringify(payload),
    ]);

    let dataString = "";
    let errorString = "";

    pythonProcess.stdout.on("data", (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorString += data.toString();
      console.error("Python Error:", data.toString());
    });

    pythonProcess.on("close", (code) => {
      console.log("Python process closed with code:", code);
      console.log("Python output:", dataString);

      if (code !== 0) {
        console.error("Python stderr:", errorString);
        resolve({
          success: false,
          errors: [
            {
              type: "Python",
              message: errorString || "Python script execution failed",
            },
          ],
          suggestions: [
            "Pastikan Python terinstall dengan benar",
            "Periksa dependencies Python (datetime)",
            "Coba jalankan script manual: python3 python/main.py",
          ],
        });
        return;
      }

      try {
        const result = JSON.parse(dataString);
        resolve(result);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Raw output:", dataString);
        resolve({
          success: false,
          errors: [
            {
              type: "Parse",
              message: "Failed to parse Python output",
            },
          ],
          suggestions: [
            "Periksa format output Python",
            "Pastikan Python mengembalikan valid JSON",
          ],
        });
      }
    });

    pythonProcess.on("error", (error) => {
      console.error("Failed to start Python process:", error);
      reject({
        success: false,
        errors: [
          {
            type: "System",
            message: `Failed to start Python: ${error.message}`,
          },
        ],
        suggestions: [
          "Pastikan Python terinstall (python3 --version)",
          "Set PYTHON_PATH di environment variables",
          "Install Python jika belum ada",
        ],
      });
    });
  });
}