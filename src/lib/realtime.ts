import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Types and Interfaces
export interface RealtimeConfig {
  supabase: {
    url: string
    anonKey: string
  }
  socketio: {
    url: string
    options: {
      transports: string[]
      timeout: number
      retries: number
    }
  }
  pusher: {
    appKey: string
    cluster: string
    encrypted: boolean
  }
  notifications: {
    vapidPublicKey: string
    apiUrl: string
  }
}

export interface ShoppingListItem {
  id: string
  listId: string
  name: string
  quantity: number
  unit: string
  category: string
  completed: boolean
  addedBy: string
  addedAt: Date
  completedBy?: string
  completedAt?: Date
  notes?: string
}

export interface ShoppingList {
  id: string
  name: string
  ownerId: string
  collaborators: string[]
  items: ShoppingListItem[]
  isShared: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CookingSession {
  id: string
  recipeId: string
  recipeName: string
  hostId: string
  hostName: string
  participants: CookingParticipant[]
  status: 'preparing' | 'active' | 'paused' | 'completed' | 'cancelled'
  currentStep: number
  totalSteps: number
  startedAt?: Date
  completedAt?: Date
  isPublic: boolean
  maxParticipants: number
  description?: string
  tags: string[]
}

export interface CookingParticipant {
  id: string
  userId: string
  userName: string
  avatar?: string
  joinedAt: Date
  role: 'host' | 'participant' | 'observer'
  status: 'active' | 'inactive' | 'left'
  currentStep: number
}

export interface CookingMessage {
  id: string
  sessionId: string
  userId: string
  userName: string
  message: string
  type: 'chat' | 'step_update' | 'timer' | 'tip' | 'question'
  timestamp: Date
  stepNumber?: number
  metadata?: Record<string, any>
}

export interface MealPlan {
  id: string
  userId: string
  name: string
  description?: string
  startDate: Date
  endDate: Date
  meals: MealPlanDay[]
  collaborators: string[]
  isShared: boolean
  status: 'draft' | 'active' | 'completed'
  createdAt: Date
  updatedAt: Date
}

export interface MealPlanDay {
  date: Date
  breakfast?: MealPlanMeal
  lunch?: MealPlanMeal
  dinner?: MealPlanMeal
  snacks?: MealPlanMeal[]
}

export interface MealPlanMeal {
  id: string
  recipeId?: string
  recipeName: string
  servings: number
  prepTime: number
  cookTime: number
  ingredients: string[]
  notes?: string
  assignedTo?: string
  status: 'planned' | 'prepping' | 'cooking' | 'completed' | 'skipped'
}

export interface NotificationPayload {
  id: string
  userId: string
  title: string
  body: string
  type: 'meal_reminder' | 'cooking_session' | 'shopping_list' | 'meal_plan' | 'general'
  data?: Record<string, any>
  scheduled?: Date
  sent?: boolean
  clickAction?: string
  icon?: string
  badge?: string
}

export interface RealtimeEvent {
  type: string
  payload: any
  timestamp: Date
  userId?: string
  sessionId?: string
}

// Default Configuration
const defaultConfig: RealtimeConfig = {
  supabase: {
    url: process.env.VITE_SUPABASE_URL || 'http://localhost:54321',
    anonKey: process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
  },
  socketio: {
    url: process.env.VITE_SOCKETIO_URL || 'http://localhost:3001',
    options: {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      retries: 3
    }
  },
  pusher: {
    appKey: process.env.VITE_PUSHER_KEY || 'local-pusher-key',
    cluster: process.env.VITE_PUSHER_CLUSTER || 'mt1',
    encrypted: true
  },
  notifications: {
    vapidPublicKey: process.env.VITE_VAPID_PUBLIC_KEY || 'your-vapid-public-key',
    apiUrl: process.env.VITE_NOTIFICATIONS_API || 'http://localhost:3002'
  }
}

// Mock Socket.IO Client for Development
class MockSocketIOClient {
  private listeners = new Map<string, Function[]>()
  private connected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect() {
    setTimeout(() => {
      this.connected = true
      this.emit('connect')
      console.log('Mock Socket.IO: Connected')
    }, 100)
  }

  disconnect() {
    this.connected = false
    this.emit('disconnect')
    console.log('Mock Socket.IO: Disconnected')
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback?: Function) {
    if (callback) {
      const listeners = this.listeners.get(event) || []
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    } else {
      this.listeners.delete(event)
    }
  }

