import crypto from 'crypto';
import type { DrawingAction, User } from './types';

interface Room {
  users: Map<string, { ws: any; user: User }>;
  actions: DrawingAction[];
}

const rooms = new Map<string, Room>();

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

function getRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function hasRoom(roomId: string): boolean {
  return rooms.has(roomId);
}

export function getOrCreateRoom(roomId: string): Room {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { users: new Map(), actions: [] });
  }
  return rooms.get(roomId)!;
}


export function addUserToRoom(roomId: string, ws: any, username: string): { room: Room; userId: string; user: User } {
  const room = getOrCreateRoom(roomId);
  const userId = crypto.randomUUID();
  const user: User = { id: userId, username, color: getRandomColor() };
  room.users.set(userId, { ws, user });
  return { room, userId, user };
}

export function removeUserFromRoom(roomId: string, userId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.users.delete(userId);
  if (room.users.size === 0) {
    rooms.delete(roomId);
    return null;
  }
  return room;
}

export function getRoomUsers(room: Room): User[] {
  return Array.from(room.users.values()).map((entry) => entry.user);
}

export function broadcastToRoom(room: Room, senderId: string, message: any) {
  const data = JSON.stringify(message);
  room.users.forEach((entry, id) => {
    if (id !== senderId && entry.ws.readyState === 1) {
      entry.ws.send(data);
    }
  });
}

export function broadcastToAll(room: Room, message: any) {
  const data = JSON.stringify(message);
  room.users.forEach((entry) => {
    if (entry.ws.readyState === 1) {
      entry.ws.send(data);
    }
  });
}

export function addAction(room: Room, action: DrawingAction) {
  room.actions.push(action);
}

export function undoAction(room: Room, userId: string) {
  for (let i = room.actions.length - 1; i >= 0; i--) {
    if (room.actions[i].userId === userId) {
      room.actions.splice(i, 1);
      break;
    }
  }
}

export function clearActions(room: Room) {
  room.actions = [];
}
