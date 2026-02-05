import "./App.css";
import { AppContent, AppSideBar, RootLayout } from "@/components";

function App() {
  return (
    <RootLayout className="flex h-screen w-screen gap-4">
      <AppSideBar />
      <AppContent />
    </RootLayout>
  );
}

export default App;
