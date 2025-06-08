import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import chatModel from './models/chatModel';
import messageModel from './models/messageModel';
import projectGroupModel from './models/projectGroupModel';
import { Socket } from 'socket.io';
import mongoose from 'mongoose';
import { verifyToken } from './utils/tokenUtil';
import userModel from './models/userModel';

// Extend Socket type to include user
interface CustomSocket extends Socket {
  user?: {
    _id: mongoose.Types.ObjectId;
  };
}

let io: Server;

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Replace with your frontend URL in production
      methods: ["GET", "POST"],
      credentials:true
    }
  });

  // Socket authentication middleware
  io.use(async (socket: CustomSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        console.log('No token provided for socket connection');
        return next(new Error('Authentication error: No token provided'));
      }
      
      console.log('Authenticating socket with token');
      
      // Verify the token
      const decoded = verifyToken(token) as { id: string };
      
      if (!decoded || !decoded.id) {
        console.log('Invalid token for socket connection');
        return next(new Error('Authentication error: Invalid token'));
      }
      
      // Find the user
      const user = await userModel.findById(new mongoose.Types.ObjectId(decoded.id)).select('-password');
      
      if (!user) {
        console.log('User not found for socket connection');
        return next(new Error('Authentication error: User not found'));
      }
      
      // Attach the user to the socket
      socket.user = { _id: user._id as mongoose.Types.ObjectId };
      console.log(`Socket authenticated for user: ${user._id}`);
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: CustomSocket) => {
    console.log('User connected:', socket.id);
    console.log('Authenticated user:', socket.user?._id);

    // Join a group room
    socket.on('joinGroup', async (groupId: string) => {
      try {
        console.log(`Attempting to join group ${groupId} for socket ${socket.id}`);
        console.log(`Socket user:`, socket.user);
        
        const group = await projectGroupModel.findById(groupId);
        if (!group || !socket.user?._id) {
          console.log(`Group not found or user not authenticated:`, { 
            groupExists: !!group, 
            userExists: !!socket.user?._id 
          });
          socket.emit('error', { message: 'Group not found or user not authenticated' });
          return;
        }

        const isMember = group.members.some(member => member.equals(socket.user!._id)) || 
                        group.created_by.equals(socket.user!._id);
        console.log(`User membership check:`, { 
          userId: socket.user._id, 
          isMember,
          groupMembers: group.members.map(m => m.toString()),
          groupCreator: group.created_by.toString()
        });
        
        if (!isMember) {
          console.log(`User is not a member of this group`);
          socket.emit('error', { message: 'Not a member of this group' });
          return;
        }

        // Leave any existing rooms first
        const rooms = Array.from(socket.rooms);
        rooms.forEach(room => {
          if (room !== socket.id) {
            socket.leave(room);
            console.log(`Left room ${room}`);
          }
        });

        // Join the new room
        socket.join(groupId);
        console.log(`User ${socket.id} joined group ${groupId}`);
        
        // Check room after joining
        const room = io.sockets.adapter.rooms.get(groupId);
        console.log(`Room ${groupId} now has ${room ? room.size : 0} clients`);
        
        // Send confirmation to the user
        socket.emit('joinedGroup', { 
          groupId: groupId,
          success: true 
        });
      } catch (error) {
        console.error('Error joining group:', error);
        socket.emit('error', { message: 'Error joining group' });
      }
    });

    // Leave a group room
    socket.on('leaveGroup', (groupId: string) => {
      socket.leave(groupId);
      console.log(`User ${socket.id} left group ${groupId}`);
    });

    // Handle group messages
    socket.on('groupMessage', async (data: { 
      groupId: string, 
      message: string, 
      senderId: string 
    }) => {
      try {
        const group = await projectGroupModel.findById(data.groupId);

        if (!group) {
          socket.emit('error', { message: 'Group not found' });
          return;
        }

        const senderId = new mongoose.Types.ObjectId(data.senderId);
        const isMember = group.members.some(member => member.equals(senderId)) || 
                        group.created_by.equals(senderId);
        if (!isMember) {
          socket.emit('error', { message: 'Not a member of this group' });
          return;
        }
        console.log({group});
        // console.log({})
        // Save message to database
        const newMessage = await messageModel.create({
          sender: data.senderId,
          chat: data.groupId,
          receiver: null,
          content: data.message
        });
        console.log({newMessage});
        // Update last message in chat
        await chatModel.findOneAndUpdate(
          { GroupID: data.groupId },
          { lastMessage: newMessage._id }
        );

        // Broadcast message to all users in the group
        console.log("Broadcasting message to group:", data.groupId);
        console.log("Message content:", data.message);
        console.log("Sender ID:", data.senderId);
        
        // Get all sockets in the room to verify broadcasting
        const room = io.sockets.adapter.rooms.get(data.groupId);
        console.log("Number of clients in room:", room ? room.size : 0);
        
        // Log all clients in the room
        if (room) {
          console.log("Clients in room:", Array.from(room));
        } else {
          console.log("No clients in room. This is the issue!");
        }
        
        // Try to broadcast to the room
        io.to(data.groupId).emit('newGroupMessage', {
          message: data.message,
          groupId: data.groupId,
          senderId: data.senderId,
          messageId: newMessage._id ? newMessage._id.toString() : ''
        });
        
        console.log("Message broadcast completed");
        
        // Send confirmation to the sender
        socket.emit('messageSent', {
          success: true,
          messageId: newMessage._id ? newMessage._id.toString() : ''
        });
      } catch (error) {
        console.error('Error sending group message:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}; 