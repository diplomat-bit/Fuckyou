import React, { useEffect, useCallback } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { NotificationService } from '../services/NotificationService';
import { PipelineProps } from '../types/pipeline';

/**
 * Pipeline19_NotificationDispatcher
 * 
 * Responsible for observing the global notification queue and dispatching
 * alerts to the appropriate channels (UI toasts, push notifications, or logging).
 */
export const Pipeline19_NotificationDispatcher: React.FC<PipelineProps> = ({ isActive, config }) => {
  const { pendingNotifications, removeNotification } = useNotificationStore();

  const dispatch = useCallback(async (notification: any) => {
    try {
      // Route notification based on priority and type
      await NotificationService.send({
        ...notification,
        timestamp: Date.now(),
        channel: notification.priority === 'critical' ? 'push' : 'toast',
      });
    } catch (error) {
      console.error('Failed to dispatch notification:', error);
    } finally {
      removeNotification(notification.id);
    }
  }, [removeNotification]);

  useEffect(() => {
    if (!isActive || pendingNotifications.length === 0) return;

    const processQueue = async () => {
      for (const notification of pendingNotifications) {
        await dispatch(notification);
      }
    };

    processQueue();
  }, [pendingNotifications, isActive, dispatch]);

  return null; // This is a headless pipeline component
};

export default Pipeline19_NotificationDispatcher;