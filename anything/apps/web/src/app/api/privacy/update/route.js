import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const {
      userId,
      locationSharingEnabled,
      invisibleMode,
      hideLastSeen,
      disableReadReceipts,
      disableTypingIndicator,
    } = await request.json();

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (locationSharingEnabled !== undefined) {
      updates.push("location_sharing_enabled");
      values.push(locationSharingEnabled);
    }
    if (invisibleMode !== undefined) {
      updates.push("invisible_mode");
      values.push(invisibleMode);
    }
    if (hideLastSeen !== undefined) {
      updates.push("hide_last_seen");
      values.push(hideLastSeen);
    }
    if (disableReadReceipts !== undefined) {
      updates.push("disable_read_receipts");
      values.push(disableReadReceipts);
    }
    if (disableTypingIndicator !== undefined) {
      updates.push("disable_typing_indicator");
      values.push(disableTypingIndicator);
    }

    if (updates.length === 0) {
      return Response.json({ error: "No updates provided" }, { status: 400 });
    }

    // Build SET clause
    const setClause = updates.map((col, i) => `${col} = $${i + 1}`).join(", ");

    await sql(
      `UPDATE privacy_settings SET ${setClause}, updated_at = NOW() WHERE user_id = $${updates.length + 1}`,
      [...values, userId],
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Privacy update error:", error);
    return Response.json(
      { error: "Failed to update privacy settings" },
      { status: 500 },
    );
  }
}
