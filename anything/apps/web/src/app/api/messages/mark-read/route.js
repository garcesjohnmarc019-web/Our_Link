import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { userId, partnerId } = await request.json();

    if (!userId || !partnerId) {
      return Response.json(
        { error: "User ID and Partner ID are required" },
        { status: 400 },
      );
    }

    await sql`
      UPDATE messages 
      SET is_read = true, read_at = NOW()
      WHERE receiver_id = ${userId} AND sender_id = ${partnerId} AND is_read = false
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Mark read error:", error);
    return Response.json(
      { error: "Failed to mark messages as read" },
      { status: 500 },
    );
  }
}
