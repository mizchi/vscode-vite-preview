// does not work yet
import { Suspense, lazy } from "react";

const Dep = lazy(() => import('./dep'));

export const __PREVIEW__ = () => {
  return <div>
    <Suspense fallback="...">
      <Dep />
    </Suspense>
  </div>
}