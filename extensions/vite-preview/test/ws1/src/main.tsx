import "./_pre";
import { useState } from "react";
import {createRoot} from "react-dom/client";

function App() {
  const [counter, setCounter] = useState(0);
  return <div>
    <h1>H1</h1>
    <button type="button" className="bg-slate-400 rounded p-4" onClick={() => {
      setCounter(counter + 1);
      console.log("click");
    }}>{counter} v</button>
  </div>
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <App />
);
