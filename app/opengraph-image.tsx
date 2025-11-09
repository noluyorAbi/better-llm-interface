import { ImageResponse } from "next/og";

export const alt = "Intelligent LLM Interface - Modern AI Interaction Platform";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #020817 0%, #020814 40%, #020817 100%)",
          fontFamily:
            "-apple-system, system-ui, -system-ui, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
          position: "relative",
          overflow: "hidden",
          padding: "0",
        }}
      >
        {/* Radial overlays */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 0% 0%, #111827 0%, transparent 70%)",
            opacity: 0.9,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 100% 40%, #111827 0%, transparent 70%)",
            opacity: 0.9,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 0% 60%, rgba(37, 99, 235, 0.22) 0%, transparent 60%)",
            opacity: 0.7,
          }}
        />

        {/* Blurred abstract shapes */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "340px",
            height: "260px",
            background: "#111827",
            opacity: 0.32,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "110px",
            left: "180px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "#020817",
            opacity: 0.32,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "110px",
            right: "160px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "#020817",
            opacity: 0.32,
          }}
        />

        {/* Fine grid lines */}
        <div
          style={{
            position: "absolute",
            top: "140px",
            left: "260px",
            width: "1px",
            height: "460px",
            background: "#1F2937",
            opacity: 0.15,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "140px",
            left: "380px",
            width: "1px",
            height: "460px",
            background: "#1F2937",
            opacity: 0.15,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "140px",
            left: "500px",
            width: "1px",
            height: "460px",
            background: "#1F2937",
            opacity: 0.15,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "760px",
            width: "360px",
            height: "1px",
            background: "#111827",
            opacity: 0.15,
            transform: "rotate(-45deg)",
            transformOrigin: "0 0",
          }}
        />

        {/* Accent vertical line left */}
        <div
          style={{
            position: "absolute",
            top: "150px",
            left: "120px",
            width: "4px",
            height: "170px",
            background: "linear-gradient(180deg, #2563EB 0%, #22C55E 100%)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            zIndex: 1,
            paddingLeft: "150px",
            paddingTop: "150px",
          }}
        >
          {/* Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "64px",
                fontWeight: "600",
                color: "#F9FAFB",
                letterSpacing: "6px",
                lineHeight: "1.1",
                marginBottom: "5px",
              }}
            >
              INTELLIGENT
            </div>
            <div
              style={{
                fontSize: "64px",
                fontWeight: "600",
                color: "#F9FAFB",
                letterSpacing: "6px",
                lineHeight: "1.1",
              }}
            >
              LLM INTERFACE
            </div>

            {/* Underline */}
            <div
              style={{
                width: "260px",
                height: "2px",
                background: "#4B5563",
                opacity: 0.8,
                marginTop: "15px",
              }}
            />
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "22px",
              fontWeight: "400",
              color: "#9CA3AF",
              lineHeight: "1.6",
              marginTop: "25px",
              marginBottom: "35px",
            }}
          >
            A modern, intelligent interface for Large Language Model interactions
          </div>

          {/* Badges row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            {/* Badge 1 - LMU Bachelor Thesis */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 24px",
                height: "40px",
                background:
                  "linear-gradient(135deg, #020817 0%, #111827 100%)",
                borderRadius: "18px",
                border: "1px solid #111827",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#22C55E",
                  marginRight: "12px",
                }}
              />
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "400",
                  color: "#E5E7EB",
                }}
              >
                LMU Bachelor Thesis
              </span>
            </div>

            {/* Badge 2 - Alperen Adatepe */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 24px",
                height: "40px",
                background:
                  "linear-gradient(135deg, #020817 0%, #111827 100%)",
                borderRadius: "18px",
                border: "1px solid #111827",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#38BDF8",
                  marginRight: "12px",
                }}
              />
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "400",
                  color: "#E5E7EB",
                }}
              >
                Alperen Adatepe
              </span>
            </div>

            {/* Badge 3 - Tech stack */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 24px",
                height: "40px",
                background:
                  "linear-gradient(135deg, #020817 0%, #111827 100%)",
                borderRadius: "18px",
                border: "1px solid #111827",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#F97316",
                  marginRight: "12px",
                }}
              />
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "400",
                  color: "#E5E7EB",
                }}
              >
                Next.js • TypeScript • Supabase
              </span>
            </div>
          </div>
        </div>

        {/* Minimal futuristic accents - lines */}
        <div
          style={{
            position: "absolute",
            top: "420px",
            left: "160px",
            width: "100px",
            height: "40px",
            borderLeft: "1px solid #4B5563",
            borderBottom: "1px solid #4B5563",
            opacity: 0.24,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "180px",
            right: "220px",
            width: "140px",
            height: "40px",
            borderRight: "1px solid #4B5563",
            borderTop: "1px solid #4B5563",
            opacity: 0.24,
          }}
        />

        {/* Minimal futuristic accents - dots */}
        <div
          style={{
            position: "absolute",
            top: "130px",
            left: "220px",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#6B7280",
            opacity: 0.25,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "110px",
            left: "340px",
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: "#6B7280",
            opacity: 0.25,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "260px",
            right: "300px",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#6B7280",
            opacity: 0.25,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "200px",
            right: "160px",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: "#6B7280",
            opacity: 0.25,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}

