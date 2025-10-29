require('dotenv').config()
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const helmet = require('helmet')
const { createAdapter } = require('@socket.io/redis-adapter')
const { createClient } = require('redis')

const app = express()
const server = http.createServer(app)

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:8080",
  credentials: true
}))
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:8080",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000
})

// Redis adapter for scaling
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
const pubClient = createClient({ url: redisUrl })
const subClient = pubClient.duplicate()

Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    io.adapter(createAdapter(pubClient, subClient))
    console.log('✅ Redis adapter connected')
  })
  .catch(console.error)

// Store active sessions
const activeSessions = new Map()
const activeUsers = new Map()

// Real-time Shopping List Handlers
const handleShoppingListEvents = (socket) => {
  socket.on('join_room', ({ room, userId }) => {
    socket.join(room)
    activeUsers.set(socket.id, { userId, room })
    
    // Notify others that user joined
    socket.to(room).emit('user_joined', { userId, socketId: socket.id })
    
    console.log(`User ${userId} joined room ${room}`)
  })

  socket.on('leave_room', ({ room }) => {
    socket.leave(room)
    const userData = activeUsers.get(socket.id)
    if (userData) {
      socket.to(room).emit('user_left', { userId: userData.userId, socketId: socket.id })
    }
    activeUsers.delete(socket.id)
  })

  socket.on('add_item', ({ listId, item }) => {
    const room = `shopping_list_${listId}`
    socket.to(room).emit('item_added', { listId, item })
    console.log(`Item added to list ${listId}: ${item.name}`)
  })

  socket.on('update_item', ({ listId, itemId, updates }) => {
    const room = `shopping_list_${listId}`
    socket.to(room).emit('item_updated', { listId, itemId, updates })
    console.log(`Item updated in list ${listId}: ${itemId}`)
  })

  socket.on('delete_item', ({ listId, itemId }) => {
    const room = `shopping_list_${listId}`
    socket.to(room).emit('item_deleted', { listId, itemId })
    console.log(`Item deleted from list ${listId}: ${itemId}`)
  })

  socket.on('add_collaborator', ({ listId, collaboratorId }) => {
    const room = `shopping_list_${listId}`
    socket.to(room).emit('collaborator_joined', { listId, collaborator: { id: collaboratorId } })
  })

  socket.on('remove_collaborator', ({ listId, collaboratorId }) => {
    const room = `shopping_list_${listId}`
    socket.to(room).emit('collaborator_left', { listId, collaboratorId })
  })
}

// Live Cooking Session Handlers
const handleCookingSessionEvents = (socket) => {
  socket.on('create_session', ({ session }) => {
    const room = `cooking_session_${session.id}`
    activeSessions.set(session.id, {
      ...session,
      room,
      participants: new Map()
    })
    
    socket.join(room)
    socket.emit('session_created', { session })
    console.log(`Cooking session created: ${session.id}`)
  })

  socket.on('join_session', ({ sessionId, userId, userName }) => {
    const room = `cooking_session_${sessionId}`
    const session = activeSessions.get(sessionId)
    
    if (session) {
      socket.join(room)
      
      const participant = {
        id: `participant_${userId}`,
        userId,
        userName,
        joinedAt: new Date(),
        role: 'participant',
        status: 'active',
        currentStep: 0
      }
      
      session.participants.set(userId, participant)
      
      socket.to(room).emit('participant_joined', { sessionId, participant })
      socket.emit('session_joined', { sessionId, session: session })
      
      console.log(`User ${userName} joined cooking session ${sessionId}`)
    } else {
      socket.emit('error', { message: 'Session not found' })
    }
  })

  socket.on('leave_session', ({ sessionId, userId }) => {
    const room = `cooking_session_${sessionId}`
    const session = activeSessions.get(sessionId)
    
    if (session) {
      session.participants.delete(userId)
      socket.leave(room)
      socket.to(room).emit('participant_left', { sessionId, userId })
      
      console.log(`User ${userId} left cooking session ${sessionId}`)
    }
  })

  socket.on('start_session', ({ sessionId, startedAt }) => {
    const room = `cooking_session_${sessionId}`
    const session = activeSessions.get(sessionId)
    
    if (session) {
      session.status = 'active'
      session.startedAt = startedAt
      
      io.to(room).emit('session_started', { sessionId, startedAt })
      console.log(`Cooking session started: ${sessionId}`)
    }
  })

  socket.on('pause_session', ({ sessionId }) => {
    const room = `cooking_session_${sessionId}`
    const session = activeSessions.get(sessionId)
    
    if (session) {
      session.status = 'paused'
      
      io.to(room).emit('session_paused', { sessionId })
      console.log(`Cooking session paused: ${sessionId}`)
    }
  })

  socket.on('next_step', ({ sessionId, stepNumber }) => {
    const room = `cooking_session_${sessionId}`
    const session = activeSessions.get(sessionId)
    
    if (session) {
      session.currentStep = stepNumber
      
      io.to(room).emit('step_updated', { sessionId, stepNumber })
      console.log(`Cooking session ${sessionId} moved to step ${stepNumber}`)
    }
  })

  socket.on('send_message', ({ sessionId, message }) => {
    const room = `cooking_session_${sessionId}`
    
    io.to(room).emit('message_received', { sessionId, message })
    console.log(`Message sent in session ${sessionId}: ${message.message}`)
  })

  socket.on('update_participant_step', ({ sessionId, userId, stepNumber }) => {
    const room = `cooking_session_${sessionId}`
    const session = activeSessions.get(sessionId)
    
    if (session && session.participants.has(userId)) {
      const participant = session.participants.get(userId)
      participant.currentStep = stepNumber
      
      socket.to(room).emit('participant_step_updated', { sessionId, userId, stepNumber })
      console.log(`Participant ${userId} step updated to ${stepNumber} in session ${sessionId}`)
    }
  })
}

