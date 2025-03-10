"use client";
import { useState } from "react";
import SidebarAndHeader from "./sideBar";
import MainScreen from "./mainScreen";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={`app-container d-flex ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <SidebarAndHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <MainScreen messages={messages} setMessages={setMessages} sidebarOpen={sidebarOpen} />
    </div>
  );
}
