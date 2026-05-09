// Socket functionality removed - using Next.js only approach
// Real-time updates now use optimized polling with cache-control

export function useSocket() {
  return { socket: null, isConnected: false };
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
