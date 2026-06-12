import Link from "next/link";
import { breadcrumbJsonLd, JsonLd } from "./json-ld";

/** Breadcrumb „Start → Seite" mit BreadcrumbList-Schema (alle Unterseiten). */
export function Breadcrumbs({ name, path }: { name: string; path: string }) {
  return (
    <>
      <nav aria-label="Brotkrumen" className="container-site pt-4 text-sm text-muted-foreground">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:underline">
              Start
            </Link>
          </li>
          <li aria-hidden="true">→</li>
          <li aria-current="page" className="font-semibold text-brand">
            {name}
          </li>
        </ol>
      </nav>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Start", path: "/" },
          { name, path },
        ])}
      />
    </>
  );
}
