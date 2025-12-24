import { createRoot } from "react-dom/client";
import App from "./App";
import "./tailwind.css";
import "./bubble-fix.css";

// Initialize Supabase Analytics
import { initializeAnalytics } from "./lib/analytics";
initializeAnalytics();

createRoot(document.getElementById("root")!).render(<App />);