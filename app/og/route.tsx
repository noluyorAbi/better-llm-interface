import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "Intelligent LLM Interface";
    const description =
      searchParams.get("description") ||
      "A modern, intelligent interface for Large Language Model interactions";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000000",
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(26, 26, 26, 0.8) 0%, transparent 60%), radial-gradient(circle at 80% 70%, rgba(10, 10, 10, 0.6) 0%, transparent 60%), linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 100%)",
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.03,
              backgroundImage:
                "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              width: "90%",
              maxWidth: "1000px",
              padding: "80px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  width: "5px",
                  height: "56px",
                  backgroundColor: "#ffffff",
                  marginRight: "20px",
                  borderRadius: "2px",
                }}
              />
              <div
                style={{
                  fontSize: "76px",
                  fontWeight: "800",
                  color: "#ffffff",
                  letterSpacing: "-0.03em",
                  lineHeight: "1.05",
                }}
              >
                {title}
              </div>
            </div>

            <div
              style={{
                fontSize: "30px",
                color: "#b0b0b0",
                fontWeight: "400",
                lineHeight: "1.6",
                maxWidth: "920px",
                marginLeft: "25px",
                marginBottom: "48px",
              }}
            >
              {description}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginLeft: "25px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 16px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  fontSize: "16px",
                  color: "#888888",
                  fontWeight: "500",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#666666",
                    marginRight: "10px",
                  }}
                />
                LMU Bachelor Thesis
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 16px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  fontSize: "16px",
                  color: "#888888",
                  fontWeight: "500",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#666666",
                    marginRight: "10px",
                  }}
                />
                Alperen Adatepe
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 16px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  fontSize: "16px",
                  color: "#888888",
                  fontWeight: "500",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#666666",
                    marginRight: "10px",
                  }}
                />
                Next.js • TypeScript • Supabase
              </div>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "60px",
              right: "80px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "18px",
              color: "#505050",
              fontWeight: "500",
              letterSpacing: "0.02em",
            }}
          >
            <div
              style={{
                width: "2px",
                height: "18px",
                backgroundColor: "#404040",
                borderRadius: "1px",
              }}
            />
            <span style={{ color: "#606060" }}>bt.adatepe.dev</span>
          </div>

          <div
            style={{
              position: "absolute",
              top: "60px",
              left: "80px",
              width: "120px",
              height: "2px",
              background: "linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)",
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    console.error("OG image generation failed:", errorMessage);
    return new Response(`Failed to generate image: ${errorMessage}`, {
      status: 500,
    });
  }
}
