"use client";
import { useRef } from "react";
import { MessageCircle, Plus, ChevronsRight, ChevronsLeft, User } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

export default function SidebarAndHeader({ sidebarOpen, setSidebarOpen }) {
  const dropdownRef = useRef(null);

  return (
    <>
      {/* Profile Icon (Top Right) */}
      <div className="profile-container position-absolute top-0 end-0 m-3" ref={dropdownRef}>
        <header>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "30px", height: "30px", padding: 0, border: "none", background: "#303030" }}>
                <User size={20} color="gray" />
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </header>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "" : "closed"} d-none d-md-flex flex-column`}>
        <div className="d-flex justify-content-between align-items-center p-2">
          <button className="btn btn-link">
            <Plus size={20} />
          </button>
          <button className="btn btn-link" onClick={() => setSidebarOpen(false)}>
            <ChevronsLeft size={20} />
          </button>
        </div>

        <div className="p-2 text-light d-flex align-items-center gap-2" style={{ fontSize: "18px" }}>
          <MessageCircle size={16} />
          <span>Hate Speech Detection</span>
        </div>

        <div className="conversation-list">
          <div className="px-3 py-2">
            <small className="text-muted">Today</small>
            <div className="conversation-item">Hello conversation</div>
            <div className="conversation-item">dummy response</div>
            <div className="conversation-item">dummy response</div>
            
            <div className="conversation-item">Hello conversation</div>
            <div className="conversation-item">Login Form Validation</div>
            <div className="conversation-item">Login Form Enhancement</div>

            
            <div className="conversation-item">Hello conversation</div>
            <div className="conversation-item">Login Form Validation</div>
            <div className="conversation-item">Login Form Enhancement</div>
            
            <div className="conversation-item">Hello conversation</div>
            <div className="conversation-item">Login Form Validation</div>
            <div className="conversation-item">Login Form Enhancement</div>

            <div className="conversation-item">Hello conversation</div>
            <div className="conversation-item">Login Form Validation</div>
            <div className="conversation-item">Login Form Enhancement</div>
            
            <div className="conversation-item">Hello conversation</div>
            <div className="conversation-item">Login Form Validation</div>
            <div className="conversation-item">Login Form Enhancement</div>
            
            <div className="conversation-item">Hello conversation</div>
            <div className="conversation-item">Login Form Validation</div>
            <div className="conversation-item">Login Form Enhancementsdfghjhgfdws,hwkrgebiyyyyyyyyyyyyyyychd iryc3iru</div>
            
            <div className="conversation-item">Hello conversation</div>
            <div className="conversation-item">Login Form Validation</div>
            <div className="conversation-item">Login Form Enhancement</div>
            
            <div className="conversation-item">Hello conversation</div>
            <div className="conversation-item">Login Form Validation</div>
            <div className="conversation-item">Login Form Enhancement</div>
            
            <div className="conversation-item">Hello conversation</div>
            <div className="conversation-item">Login Form Validation</div>
            <div className="conversation-item">Login Form Enhancement</div>
            
            <div className="conversation-item">Hello conversation</div>
            <div className="conversation-item">Login Form Validation</div>
            <div className="conversation-item">Login Form Enhancement</div>
          </div>
        </div>
      </div>

      {/* Open Sidebar Button */}
      {!sidebarOpen && (
        <button className="open-sidebar-btn" onClick={() => setSidebarOpen(true)}>
          <ChevronsRight size={24} />
        </button>
      )}
    </>
  );
}

