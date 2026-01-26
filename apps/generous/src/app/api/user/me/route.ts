import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";

// GET /api/user/me - Get current authenticated user
export async function GET() {
  const auth = getAuth();
  const headersList = await headers();

  try {
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return Response.json(
        {
          authenticated: false,
          user: null,
        },
        { status: 401 },
      );
    }

    return Response.json({
      authenticated: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        emailVerified: session.user.emailVerified,
        createdAt: session.user.createdAt,
      },
      session: {
        id: session.session.id,
        expiresAt: session.session.expiresAt,
      },
    });
  } catch {
    return Response.json(
      {
        authenticated: false,
        user: null,
      },
      { status: 401 },
    );
  }
}
