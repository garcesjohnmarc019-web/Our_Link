import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    await sql`
      UPDATE users 
      SET is_online = false, last_seen = NOW()
      WHERE id = ${userId}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json({ error: "Logout failed" }, { status: 500 });
  }
}