  emit(event: string, data?: any) {
    const listeners = this.listeners.get(event) || []
    listeners.forEach(callback => callback(data))
    
    // Simulate server events for development
    if (event === 'join_room') {
      setTimeout(() => this.emit('room_joined', { room: data.room, success: true }), 50)
    }
    if (event === 'leave_room') {
      setTimeout(() => this.emit('room_left', { room: data.room }), 50)
    }
  }

  isConnected() {
    return this.connected
  }

  private simulateReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        if (!this.connected) {
          this.connect()
        }
      }, 1000 * this.reconnectAttempts)
    }
  }
}

// Real-time Shopping List Manager
export class RealtimeShoppingListManager {
  private supabase: SupabaseClient
  private socket: MockSocketIOClient
  private subscriptions = new Map<string, any>()

  constructor(config: RealtimeConfig = defaultConfig) {
    this.supabase = createClient(config.supabase.url, config.supabase.anonKey)
    this.socket = new MockSocketIOClient()
    this.socket.connect()
  }

  async joinShoppingList(listId: string, userId: string): Promise<void> {
    // Join real-time room
    this.socket.emit('join_room', { room: `shopping_list_${listId}`, userId })

    // Subscribe to Supabase changes
    const subscription = this.supabase
      .channel(`shopping_list_${listId}`)
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'shopping_list_items', filter: `list_id=eq.${listId}` },
          (payload) => {
            this.handleShoppingListChange(payload)
          }
      )
      .subscribe()

    this.subscriptions.set(listId, subscription)

    // Set up socket listeners
    this.socket.on('item_added', (data) => this.handleItemAdded(data))
    this.socket.on('item_updated', (data) => this.handleItemUpdated(data))
    this.socket.on('item_deleted', (data) => this.handleItemDeleted(data))
    this.socket.on('collaborator_joined', (data) => this.handleCollaboratorJoined(data))
    this.socket.on('collaborator_left', (data) => this.handleCollaboratorLeft(data))
  }

  async leaveShoppingList(listId: string): Promise<void> {
    // Leave socket room
    this.socket.emit('leave_room', { room: `shopping_list_${listId}` })

    // Unsubscribe from Supabase changes
    const subscription = this.subscriptions.get(listId)
    if (subscription) {
      await subscription.unsubscribe()
      this.subscriptions.delete(listId)
    }

    // Remove socket listeners
    this.socket.off('item_added')
    this.socket.off('item_updated')
    this.socket.off('item_deleted')
    this.socket.off('collaborator_joined')
    this.socket.off('collaborator_left')
  }

  async addItem(listId: string, item: Omit<ShoppingListItem, 'id' | 'addedAt'>): Promise<ShoppingListItem> {
    const newItem: ShoppingListItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedAt: new Date()
    }

    // Emit to socket for real-time updates
    this.socket.emit('add_item', { listId, item: newItem })

    // Save to Supabase (in real implementation)
    // await this.supabase.from('shopping_list_items').insert(newItem)

    return newItem
  }

  async updateItem(listId: string, itemId: string, updates: Partial<ShoppingListItem>): Promise<void> {
    // Emit to socket for real-time updates
    this.socket.emit('update_item', { listId, itemId, updates })

    // Update in Supabase (in real implementation)
    // await this.supabase.from('shopping_list_items').update(updates).eq('id', itemId)
  }

  async deleteItem(listId: string, itemId: string): Promise<void> {
    // Emit to socket for real-time updates
    this.socket.emit('delete_item', { listId, itemId })

    // Delete from Supabase (in real implementation)
    // await this.supabase.from('shopping_list_items').delete().eq('id', itemId)
  }

  async addCollaborator(listId: string, collaboratorId: string): Promise<void> {
    this.socket.emit('add_collaborator', { listId, collaboratorId })
  }

  async removeCollaborator(listId: string, collaboratorId: string): Promise<void> {
    this.socket.emit('remove_collaborator', { listId, collaboratorId })
  }

  // Event handlers
  private handleShoppingListChange(payload: any): void {
    console.log('Shopping list changed:', payload)
    // Dispatch custom events that components can listen to
    window.dispatchEvent(new CustomEvent('shopping_list_changed', { detail: payload }))
  }

  private handleItemAdded(data: any): void {
    window.dispatchEvent(new CustomEvent('shopping_item_added', { detail: data }))
  }

  private handleItemUpdated(data: any): void {
    window.dispatchEvent(new CustomEvent('shopping_item_updated', { detail: data }))
  }

  private handleItemDeleted(data: any): void {
    window.dispatchEvent(new CustomEvent('shopping_item_deleted', { detail: data }))
  }

  private handleCollaboratorJoined(data: any): void {
    window.dispatchEvent(new CustomEvent('collaborator_joined', { detail: data }))
  }

  private handleCollaboratorLeft(data: any): void {
    window.dispatchEvent(new CustomEvent('collaborator_left', { detail: data }))
  }
}

