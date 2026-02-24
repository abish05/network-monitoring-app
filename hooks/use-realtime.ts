import { useEffect, useState, useCallback } from 'react';

interface RealTimeHookOptions {
  url?: string;
}

export function useRealTime(options?: RealTimeHookOptions) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [traffic, setTraffic] = useState<any>(null);
  const [network, setNetwork] = useState<any>(null);
  const [networkHistory, setNetworkHistory] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const DEFAULT_PORT = process.env.NEXT_PUBLIC_BACKEND_PORT || '5001';
  // Use the current origin for WebSockets, whether it's localhost or the Render domain.
  // We determine WSS vs WS dynamically based on whether we are currently on HTTPS.
  let defaultWsUrl = '';
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    defaultWsUrl = process.env.NEXT_PUBLIC_WS_URL || `${protocol}//${window.location.host}`;
  } else {
    defaultWsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://localhost:${DEFAULT_PORT}`;
  }
  const wsUrl = options?.url || defaultWsUrl;

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('✅ Connected to server');
          setConnected(true);
          setLoading(false);
        };

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case 'initial-data':
              setAlerts(message.data.alerts);
              setLogs(message.data.logs);
              setTraffic(message.data.trafficData);
              if (message.data.networkData) setNetwork(message.data.networkData);
              if (message.data.networkData) setNetworkHistory((h) => [...h.slice(-29), message.data.networkData]);
              if (message.data.health) setHealth(message.data.health);
              break;

            case 'new-alert':
              setAlerts((prev) => [message.data, ...prev].slice(0, 20));
              break;

            case 'alert-updated':
              setAlerts((prev) =>
                prev.map((a) => (a.id === message.data.id ? message.data : a))
              );
              break;

            case 'new-log':
              setLogs((prev) => [message.data, ...prev].slice(0, 50));
              break;

            case 'traffic-update':
              setTraffic(message.data);
              break;
            case 'network-update':
              setNetwork(message.data);
              setNetworkHistory((h) => [...h.slice(-29), message.data]);
              break;
            case 'health-update':
              setHealth(message.data);
              break;
          }
        };

        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          setConnected(false);
        };

        ws.onclose = () => {
          console.log('🔌 Disconnected from server');
          setConnected(false);
          // Attempt to reconnect after 3 seconds
          reconnectTimeout = setTimeout(connect, 3000);
        };
      } catch (error) {
        console.error('Failed to connect:', error);
        setConnected(false);
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [wsUrl]);

  // Fetch initial network metrics via REST as a fallback
  useEffect(() => {
    // If not on the client, use localhost. If on client, use the origin we were loaded from!
    const apiUrl = typeof window !== 'undefined' ? window.location.origin : `http://localhost:${process.env.NEXT_PUBLIC_BACKEND_PORT || '5001'}`;

    fetch(`${apiUrl}/api/network`).then(r => r.json()).then((data) => {
      if (data) setNetwork(data);
    }).catch(() => { });
    fetch(`${apiUrl}/api/health`).then(r => r.json()).then((h) => {
      if (h) setHealth(h);
    }).catch(() => { });
  }, []);

  const updateAlertStatus = useCallback(async (alertId: string, status: string) => {
    try {
      const apiUrl = typeof window !== 'undefined' ? window.location.origin : `http://localhost:${process.env.NEXT_PUBLIC_BACKEND_PORT || '5001'}`;
      const response = await fetch(`${apiUrl}/api/alerts/${alertId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return response.json();
    } catch (error) {
      console.error('Failed to update alert:', error);
      throw error;
    }
  }, []);

  return {
    alerts,
    logs,
    traffic,
    network,
    networkHistory,
    health,
    connected,
    loading,
    updateAlertStatus,
  };
}
