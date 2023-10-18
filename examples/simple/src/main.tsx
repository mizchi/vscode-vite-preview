import "./pre";
import { createRoot } from "react-dom/client";

function App() {
  return <div>hello world</div>;
}
createRoot(document.getElementById("root")!).render(<App />);

