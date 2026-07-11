import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const {
      senderId,
      receiverId,
      messageType,
      content,
      mediaUrl,
      replyToMessageId,
    } = await request.json();

    if (!senderId || !receiverId) {
      return Response.json(
        { error: "Sender and receiver IDs are required" },
        { status: 400 },
      );
    }

    if (!content && !mediaUrl) {
      return Response.json(
        { error: "Message content or media URL is required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO messages (sender_id, receiver_id, message_type, content, media_url, reply_to_message_id, created_at)
      VALUES (${senderId}, ${receiverId}, ${messageType || "text"}, ${content || null}, ${mediaUrl || null}, ${replyToMessageId || null}, NOW())
      RETURNING id, sender_id, receiver_id, message_type, content, media_url, reply_to_message_id, is_read, created_at
    `;

    return Response.json({ success: true, message: result[0] });
  } catch (error) {
    console.error("Send message error:", error);
    return Response.json({ error: "Failed to send message" }, { status: 500 });
  }
}
