export default function Logo({ size = "default", variant = "dark" }: { size?: "default" | "large"; variant?: "dark" | "light" }) {
  const iconSize = size === "large" ? 32 : 20;
  const textClass = size === "large" ? "text-2xl" : "text-lg";
  const hammerColor = variant === "light" ? "#a3b8ff" : "#4f6df5";
  const anvilColor = variant === "light" ? "#ffffff" : "#1a1d27";
  const sparkColor = "#fbbf24";

  return (
    <div className="flex items-center gap-2">
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="10" y="2" width="4" height="8" rx="1" fill={hammerColor} />
        <rect x="6" y="3" width="12" height="4" rx="1.5" fill={hammerColor} />
        <path d="M3 14C3 12.8954 3.89543 12 5 12H19C20.1046 12 21 12.8954 21 14V15H3V14Z" fill={anvilColor} />
        <path d="M6 15H18V18C18 19.1046 17.1046 20 16 20H8C6.89543 20 6 19.1046 6 18V15Z" fill={anvilColor} />
        <path d="M19 12H22C22.5523 12 23 12.4477 23 13V13C23 13.5523 22.5523 14 22 14H21V12Z" fill={anvilColor} />
        <circle cx="7" cy="8" r="1" fill={sparkColor} />
        <circle cx="5" cy="6" r="0.7" fill={sparkColor} opacity="0.7" />
      </svg>

      <span className={`${textClass} font-bold tracking-tight`}>
        <span style={{ color: variant === "light" ? "#a3b8ff" : "#4f6df5" }}>Forja</span>
        <span style={{ color: variant === "light" ? "#ffffff" : "#1a1d27" }}> Products</span>
      </span>
    </div>
  );
}
