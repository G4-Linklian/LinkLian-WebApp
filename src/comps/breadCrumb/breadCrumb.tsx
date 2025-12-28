// components/Breadcrumb/Breadcrumb.tsx
import Link from "next/link";
import { BreadcrumbItem } from "@/utils/interface/breadcrumb.types";

interface Props {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: Props) {
  return (
    <nav style={{ fontSize: 14 }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={index}>
            {!isLast && item.href ? (
              <Link href={item.href}>
                <span style={{ color: "#666", cursor: "pointer" }}>
                  {item.label}
                </span>
              </Link>
            ) : (
              <span style={{ fontWeight: 400 }}>{item.label}</span>
            )}

            {!isLast && <span style={{ margin: "0 8px" }}>{">"}</span>}
          </span>
        );
      })}
    </nav>
  );
}
