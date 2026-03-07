"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo">
          <Image
            src="/logo.png"
            alt="Logo"
            width={32}
            height={32}
            style={{ borderRadius: "10%" }}
          />
          <span>BasePetition</span>
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
          <Link
            href="/faq"
            className={`nav-link ${pathname === "/faq" ? "active" : ""}`}
          >
            FAQ
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
