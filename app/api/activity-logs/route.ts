import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api";

export async function GET(request: Request) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get user role to check permissions
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    let query = supabase
      .from("activity_logs")
      .select(`
        *,
        user_profile:profiles!user_id(name, email)
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Role-based filtering
    if (profile?.role === "sales_rep") {
      // Sales reps can only see their own activity logs
      query = query.eq("user_id", user.id);
    } else if (userId && profile?.role === "admin") {
      // Admins can filter by specific user
      query = query.eq("user_id", userId);
    }
    // If no userId specified and user is admin, show all logs

    const { data: activities, error } = await query;

    if (error) {
      console.error("Error fetching activity logs:", error);
      return NextResponse.json(
        { error: "Failed to fetch activity logs" },
        { status: 500 }
      );
    }

    return NextResponse.json({ activities });

  } catch (error) {
    console.error("Error in activity-logs GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const supabase = await createClient();
    const body = await request.json();
    const { action, entity_type, entity_id, metadata } = body;

    // Validate required fields
    if (!action || !entity_type) {
      return NextResponse.json(
        { error: "Action and entity_type are required" },
        { status: 400 }
      );
    }

    // Get client IP and user agent for audit trail
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Log the activity
    const { data: activity, error: logError } = await supabase
      .from("activity_logs")
      .insert({
        user_id: user.id,
        action,
        entity_type,
        entity_id: entity_id || null,
        metadata: metadata || null,
        ip_address: ip,
        user_agent: userAgent
      })
      .select()
      .single();

    if (logError) {
      console.error("Error logging activity:", logError);
      return NextResponse.json(
        { error: "Failed to log activity" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: "Activity logged successfully",
      activity 
    });

  } catch (error) {
    console.error("Error in activity-logs POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}