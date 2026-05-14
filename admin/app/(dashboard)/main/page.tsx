import { Suspense } from "react";
import { MainView } from "./main-view";

export default function MainPage() {
  return (
    <Suspense fallback={null}>
      <MainView />
    </Suspense>
  );
}