// Real-time Meal Plan Handlers
const handleMealPlanEvents = (socket) => {
  socket.on('update_meal_plan', ({ planId, updates }) => {
    const room = `meal_plan_${planId}`
    socket.to(room).emit('meal_plan_updated', { planId, updates })
    console.log(`Meal plan updated: ${planId}`)
  })

  socket.on('add_meal', ({ planId, date, mealType, meal }) => {
    const room = `meal_plan_${planId}`
    socket.to(room).emit('meal_added', { planId, date, mealType, meal })
    console.log(`Meal added to plan ${planId}: ${meal.recipeName}`)
  })

  socket.on('update_meal', ({ planId, mealId, updates }) => {
    const room = `meal_plan_${planId}`
    socket.to(room).emit('meal_updated', { planId, mealId, updates })
    console.log(`Meal updated in plan ${planId}: ${mealId}`)
  })

  socket.on('delete_meal', ({ planId, mealId }) => {
    const room = `meal_plan_${planId}`
    socket.to(room).emit('meal_deleted', { planId, mealId })
    console.log(`Meal deleted from plan ${planId}: ${mealId}`)
  })

  socket.on('add_meal_plan_collaborator', ({ planId, collaboratorId }) => {
    const room = `meal_plan_${planId}`
    socket.to(room).emit('meal_plan_collaborator_joined', { planId, collaboratorId })
  })

  socket.on('remove_meal_plan_collaborator', ({ planId, collaboratorId }) => {
    const room = `meal_plan_${planId}`
    socket.to(room).emit('meal_plan_collaborator_left', { planId, collaboratorId })
  })
}

// Socket connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`)

  // Register event handlers
  handleShoppingListEvents(socket)
  handleCookingSessionEvents(socket)
  handleMealPlanEvents(socket)

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Client disconnected: ${socket.id}, reason: ${reason}`)
    
    // Clean up user data
    const userData = activeUsers.get(socket.id)
    if (userData) {
      socket.to(userData.room).emit('user_left', { 
        userId: userData.userId, 
        socketId: socket.id 
      })
      activeUsers.delete(socket.id)
    }

    // Clean up cooking sessions
    for (const [sessionId, session] of activeSessions.entries()) {
      for (const [userId, participant] of session.participants.entries()) {
        if (participant.socketId === socket.id) {
          session.participants.delete(userId)
          socket.to(session.room).emit('participant_left', { sessionId, userId })
          break
        }
      }
    }
  })

  // Ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong')
  })
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down Socket.IO server...')
  
  // Close Socket.IO
  io.close(() => {
    console.log('✅ Socket.IO server closed')
  })
  
  // Close Redis connections
  await pubClient.quit()
  await subClient.quit()
  console.log('✅ Redis connections closed')
  
  process.exit(0)
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`)
  console.log(`📡 CORS origin: ${process.env.CORS_ORIGIN || "http://localhost:8080"}`)
  console.log(`💾 Redis URL: ${redisUrl}`)
})