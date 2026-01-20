import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// GET - Fetch important dates for a date range
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const userId = 1; // TODO: Get from auth session

    if (!start || !end) {
      return NextResponse.json(
        { error: "Start and end dates are required" },
        { status: 400 }
      );
    }

    const { rows } = await sql`
      SELECT 
        id,
        user_id as "userId",
        date,
        title,
        description,
        color,
        is_all_day as "isAllDay",
        start_time as "startTime",
        end_time as "endTime"
      FROM important_dates
      WHERE user_id = ${userId}
        AND date >= ${start}::date
        AND date <= ${end}::date
      ORDER BY date ASC
    `;

    return NextResponse.json({ dates: rows });
  } catch (error: any) {
    console.error("GET important-dates error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch important dates" },
      { status: 500 }
    );
  }
}

// POST - Create new important date
export async function POST(request: NextRequest) {
  try {
    const userId = 1; // TODO: Get from auth session
    const body = await request.json();
    const { date, title, description, color, isAllDay, startTime, endTime } = body;

    if (!date || !title) {
      return NextResponse.json(
        { error: "Date and title are required" },
        { status: 400 }
      );
    }

    const { rows } = await sql`
      INSERT INTO important_dates (
        user_id, 
        date, 
        title, 
        description, 
        color, 
        is_all_day, 
        start_time, 
        end_time
      )
      VALUES (
        ${userId},
        ${date}::date,
        ${title},
        ${description || null},
        ${color || "#ef4444"},
        ${isAllDay !== false},
        ${!isAllDay && startTime ? startTime : null},
        ${!isAllDay && endTime ? endTime : null}
      )
      RETURNING 
        id,
        user_id as "userId",
        date,
        title,
        description,
        color,
        is_all_day as "isAllDay",
        start_time as "startTime",
        end_time as "endTime"
    `;

    return NextResponse.json({ date: rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error("POST important-dates error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create important date" },
      { status: 500 }
    );
  }
}

// DELETE - Remove important date
export async function DELETE(request: NextRequest) {
  try {
    const userId = 1; // TODO: Get from auth session
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await sql`
      DELETE FROM important_dates
      WHERE id = ${id} AND user_id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE important-dates error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete important date" },
      { status: 500 }
    );
  }
}