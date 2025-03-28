"use client";
import { useRef } from "react";
import { Plus, ChevronsRight, ChevronsLeft, Sun, Moon } from 'lucide-react';
import "bootstrap/dist/css/bootstrap.min.css";
import { useTheme } from "../context/theme-context.tsx";

export default function SidebarAndHeader({ sidebarOpen, setSidebarOpen }) {
  const dropdownRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "" : "closed"} d-none d-md-flex flex-column`}>
        <div className="d-flex justify-content-between align-items-center p-2">
          <button className="btn btn-link">
            <Plus size={20} color="var(--icon-color)" />
          </button>
          <div className="d-flex">
            <button 
              className="btn btn-link theme-toggle me-2" 
              onClick={toggleTheme} 
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? 
                <Sun size={20} color="var(--icon-color)" /> : 
                <Moon size={20} color="var(--icon-color)" />
              }
            </button>
            <button className="btn btn-link" onClick={() => setSidebarOpen(false)}>
              <ChevronsLeft size={20} color="var(--icon-color)" />
            </button>
          </div>
        </div>

        <div className="p-2 d-flex align-items-center justify-content-center w-100 app-title" style={{ fontSize: "24px" }}>
          <span>Hate Speech Detection</span>
        </div>

        <div className="conversation-list">
          <div className="px-3 py-2">
            <small className="conversation-date">Today</small>
            <div className="conversation-item">how are you?</div>
            <div className="conversation-item">what are you doing?</div>
            <div className="conversation-item">is there any way we can do this wothout</div>
          </div>
        </div>
      </div>

      {/* Open Sidebar Button */}
      {!sidebarOpen && (
        <button className="open-sidebar-btn" onClick={() => setSidebarOpen(true)}>
          <ChevronsRight size={24} color="var(--icon-color)" />
        </button>
      )}
    </>
  );
}