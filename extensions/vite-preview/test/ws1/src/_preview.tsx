import "./global.css";
import { createRoot } from "react-dom/client";
const root = createRoot(document.getElementById("preview-root")!);

function PreviewLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: 4 }}>{children}</div>;
}

export function preview(element: React.ReactElement) {
  root.render(<PreviewLayout>{element}</PreviewLayout>);
}
