import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { username, pin } = await request.json();

    if (!username || !pin) {
      return Response.json(
        { error: "Username and PIN are required" },
        { status: 400 },
      );
    }

    // Query user
    const users = await sql`
      SELECT id, username, display_name, profile_picture_url, phone_number, email, status_message
      FROM users 
      WHERE username = ${username.toUpperCase()} AND pin = ${pin}
    `;

    if (users.length === 0) {
      return Response.json(
        { error: "Invalid username or PIN" },
        { status: 401 },
      );
    }

    const user = users[0];

    // Update online status
    await sql`
      UPDATE users 
      SET is_online = true, last_seen = NOW()
      WHERE id = ${user.id}
    `;

    return Response.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        profilePicture: user.profile_picture_url,
        phoneNumber: user.phone_number,
        email: user.email,
        statusMessage: user.status_message,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
