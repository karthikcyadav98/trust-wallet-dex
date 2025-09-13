/**
 * ActivityLog Component
 * Displays wallet activity history with real-time updates
 */

import React, { useEffect, useState, useCallback } from 'react';
import { activityLogger, ActivityLogEntry } from '../utils/encryptedStorage';
import './ActivityLog.css';

interface ActivityLogProps {
  className?: string;
  maxEntries?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const ActivityLog: React.FC<ActivityLogProps> = ({
  className = '',
  maxEntries = 5,
  autoRefresh = true,
  refreshInterval = 5000
}) => {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const refreshLogs = useCallback(() => {
    const recentLogs = activityLogger.getRecentLogs(maxEntries);
    const logStats = activityLogger.getLogStats();
    setLogs(recentLogs);
    setStats(logStats);
  }, [maxEntries]);

  useEffect(() => {
    refreshLogs();

    if (autoRefresh) {
      const interval = setInterval(refreshLogs, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshLogs, autoRefresh, refreshInterval]);

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getActivityIcon = (type: ActivityLogEntry['type']): string => {
    switch (type) {
      case 'connection':
        return '🔗';
      case 'disconnection':
        return '🔌';
      case 'network_switch':
        return '🔄';
      case 'transaction':
        return '💱';
      case 'error':
        return '⚠️';
      default:
        return '📝';
    }
  };

  const getActivityColor = (type: ActivityLogEntry['type']): string => {
    switch (type) {
      case 'connection':
        return '#10b981';
      case 'disconnection':
        return '#f59e0b';
      case 'network_switch':
        return '#3b82f6';
      case 'transaction':
        return '#8b5cf6';
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all activity logs?')) {
      activityLogger.clearLogs();
      refreshLogs();
    }
  };

  const formatStorageSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`activity-log ${className}`}>
      <div className="activity-log-header">
        <div className="header-content">
          <h3>Activity Log</h3>
          <div className="header-stats">
            {stats && (
              <span className="log-count">
                {stats.total} entries | {formatStorageSize(stats.storageSize)}
              </span>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button
            onClick={refreshLogs}
            className="refresh-btn"
            title="Refresh logs"
          >
            🔄
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="expand-btn"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '📥' : '📤'}
          </button>
          <button
            onClick={handleClearLogs}
            className="clear-btn"
            title="Clear all logs"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className={`activity-log-content ${isExpanded ? 'expanded' : ''}`}>
        {logs.length === 0 ? (
          <div className="no-logs">
            <span className="no-logs-icon">📝</span>
            <p>No activity yet. Connect your wallet to start logging.</p>
          </div>
        ) : (
          <div className="log-entries">
            {logs.map((log) => (
              <div
                key={log.id}
                className="log-entry"
                style={{ borderLeftColor: getActivityColor(log.type) }}
              >
                <div className="log-entry-header">
                  <span className="log-icon">{getActivityIcon(log.type)}</span>
                  <span className="log-message">{log.message}</span>
                  <span className="log-time">{formatTimestamp(log.timestamp)}</span>
                </div>
                {log.details && (
                  <div className="log-details">
                    {log.details.account && (
                      <span className="detail-item">
                        Account: {log.details.account.slice(0, 6)}...{log.details.account.slice(-4)}
                      </span>
                    )}
                    {log.details.networkName && (
                      <span className="detail-item">
                        Network: {log.details.networkName}
                      </span>
                    )}
                    {log.details.error && (
                      <span className="detail-item error">
                        Error: {log.details.error}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {isExpanded && stats && (
          <div className="log-stats">
            <h4>Statistics</h4>
            <div className="stats-grid">
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="stat-item">
                  <span className="stat-icon">{getActivityIcon(type as ActivityLogEntry['type'])}</span>
                  <span className="stat-label">{type.replace('_', ' ')}</span>
                  <span className="stat-count">{count as number}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;