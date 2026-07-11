import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const {
      userId,
      displayName,
      phoneNumber,
      email,
      statusMessage,
      profilePictureUrl,
    } = await request.json();

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (displayName !== undefined) {
      updates.push("display_name");
      values.push(displayName);
    }
    if (phoneNumber !== undefined) {
      updates.push("phone_number");
      values.push(phoneNumber);
    }
    if (email !== undefined) {
      updates.push("email");
      values.push(email);
    }
    if (statusMessage !== undefined) {
      updates.push("status_message");
      values.push(statusMessage);
    }
    if (profilePictureUrl !== undefined) {
      updates.push("profile_picture_url");
      values.push(profilePictureUrl);
    }

    if (updates.length === 0) {
      return Response.json({ error: "No updates provided" }, { status: 400 });
    }

    // Build SET clause
    const setClause = updates.map((col, i) => `${col} = $${i + 1}`).join(", ");

    await sql(
      `UPDATE users SET ${setClause} WHERE id = $${updates.length + 1}`,
      [...values, userId],
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return Response.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
