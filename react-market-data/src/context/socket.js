import React from 'react';
import socketio from 'socket.io-client';

export const socket = socketio.connect(process.env.REACT_APP_SOCKET_URL, {
  path: process.env.REACT_APP_SOCKET_URL,
  extraHeaders: {
    Authorization: `Bearer ${process.env.REACT_APP_SOCKET_TOKEN}`,
  },
});
export const SocketContext = React.createContext();
