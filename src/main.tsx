import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Configure status bar after app mounts (for native platforms)
import("./services/statusBarService").then(({ configureStatusBar }) => {
  configureStatusBar();
});
