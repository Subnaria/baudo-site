export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ===== CORS =====
    const allowedOrigins = [
      "https://baudo.cscpacman.fr",
      "https://baudo.fr"
    ];

    const origin = request.headers.get("Origin");
    const headers = {
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json; charset=utf-8"
    };

    if (origin && allowedOrigins.includes(origin)) {
      headers["Access-Control-Allow-Origin"] = origin;
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    // ===== ROUTES =====
    if (url.pathname === "/api/subscribers") {
      return getSubscribers(env, headers);
    }

    return new Response(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers }
    );
  }
};

async function getSubscribers(env, headers) {
  try {
    const apiUrl =
      `https://www.googleapis.com/youtube/v3/channels` +
      `?part=statistics&id=${env.CHANNEL_ID}&key=${env.YOUTUBE_API_KEY}`;

    const resp = await fetch(apiUrl);

    if (!resp.ok) {
      const text = await resp.text();
      return new Response(
        JSON.stringify({ error: "YouTube API error", details: text }),
        { status: 502, headers }
      );
    }

    const data = await resp.json();
    const count = Number(
      data?.items?.[0]?.statistics?.subscriberCount || 0
    );

    return new Response(
      JSON.stringify({ subscriberCount: count }),
      { status: 200, headers }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error", message: err.message }),
      { status: 500, headers }
    );
  }
}