// Live Cooking Session Manager
export class LiveCookingSessionManager {
  private socket: MockSocketIOClient
  private currentSession: CookingSession | null = null
  private messageHandlers = new Map<string, Function[]>()

  constructor(config: RealtimeConfig = defaultConfig) {
    this.socket = new MockSocketIOClient()
    this.socket.connect()
    this.setupSocketListeners()
  }

  async createSession(session: Omit<CookingSession, 'id' | 'participants' | 'status' | 'currentStep'>): Promise<CookingSession> {
    const newSession: CookingSession = {
      ...session,
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participants: [{
        id: `participant_${Date.now()}`,
        userId: session.hostId,
        userName: session.hostName,
        joinedAt: new Date(),
        role: 'host',
        status: 'active',
        currentStep: 0
      }],
      status: 'preparing',
      currentStep: 0
    }

    this.currentSession = newSession
    this.socket.emit('create_session', { session: newSession })

    return newSession
  }

  async joinSession(sessionId: string, userId: string, userName: string): Promise<void> {
    this.socket.emit('join_session', { sessionId, userId, userName })
    
    const participant: CookingParticipant = {
      id: `participant_${Date.now()}`,
      userId,
      userName,
      joinedAt: new Date(),
      role: 'participant',
      status: 'active',
      currentStep: 0
    }

    this.socket.emit('participant_joined', { sessionId, participant })
  }

  async leaveSession(sessionId: string, userId: string): Promise<void> {
    this.socket.emit('leave_session', { sessionId, userId })
  }

  async startSession(sessionId: string): Promise<void> {
    if (this.currentSession && this.currentSession.id === sessionId) {
      this.currentSession.status = 'active'
      this.currentSession.startedAt = new Date()
    }
    
    this.socket.emit('start_session', { sessionId, startedAt: new Date() })
  }

  async pauseSession(sessionId: string): Promise<void> {
    if (this.currentSession && this.currentSession.id === sessionId) {
      this.currentSession.status = 'paused'
    }
    
    this.socket.emit('pause_session', { sessionId })
  }

  async nextStep(sessionId: string, stepNumber: number): Promise<void> {
    if (this.currentSession && this.currentSession.id === sessionId) {
      this.currentSession.currentStep = stepNumber
    }
    
    this.socket.emit('next_step', { sessionId, stepNumber })
  }

  async sendMessage(sessionId: string, message: Omit<CookingMessage, 'id' | 'timestamp'>): Promise<void> {
    const newMessage: CookingMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }

    this.socket.emit('send_message', { sessionId, message: newMessage })
  }

  async updateParticipantStep(sessionId: string, userId: string, stepNumber: number): Promise<void> {
    this.socket.emit('update_participant_step', { sessionId, userId, stepNumber })
  }

  onMessage(type: string, handler: Function): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, [])
    }
    this.messageHandlers.get(type)!.push(handler)
  }

  offMessage(type: string, handler?: Function): void {
    if (handler) {
      const handlers = this.messageHandlers.get(type) || []
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    } else {
      this.messageHandlers.delete(type)
    }
  }

  private setupSocketListeners(): void {
    this.socket.on('session_created', (data) => {
      window.dispatchEvent(new CustomEvent('cooking_session_created', { detail: data }))
    })

    this.socket.on('participant_joined', (data) => {
      window.dispatchEvent(new CustomEvent('cooking_participant_joined', { detail: data }))
    })

    this.socket.on('participant_left', (data) => {
      window.dispatchEvent(new CustomEvent('cooking_participant_left', { detail: data }))
    })

    this.socket.on('session_started', (data) => {
      window.dispatchEvent(new CustomEvent('cooking_session_started', { detail: data }))
    })

    this.socket.on('session_paused', (data) => {
      window.dispatchEvent(new CustomEvent('cooking_session_paused', { detail: data }))
    })

    this.socket.on('step_updated', (data) => {
      window.dispatchEvent(new CustomEvent('cooking_step_updated', { detail: data }))
    })

    this.socket.on('message_received', (data) => {
      const handlers = this.messageHandlers.get(data.message.type) || []
      handlers.forEach(handler => handler(data))
      
      window.dispatchEvent(new CustomEvent('cooking_message_received', { detail: data }))
    })
  }
}

// Real-time Meal Plan Manager
export class RealtimeMealPlanManager {
  private supabase: SupabaseClient
  private socket: MockSocketIOClient
  private subscriptions = new Map<string, any>()

