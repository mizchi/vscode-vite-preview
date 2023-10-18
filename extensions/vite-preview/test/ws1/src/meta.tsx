// import "./_pre";
import { createRoot } from "react-dom/client";

if (import.meta.env.MODE === 'preview') {
  await import("./_pre");
  const root = createRoot(document.getElementById("preview-root")!);
  root.render(<div className="text-3xl">xxx</div>);
}
