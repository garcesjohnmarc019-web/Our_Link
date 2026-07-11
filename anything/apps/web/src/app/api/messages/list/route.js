import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const partnerId = searchParams.get("partnerId");
    const limit = parseInt(searchParams.get("limit") || "100");

    if (!userId || !partnerId) {
      return Response.json(
        { error: "User ID and Partner ID are required" },
        { status: 400 },
      );
    }

    const messages = await sql`
      SELECT 
        m.id,
        m.sender_id,
        m.receiver_id,
        m.message_type,
        m.content,
        m.media_url,
        m.reply_to_message_id,
        m.is_read,
        m.read_at,
        m.created_at,
        rm.content as reply_to_content,
        rm.sender_id as reply_to_sender_id
      FROM messages m
      LEFT JOIN messages rm ON m.reply_to_message_id = rm.id
      WHERE 
        (m.sender_id = ${userId} AND m.receiver_id = ${partnerId})
        OR (m.sender_id = ${partnerId} AND m.receiver_id = ${userId})
      ORDER BY m.created_at DESC
      LIMIT ${limit}
    `;

    return Response.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("List messages error:", error);
    return Response.json({ error: "Failed to list messages" }, { status: 500 });
  }
}
