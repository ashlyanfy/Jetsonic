import { Suspense } from "react";
import { AnalyticsView } from "./analytics-view";

export default function AnalyticsPage() {
  return (
    <Suspense fallback={null}>
      <AnalyticsView />
    </Suspense>
  );
}
