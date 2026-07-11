import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const settings = await sql`
      SELECT 
        location_sharing_enabled,
        invisible_mode,
        hide_last_seen,
        disable_read_receipts,
        disable_typing_indicator
      FROM privacy_settings
      WHERE user_id = ${userId}
    `;

    return Response.json({ settings: settings[0] || null });
  } catch (error) {
    console.error("Get privacy settings error:", error);
    return Response.json(
      { error: "Failed to get privacy settings" },
      { status: 500 },
    );
  }
}
