import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import BanCheckOverlay from './BanCheckOverlay';

/**
 * Global overlay that shows the ban animation when a user gets banned in real-time
 */
const GlobalBanOverlay: React.FC = () => {
  const { isBanned, user } = useAuth();
  const [showOverlay, setShowOverlay] = useState(false);
  const [wasBanned, setWasBanned] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Detect when user transitions from not-banned to banned
    if (isBanned && !wasBanned && user === null) {
      setShowOverlay(true);
      setWasBanned(true);
    } else if (!isBanned) {
      setWasBanned(false);
    }
  }, [isBanned, wasBanned, user]);

  // When the overlay completes for a banned user, redirect to auth
  const handleComplete = () => {
    // Keep overlay visible for banned users
    if (!isBanned) {
      setShowOverlay(false);
    }
  };

  if (!showOverlay) return null;

  return (
    <BanCheckOverlay
      isVisible={showOverlay}
      isBanned={true}
      onComplete={handleComplete}
      banMessage="Sua conta foi banida. Acesso negado ao sistema."
    />
  );
};

export default GlobalBanOverlay;