  constructor(config: RealtimeConfig = defaultConfig) {
    this.supabase = createClient(config.supabase.url, config.supabase.anonKey)
    this.socket = new MockSocketIOClient()
    this.socket.connect()
  }

  async joinMealPlan(planId: string, userId: string): Promise<void> {
    this.socket.emit('join_room', { room: `meal_plan_${planId}`, userId })

    const subscription = this.supabase
      .channel(`meal_plan_${planId}`)
      .on('postgres_changes',
          { event: '*', schema: 'public', table: 'meal_plans', filter: `id=eq.${planId}` },
          (payload) => {
            this.handleMealPlanChange(payload)
          }
      )
      .subscribe()

    this.subscriptions.set(planId, subscription)

    this.socket.on('meal_plan_updated', (data) => this.handleMealPlanUpdated(data))
    this.socket.on('meal_added', (data) => this.handleMealAdded(data))
    this.socket.on('meal_updated', (data) => this.handleMealUpdated(data))
    this.socket.on('meal_deleted', (data) => this.handleMealDeleted(data))
  }

  async leaveMealPlan(planId: string): Promise<void> {
    this.socket.emit('leave_room', { room: `meal_plan_${planId}` })

    const subscription = this.subscriptions.get(planId)
    if (subscription) {
      await subscription.unsubscribe()
      this.subscriptions.delete(planId)
    }

    this.socket.off('meal_plan_updated')
    this.socket.off('meal_added')
    this.socket.off('meal_updated')
    this.socket.off('meal_deleted')
  }

  async updateMealPlan(planId: string, updates: Partial<MealPlan>): Promise<void> {
    this.socket.emit('update_meal_plan', { planId, updates })
  }

  async addMeal(planId: string, date: Date, mealType: string, meal: MealPlanMeal): Promise<void> {
    this.socket.emit('add_meal', { planId, date, mealType, meal })
  }

  async updateMeal(planId: string, mealId: string, updates: Partial<MealPlanMeal>): Promise<void> {
    this.socket.emit('update_meal', { planId, mealId, updates })
  }

  async deleteMeal(planId: string, mealId: string): Promise<void> {
    this.socket.emit('delete_meal', { planId, mealId })
  }

  async addCollaborator(planId: string, collaboratorId: string): Promise<void> {
    this.socket.emit('add_meal_plan_collaborator', { planId, collaboratorId })
  }

  async removeCollaborator(planId: string, collaboratorId: string): Promise<void> {
    this.socket.emit('remove_meal_plan_collaborator', { planId, collaboratorId })
  }

  private handleMealPlanChange(payload: any): void {
    window.dispatchEvent(new CustomEvent('meal_plan_changed', { detail: payload }))
  }

  private handleMealPlanUpdated(data: any): void {
    window.dispatchEvent(new CustomEvent('meal_plan_updated', { detail: data }))
  }

  private handleMealAdded(data: any): void {
    window.dispatchEvent(new CustomEvent('meal_added', { detail: data }))
  }

  private handleMealUpdated(data: any): void {
    window.dispatchEvent(new CustomEvent('meal_updated', { detail: data }))
  }

  private handleMealDeleted(data: any): void {
    window.dispatchEvent(new CustomEvent('meal_deleted', { detail: data }))
  }
}

// Push Notification Manager
export class PushNotificationManager {
  private config: RealtimeConfig
  private registration: ServiceWorkerRegistration | null = null
  private subscription: PushSubscription | null = null

  constructor(config: RealtimeConfig = defaultConfig) {
    this.config = config
    this.init()
  }

  private async init(): Promise<void> {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registered:', this.registration)
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications')
    }

    let permission = Notification.permission

    if (permission === 'default') {
      permission = await Notification.requestPermission()
    }

