"use client";
import { useState } from "react";
import SidebarAndHeader from "./sideBar";
import MainScreen from "./mainScreen";
import { ThemeProvider } from "../context/theme-context.tsx";
import { useUser } from "@clerk/clerk-react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isLoaded, user } = useUser();

  return (
    <ThemeProvider>
      <div className={`app-container d-flex ${sidebarOpen && user ? "sidebar-open" : "sidebar-closed"}`}>
        {user && <SidebarAndHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
        <MainScreen messages={messages} setMessages={setMessages} sidebarOpen={sidebarOpen && user} />
      </div>
    </ThemeProvider>
  );
}