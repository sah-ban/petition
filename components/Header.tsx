"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
export default function Header() {
  const pathname = usePathname();

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo">
          <span>Onchain Petition</span>
        </Link>

        <nav className="nav-links">
          <Link
            href="/"
            className={`nav-link ${pathname === "/" ? "active" : ""}`}
          >
            Explore
          </Link>
          <Link
            href="/create"
            className={`nav-link ${pathname === "/create" ? "active" : ""}`}
          >
            Create
          </Link>
          <Link
            href="/my-petitions"
            className={`nav-link ${pathname === "/my-petitions" ? "active" : ""}`}
          >
            My Petitions
          </Link>
        </nav>

        <div className="header-right">
          <ConnectButton
            chainStatus="icon"
            showBalance={false}
            accountStatus="avatar"
          />
        </div>
      </div>
    </header>
  );
}
