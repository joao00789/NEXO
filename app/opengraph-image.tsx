import { ImageResponse } from "next/og";

export const alt =
  "NEXO — plataforma gratuita e gamificada de preparação para o ENEM";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 76px",
          backgroundColor: "#0A0A0B",
          color: "#F5F5F5",
          fontFamily: "Arial, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 480,
            height: 480,
            right: -130,
            top: 70,
            borderRadius: 240,
            backgroundColor: "#111A33",
            border: "1px solid #202C4A",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 290,
            height: 290,
            right: -30,
            top: 165,
            borderRadius: 145,
            backgroundColor: "#14244C",
            border: "1px solid #2E6BFF",
            opacity: 0.8,
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 16,
              backgroundColor: "#2E6BFF",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            N
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 5 }}>
            NEXO
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            maxWidth: 760,
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#8EACFF",
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            Sua jornada até o ENEM
          </div>
          <div
            style={{
              fontSize: 66,
              lineHeight: 1.12,
              fontWeight: 700,
              letterSpacing: -2,
            }}
          >
            Aprenda no seu ritmo. Chegue mais longe.
          </div>
          <div
            style={{
              color: "#9A9CA3",
              fontSize: 25,
              lineHeight: 1.4,
            }}
          >
            Estudo gratuito, personalizado e gamificado para transformar sua
            preparação.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#9A9CA3",
            fontSize: 20,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: "#2E6BFF",
            }}
          />
          Plataforma gratuita de preparação para o ENEM
        </div>
      </div>
    ),
    size,
  );
}
