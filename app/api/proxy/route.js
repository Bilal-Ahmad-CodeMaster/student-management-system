export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) return new Response("URL is required", { status: 400 });

  try {
    console.log("Proxy fetching:", imageUrl);

    // Add a signal to prevent infinite pending state
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0...", // Some S3 buckets require a User-Agent
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`S3 responded with ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("Content-Type") || "image/jpeg";

    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour to speed up Face API
      },
    });
  } catch (error) {
    console.error("Proxy Error Details:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
