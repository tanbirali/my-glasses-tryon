import { GlassesTryOnStudio } from "../features/glasses-tryon/GlassesTryOnStudio";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <GlassesTryOnStudio />

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        Powered By<Link href="/" style={{ textDecoration: "none", color: "blue" }}>
          Ultimate Coder
        </Link>
      </div>
    </div>
  );
}