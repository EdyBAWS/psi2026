import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App.tsx";
import "./index.css";

// Acesta este punctul de intrare al întregului frontend.
// Aici montăm componenta principală `App` și registrul global de toast-uri.
// `Toaster` stă la rădăcina aplicației pentru ca orice modul să poată afișa
// feedback vizual fără să-și creeze propriul container local.
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" richColors closeButton />
  </React.StrictMode>,
);