    return permission
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('Service Worker not registered')
      return null
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.config.notifications.vapidPublicKey)
      })

      this.subscription = subscription
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription)
      
      return subscription
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return null
    }
  }

  async unsubscribe(): Promise<void> {
    if (!this.subscription) return

    try {
      await this.subscription.unsubscribe()
      await this.removeSubscriptionFromServer()
      this.subscription = null
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
    }
  }

  async scheduleMealReminder(reminder: {
    mealPlanId: string
    mealId: string
    recipeName: string
    scheduledTime: Date
    type: 'prep' | 'cook'
  }): Promise<void> {
    const notification: NotificationPayload = {
      id: `reminder_${Date.now()}`,
      userId: 'current_user', // Get from auth context
      title: reminder.type === 'prep' ? 'Time to prep!' : 'Time to cook!',
      body: `It's time to ${reminder.type} ${reminder.recipeName}`,
      type: 'meal_reminder',
      scheduled: reminder.scheduledTime,
      sent: false,
      data: {
        mealPlanId: reminder.mealPlanId,
        mealId: reminder.mealId,
        type: reminder.type
      },
      clickAction: `/meal-plans/${reminder.mealPlanId}`,
      icon: '/icons/cooking-icon-192.png'
    }

    await this.sendNotificationToServer(notification)
  }

  async sendCookingSessionInvite(invite: {
    sessionId: string
    recipeName: string
    hostName: string
    inviteeIds: string[]
  }): Promise<void> {
    const notifications: NotificationPayload[] = invite.inviteeIds.map(userId => ({
      id: `invite_${userId}_${Date.now()}`,
      userId,
      title: 'Cooking Session Invite',
      body: `${invite.hostName} invited you to cook ${invite.recipeName} together!`,
      type: 'cooking_session',
      sent: false,
      data: {
        sessionId: invite.sessionId,
        hostName: invite.hostName,
        recipeName: invite.recipeName
      },
      clickAction: `/cooking-sessions/${invite.sessionId}`,
      icon: '/icons/cooking-session-icon-192.png'
    }))

    for (const notification of notifications) {
      await this.sendNotificationToServer(notification)
    }
  }

  async sendShoppingListUpdate(update: {
    listId: string
    listName: string
    collaboratorIds: string[]
    action: 'item_added' | 'item_completed' | 'list_shared'
    itemName?: string
  }): Promise<void> {
    const notifications: NotificationPayload[] = update.collaboratorIds.map(userId => ({
      id: `shopping_${userId}_${Date.now()}`,
      userId,
      title: 'Shopping List Update',
      body: this.getShoppingListMessage(update),
      type: 'shopping_list',
      sent: false,
      data: {
        listId: update.listId,
        action: update.action,
        itemName: update.itemName
      },
      clickAction: `/shopping-lists/${update.listId}`,
      icon: '/icons/shopping-list-icon-192.png'
    }))

    for (const notification of notifications) {
      await this.sendNotificationToServer(notification)
    }
  }

  async sendMealPlanUpdate(update: {
    planId: string
    planName: string
    collaboratorIds: string[]
    action: 'meal_added' | 'meal_updated' | 'plan_shared'
    mealName?: string
  }): Promise<void> {
    const notifications: NotificationPayload[] = update.collaboratorIds.map(userId => ({
      id: `mealplan_${userId}_${Date.now()}`,
      userId,
      title: 'Meal Plan Update',
      body: this.getMealPlanMessage(update),
      type: 'meal_plan',
      sent: false,
      data: {
        planId: update.planId,
        action: update.action,
        mealName: update.mealName
      },
      clickAction: `/meal-plans/${update.planId}`,
      icon: '/icons/meal-plan-icon-192.png'
    }))

    for (const notification of notifications) {
      await this.sendNotificationToServer(notification)
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch(`${this.config.notifications.apiUrl}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription,
          userId: 'current_user' // Get from auth context
        })
      })
    } catch (error) {
      console.error('Failed to send subscription to server:', error)
    }
  }

  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      await fetch(`${this.config.notifications.apiUrl}/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'current_user' // Get from auth context
        })
      })
    } catch (error) {
      console.error('Failed to remove subscription from server:', error)
    }
  }

  private async sendNotificationToServer(notification: NotificationPayload): Promise<void> {
    try {
      await fetch(`${this.config.notifications.apiUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      })
    } catch (error) {
      console.error('Failed to send notification to server:', error)
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    
    return outputArray
  }

  private getShoppingListMessage(update: any): string {
    switch (update.action) {
      case 'item_added':
        return `${update.itemName} was added to ${update.listName}`
      case 'item_completed':
        return `${update.itemName} was completed in ${update.listName}`
      case 'list_shared':
        return `${update.listName} was shared with you`
      default:
        return `${update.listName} was updated`
    }
  }

  private getMealPlanMessage(update: any): string {
    switch (update.action) {
      case 'meal_added':
        return `${update.mealName} was added to ${update.planName}`
      case 'meal_updated':
        return `${update.mealName} was updated in ${update.planName}`
      case 'plan_shared':
        return `${update.planName} was shared with you`
      default:
        return `${update.planName} was updated`
    }
  }
}

// Export service instances
export const shoppingListManager = new RealtimeShoppingListManager()
export const cookingSessionManager = new LiveCookingSessionManager()
export const mealPlanManager = new RealtimeMealPlanManager()
export const notificationManager = new PushNotificationManager()