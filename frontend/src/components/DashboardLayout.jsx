import React from "react";
import Sidebar from "./Sidebar";
import ChatWidget from "./chatbot/ChatWidget";

export default function DashboardLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex bg-parchment">
      <Sidebar />
      <main className="flex-1 px-6 md:px-10 py-8 max-w-6xl">
        {children}
      </main>
      {/* Mounted once here, so the help bot follows the customer across every
          dashboard page without each page having to render it. */}
      <ChatWidget />
    </div>
  );
}
