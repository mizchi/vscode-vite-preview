import Dep from "./dep";

export default function Sub() {
  const onClick = () => {
    const x = 2;
  }
  return <>
    <h1 className="text-3xl font-bold underline">
      Hello world 2!
    </h1>
    <button onClick={onClick}>start debugger</button>
    <Dep />
  </>
}

const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
worker.postMessage("hello");

// import "./global.css";
// import {createRoot} from "react-dom/client"
// if (import.meta.env.PREVIEW) {
//   const root = createRoot(document.getElementById('preview-root')!).render(
//     <Sub />
//   );
// }