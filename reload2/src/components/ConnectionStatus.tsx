import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { dataService } from '@/lib/data-service';

interface ConnectionStatusProps {
  className?: string;
  showText?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  className = '',
  showText = true
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const connected = await dataService.checkConnection();
      setIsConnected(connected);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check on mount
    checkConnection();

    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  const icon = isChecking ? (
    <RefreshCw className="w-3 h-3 animate-spin" />
  ) : isConnected ? (
    <Wifi className="w-3 h-3" />
  ) : (
    <WifiOff className="w-3 h-3" />
  );

  const variant = isChecking ? 'secondary' : isConnected ? 'default' : 'destructive';
  const text = isChecking ? 'Checking...' : isConnected ? 'Connected' : 'Disconnected';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={variant} className={`gap-1.5 ${className}`}>
          {icon}
          {showText && <span className="text-xs">{text}</span>}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-xs space-y-1">
          <p>
            <strong>Database:</strong> {isConnected ? 'Connected' : 'Disconnected'}
          </p>
          <p>
            <strong>Last Check:</strong> {lastCheck.toLocaleTimeString()}
          </p>
          {!isConnected && (
            <p className="text-destructive">
              Check your Supabase connection
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
