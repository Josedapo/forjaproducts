export default function Logo({ size = "default" }: { size?: "default" | "large" }) {
  const h = size === "large" ? 48 : 36;

  return (
    <img
      src="/logos/forja-logo.png"
      alt="Forja Products"
      height={h}
      style={{ height: h, width: "auto" }}
    />
  );
}
