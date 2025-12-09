import { io, Socket } from 'socket.io-client';
import Config from 'react-native-dotenv';

export class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  connect(userId: string, role: string) {
    if (this.socket && this.socket.connected) {
      return;
    }

    this.socket = io(Config.SOCKET_URL || 'wss://safetnet.site/ws/', {
      transports: ['websocket'],
      query: {
        userId,
        role,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event: string, data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isSocketConnected(): boolean {
    return this.isConnected;
  }
}

export const socketService = new SocketService();












