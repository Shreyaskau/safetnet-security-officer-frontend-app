import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Config from 'react-native-dotenv';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { addAlert, updateAlert } from '../redux/slices/alertSlice';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useAppDispatch();
  const officer = useAppSelector((state) => state.auth.officer);

  useEffect(() => {
    if (!officer) return;

    // Initialize socket connection
    socketRef.current = io(Config.SOCKET_URL || 'wss://safetnet.site/ws/', {
      transports: ['websocket'],
      query: {
        userId: officer.security_id,
        role: 'security',
      },
    });

    // Listen for new alerts
    socketRef.current.on('new_alert', (alert) => {
      dispatch(addAlert(alert));
    });

    // Listen for alert updates
    socketRef.current.on('alert_updated', (alert) => {
      dispatch(updateAlert(alert));
    });

    // Connection events
    socketRef.current.on('connect', () => {
      console.log('Socket connected');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [officer, dispatch]);

  const emitEvent = (event: string, data: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  return { socket: socketRef.current, emitEvent };
};












