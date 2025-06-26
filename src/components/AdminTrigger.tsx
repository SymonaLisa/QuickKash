import React, { useState } from 'react';
import { Shield, Settings } from 'lucide-react';
import { AdminProPanel } from './AdminProPanel';

interface AdminTriggerProps {
  className?: string;
}

export const AdminTrigger: React.FC<AdminTriggerProps> = ({ className = '' }) => {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  // Secret admin access: 5 clicks within 3 seconds
  const handleSecretClick = () => {
    const now = Date.now();

    let newCount = 1;
    if (now - lastClickTime <= 3000) {
      newCount = clickCount + 1;
    }
    setClickCount(newCount);
    setLastClickTime(now);

    if (newCount >= 5) {
      setShowAdminPanel(true);
      setClickCount(0);
    }
  };

  return (
    <>
      {/* Hidden admin trigger - click 5 times quickly */}
      <button
        onClick={handleSecretClick}
        className={`opacity-0 hover:opacity-20 transition-opacity duration-300 ${className}`}
        title="Admin Access"
        aria-label="Secret Admin Access Trigger"
      >
        <Shield className="w-4 h-4" />
      </button>

      {/* Visible admin button for development/testing */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => setShowAdminPanel(true)}
          className="fixed bottom-4 right-4 w-12 h-12 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center shadow-lg transition-colors z-40"
          title="Admin Panel (Dev Mode)"
          aria-label="Open Admin Panel (Dev Mode)"
        >
          <Settings className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Admin Panel */}
      <AdminProPanel 
        isVisible={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
      />
    </>
  );
};
