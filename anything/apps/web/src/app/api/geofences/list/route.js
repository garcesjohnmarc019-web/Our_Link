import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const geofences = await sql`
      SELECT 
        id,
        user_id,
        name,
        latitude,
        longitude,
        radius_meters,
        created_at
      FROM geofences
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    return Response.json({ geofences });
  } catch (error) {
    console.error("List geofences error:", error);
    return Response.json(
      { error: "Failed to list geofences" },
      { status: 500 },
    );
  }
}
