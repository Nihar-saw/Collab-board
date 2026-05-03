import { WebSocketServer, WebSocket } from 'ws';
import { parse } from 'url';
import {
  addUserToRoom,
  removeUserFromRoom,
  getRoomUsers,
  broadcastToRoom,
  broadcastToAll,
  addAction,
  undoAction,
  clearActions,
  hasRoom,
} from './roomManager';

const PORT = parseInt(process.env.PORT || '4000', 10);

const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server running on port ${PORT}`);

wss.on('connection', (ws: WebSocket, req) => {
  const url = parse(req.url || '', true);
  const roomId = url.query.roomId as string;
  const username = decodeURIComponent((url.query.username as string) || 'Anonymous');
  const action = url.query.action as string;

  if (!roomId) {
    ws.close(1008, 'Room ID required');
    return;
  }

  if (action === 'join' && !hasRoom(roomId)) {
    ws.close(4004, 'Room not found');
    return;
  }

  const { room, userId } = addUserToRoom(roomId, ws, username);

  // Send init to the new user
  ws.send(JSON.stringify({
    type: 'init',
    userId,
    users: getRoomUsers(room),
  }));

  // Send existing drawing history
  if (room.actions.length > 0) {
    ws.send(JSON.stringify({
      type: 'history',
      actions: room.actions,
    }));
  }

  // Broadcast updated user list to all
  broadcastToAll(room, {
    type: 'users',
    users: getRoomUsers(room),
  });

  ws.on('message', (data: Buffer) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case 'draw': {
          const action = { ...msg.action, userId };
          addAction(room, action);
          broadcastToRoom(room, userId, {
            type: 'draw',
            userId,
            action,
          });
          break;
        }
        case 'move': {
          const action = { ...msg.action, userId };
          const actionIndex = room.actions.findIndex(a => a.actionId === action.actionId);
          if (actionIndex !== -1) {
            room.actions[actionIndex] = action;
            broadcastToRoom(room, userId, {
              type: 'move',
              userId,
              action,
            });
          }
          break;
        }
        case 'drawStep': {
          const stepAction = { ...msg.action, userId };
          broadcastToRoom(room, userId, {
            type: 'drawStep',
            userId,
            action: stepAction,
          });
          break;
        }
        case 'undo': {
          undoAction(room, userId);
          broadcastToRoom(room, userId, {
            type: 'undo',
            userId,
          });
          break;
        }
        case 'clear': {
          clearActions(room);
          broadcastToRoom(room, userId, {
            type: 'clear',
          });
          break;
        }
      }
    } catch (err) {
      console.error('Failed to process message:', err);
    }
  });

  ws.on('close', () => {
    const updatedRoom = removeUserFromRoom(roomId, userId);
    if (updatedRoom) {
      broadcastToAll(updatedRoom, {
        type: 'users',
        users: getRoomUsers(updatedRoom),
      });
    }
  });
});
