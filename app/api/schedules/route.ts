import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// GET - Fetch saved schedules
export async function GET() {
  try {
    const userId = 1; // TODO: Get from auth session

    const { rows } = await sql`
      SELECT 
        id,
        user_id as "userId",
        schedule_type as "scheduleType",
        title,
        status,
        config_data as "configData",
        result_data as "resultData",
        created_at as "createdAt"
      FROM schedules
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    return NextResponse.json({ schedules: rows });
  } catch (error: any) {
    console.error("GET schedules error:", error);
    // Return empty array if table doesn't exist yet
    return NextResponse.json({ schedules: [] });
  }
}

// POST - Save a new schedule
export async function POST(request: NextRequest) {
  try {
    const userId = 1; // TODO: Get from auth session
    const body = await request.json();
    const { scheduleType, title, config, result } = body;

    if (!scheduleType || !title) {
      return NextResponse.json(
        { error: "Schedule type and title are required" },
        { status: 400 }
      );
    }

    const { rows } = await sql`
      INSERT INTO schedules (
        user_id,
        schedule_type,
        title,
        status,
        config_data,
        result_data
      )
      VALUES (
        ${userId},
        ${scheduleType},
        ${title},
        'success',
        ${JSON.stringify(config || {})},
        ${JSON.stringify(result || {})}
      )
      RETURNING id, schedule_type as "scheduleType", title, status, created_at as "createdAt"
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: any) {
    console.error("POST schedules error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save schedule" },
      { status: 500 }
    );
  }
}
