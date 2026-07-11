import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { messageId, userId } = await request.json();

    if (!messageId || !userId) {
      return Response.json(
        { error: "Message ID and User ID are required" },
        { status: 400 },
      );
    }

    // Only allow deletion if user is the sender
    await sql`
      DELETE FROM messages 
      WHERE id = ${messageId} AND sender_id = ${userId}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete message error:", error);
    return Response.json(
      { error: "Failed to delete message" },
      { status: 500 },
    );
  }
}
