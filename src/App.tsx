import "./App.css";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppContent, AppSideBar, RootLayout } from "@/components";
import { TracksPage, QueuePage } from "@/pages";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <RootLayout className="flex h-screen w-screen gap-4">
              <AppSideBar />
              <AppContent />
            </RootLayout>
          }
        >
          <Route index element={<Navigate to="/tracks" replace />} />
          <Route path="tracks" element={<TracksPage />} />
          <Route path="queue" element={<QueuePage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
