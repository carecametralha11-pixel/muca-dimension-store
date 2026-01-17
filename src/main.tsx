import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { configureStatusBar } from "./services/statusBarService";

// Configure status bar for native apps
configureStatusBar();

createRoot(document.getElementById("root")!).render(<App />);
