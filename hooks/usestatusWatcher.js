import { useEffect, useState } from "react";
import statusWatcher from "../services/statusWatcher";

export const useStatusWatcher = () => {
  const [status, setStatus] = useState({
    isWatching: false,
    declarationsCount: 0,
  });

  useEffect(() => {
    console.log("🔍 Hook: Démarrage surveillance...");

    // Démarrer la surveillance
    statusWatcher.startWatching();

    // Mettre à jour le statut
    const updateStatus = () => {
      setStatus(statusWatcher.getStatus());
    };

    // Mettre à jour immédiatement
    updateStatus();

    // Mettre à jour toutes les 2 secondes
    const interval = setInterval(updateStatus, 2000);

    // Nettoyer
    return () => {
      clearInterval(interval);
      statusWatcher.stopWatching();
      console.log("🛑 Hook: Surveillance arrêtée");
    };
  }, []);

  return status;
};
