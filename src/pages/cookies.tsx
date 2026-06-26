import React from "react";
import { LegalLayout, LegalSection } from "@/components/legal-layout";
import { Info } from "lucide-react";

export default function CookiePolicyPage() {
  const sections: LegalSection[] = [
    {
      id: "definition",
      title: "1. What are Cookies?",
      content: (
        <div className="space-y-4">
          <p>
            Cookies are miniature text files downloaded and saved securely onto your computer, tablet, or smartphone when you access, login, or configure the <strong>SME OS (formerly OBOY YANKEE ENTERPRISE)</strong> web console. Cookies allow our servers to recognize your active identity, track session validation periods, and preserve configuration preferences (such as your visual theme).
          </p>
          <p>
            Cookies can be either "persistent" (remaining on your machine until deleted or expired) or "session" (cleared automatically the moment you close your web browser).
          </p>
        </div>
      )
    },
    {
      id: "essential",
      title: "2. Essential Cookies",
      content: (
        <div className="space-y-4">
          <p>
            Essential cookies are strictly required to authorize access, prevent security exploits, and run the core transactional processes of our POS terminal. The platform cannot function without these files, and disabling them will block you from accessing the application interfaces:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Authentication & Sessions:</strong> We utilize first-party secure authentication tokens (JWTs) via cookies to verify who you are, keep your cashier session active while drafting receipts, and prevent unauthorized account Hijacking.
            </li>
            <li>
              <strong>CSFR Protections:</strong> Dual-layer validation cookies are injected to defend our submission endpoints from cross-site scripting (XSS) and request forgery (CSRF) vectors.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "analytics",
      title: "3. Analytics & Diagnostics Cookies",
      content: (
        <div className="space-y-4">
          <p>
            Analytics cookies compile aggregate data regarding how administrative accounts configure inventories, toggle checkout menus, and navigate billing menus. They help us isolate slow API endpoints, troubleshoot UI lag, and understand how to refine user interfaces.
          </p>
          <p>
            Our analytics integrations compile anonymized telemetry (pixel ratios, browser brands, latency indexes, navigation flows) and are completely restricted from reading inventory values, customer credit records, or secret employee pins.
          </p>
        </div>
      )
    },
    {
      id: "preferences",
      title: "4. Preference Storage & Experience",
      content: (
        <div className="space-y-4">
          <p>
            Preference cookies remember customization choices you select, sparing you from repeatedly re-configuring the application layouts on every login:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Visual Theme:</strong> Retains your selection between Light Mode and High-Contrast Dark Mode inside `sme-os-theme` client-side keys.
            </li>
            <li>
              <strong>Dashboard Layouts:</strong> Remembers your preferred grid arrangements, calendar view selections (weekly vs. monthly graphs), and default print ticket setups.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "transparency",
      title: "5. Tracking Transparency & Control",
      content: (
        <div className="space-y-4">
          <p>
            SME OS operates with absolute transparency. We do not incorporate intrusive cross-site advertising, market profiling trackers, or third-party retargeting scripts into our enterprise software.
          </p>
          <p>
            If you wish to limit cookie operations, you can modify your web browser's native settings to block, reject, or wipe cookies instantly. However, disabling all cookies will prevent you from signing in to your SME OS admin consoles and will disable the POS interface.
          </p>
        </div>
      )
    }
  ];

  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle="Session Control, Cryptographic CSRF Guards, and Telemetry Transparency Rules"
      description="This sub-policy defines how SME OS utilizes light-weight first-party cookies and modern browser storage tools to organize authentication layers, safeguard checkout tasks, and optimize interface performance."
      version="v1.2"
      effectiveDate="May 21, 2026"
      sections={sections}
      icon={<Info className="h-6 w-6" />}
    />
  );
}
