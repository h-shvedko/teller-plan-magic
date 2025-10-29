import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { cookingSessionManager, CookingSession, CookingParticipant, CookingMessage } from '@/lib/realtime'
import { 
  Play,
  Pause,
  SkipForward,
  Users,
  MessageCircle,
  Clock,
  ChefHat,
  Video,
  Settings,
  Share2,
  UserPlus,
  Lightbulb,
  Timer,
  CheckCircle2,
  AlertCircle,
  Eye,
  Mic,
  MicOff,
  Camera,
  CameraOff
} from 'lucide-react'

interface LiveCookingSessionProps {
  sessionId: string
  currentUser?: {
    id: string
    name: string
    avatar?: string
  }
}

interface RecipeStep {
  number: number
  title: string
  instruction: string
  duration?: number
  temperature?: number
  tips?: string[]
  equipment?: string[]
  ingredients?: string[]
}

export function LiveCookingSession({ sessionId, currentUser }: LiveCookingSessionProps) {
  const { toast } = useToast()
  const [session, setSession] = useState<CookingSession | null>(null)
  const [participants, setParticipants] = useState<CookingParticipant[]>([])
  const [messages, setMessages] = useState<CookingMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const [recipeSteps, setRecipeSteps] = useState<RecipeStep[]>([])
  const [stepTimers, setStepTimers] = useState<Record<number, number>>({})
  const [isHost, setIsHost] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmails, setInviteEmails] = useState('')
  const [mediaDevices, setMediaDevices] = useState({
    video: false,
    audio: false,
    videoEnabled: true,
    audioEnabled: true
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    initializeCookingSession()
    setupRealtimeListeners()

    return () => {
      cleanupRealtimeListeners()
    }
  }, [sessionId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeCookingSession = async () => {
    if (!currentUser) return

    try {
      // Initialize mock cooking session
      const mockSteps: RecipeStep[] = [
        {
          number: 1,
          title: "Prepare Ingredients",
          instruction: "Wash and chop all vegetables. Measure out all spices and have them ready.",
          duration: 10,
          tips: ["Use a sharp knife for clean cuts", "Keep vegetables in separate bowls"],
          equipment: ["Chef's knife", "Cutting board", "Measuring spoons"],
          ingredients: ["2 onions", "3 cloves garlic", "1 bell pepper"]
        },
        {
          number: 2,
          title: "Heat the Pan",
          instruction: "Heat olive oil in a large skillet over medium-high heat until shimmering.",
          duration: 3,
          temperature: 375,
          tips: ["Don't let the oil smoke", "Test with a drop of water - it should sizzle"],
          equipment: ["Large skillet", "Wooden spoon"]
        },
        {
          number: 3,
          title: "Sauté Aromatics",
          instruction: "Add onions and cook until translucent, about 5 minutes. Add garlic and cook for another minute.",
          duration: 6,
          tips: ["Stir frequently to prevent burning", "The onions should be soft but not brown"],
          ingredients: ["Chopped onions", "Minced garlic"]
        },
        {
          number: 4,
          title: "Add Vegetables",
          instruction: "Add bell peppers and cook for 3-4 minutes until they start to soften.",
          duration: 4,
          tips: ["Keep the heat at medium-high", "Vegetables should retain some crunch"],
          ingredients: ["Bell peppers"]
        },
        {
          number: 5,
          title: "Season and Finish",
          instruction: "Add salt, pepper, and herbs. Stir everything together and cook for 2 more minutes.",
          duration: 2,
          tips: ["Taste and adjust seasoning", "Fresh herbs added at the end retain more flavor"],
          ingredients: ["Salt", "Black pepper", "Fresh herbs"]
        }
      ]

      const mockSession: CookingSession = {
        id: sessionId,
        recipeId: 'recipe123',
        recipeName: 'Mediterranean Vegetable Sauté',
        hostId: currentUser.id,
        hostName: currentUser.name,
        participants: [
          {
            id: `participant_${currentUser.id}`,
            userId: currentUser.id,
            userName: currentUser.name,
            avatar: currentUser.avatar,
            joinedAt: new Date(),
            role: 'host',
            status: 'active',
            currentStep: 0
          },
          {
            id: 'participant_user2',
            userId: 'user2',
            userName: 'Sarah Chen',
            joinedAt: new Date(Date.now() - 300000), // 5 minutes ago
            role: 'participant',
            status: 'active',
            currentStep: 1
          },
          {
            id: 'participant_user3',
            userId: 'user3',
            userName: 'Mike Rodriguez',
            joinedAt: new Date(Date.now() - 600000), // 10 minutes ago
            role: 'observer',
            status: 'active',
            currentStep: 0
          }
        ],
        status: 'active',
        currentStep: 0,
        totalSteps: mockSteps.length,
        startedAt: new Date(Date.now() - 900000), // 15 minutes ago
        isPublic: true,
        maxParticipants: 8,
        description: 'Join me in cooking this delicious Mediterranean vegetable dish!',
        tags: ['vegetarian', 'healthy', 'quick', 'beginner-friendly']
      }

      const mockMessages: CookingMessage[] = [
        {
          id: 'msg1',
          sessionId,
          userId: 'user2',
          userName: 'Sarah Chen',
          message: 'This looks amazing! Just joined and excited to cook along 👨‍🍳',
          type: 'chat',
          timestamp: new Date(Date.now() - 300000)
        },
        {
          id: 'msg2',
          sessionId,
          userId: currentUser.id,
          userName: currentUser.name,
          message: 'Welcome Sarah! We\'re just getting started with prep',
          type: 'chat',
          timestamp: new Date(Date.now() - 280000)
        },
        {
          id: 'msg3',
          sessionId,
          userId: 'user2',
          userName: 'Sarah Chen',
          message: 'Should I use red or yellow onions for this recipe?',
          type: 'question',
          timestamp: new Date(Date.now() - 240000),
          stepNumber: 1
        },
        {
          id: 'msg4',
          sessionId,
          userId: currentUser.id,
          userName: currentUser.name,
          message: 'Either works great! Yellow onions are a bit sweeter',
          type: 'tip',
          timestamp: new Date(Date.now() - 230000),
          stepNumber: 1
        }
      ]

      setSession(mockSession)
      setParticipants(mockSession.participants)
      setMessages(mockMessages)
      setCurrentStep(mockSession.currentStep)
      setRecipeSteps(mockSteps)
      setIsHost(mockSession.hostId === currentUser.id)

      // Join the session
      if (mockSession.hostId !== currentUser.id) {
        await cookingSessionManager.joinSession(sessionId, currentUser.id, currentUser.name)
      }

    } catch (error) {
      toast({
        title: "Error loading cooking session",
        description: "Failed to load cooking session data",
        variant: "destructive"
      })
    }
  }

  const setupRealtimeListeners = () => {
    cookingSessionManager.onMessage('chat', handleChatMessage)
    cookingSessionManager.onMessage('tip', handleTipMessage)
    cookingSessionManager.onMessage('question', handleQuestionMessage)
    cookingSessionManager.onMessage('timer', handleTimerMessage)

    window.addEventListener('cooking_session_started', handleSessionStarted)
    window.addEventListener('cooking_session_paused', handleSessionPaused)
    window.addEventListener('cooking_step_updated', handleStepUpdated)
    window.addEventListener('cooking_participant_joined', handleParticipantJoined)
    window.addEventListener('cooking_participant_left', handleParticipantLeft)
    window.addEventListener('cooking_message_received', handleMessageReceived)
  }

  const cleanupRealtimeListeners = () => {
    cookingSessionManager.offMessage('chat')
    cookingSessionManager.offMessage('tip')
    cookingSessionManager.offMessage('question')
    cookingSessionManager.offMessage('timer')

    window.removeEventListener('cooking_session_started', handleSessionStarted)
    window.removeEventListener('cooking_session_paused', handleSessionPaused)
    window.removeEventListener('cooking_step_updated', handleStepUpdated)
    window.removeEventListener('cooking_participant_joined', handleParticipantJoined)
    window.removeEventListener('cooking_participant_left', handleParticipantLeft)
    window.removeEventListener('cooking_message_received', handleMessageReceived)
  }

  const handleChatMessage = (data: any) => {
    setMessages(prev => [...prev, data.message])
  }

  const handleTipMessage = (data: any) => {
    setMessages(prev => [...prev, data.message])
    toast({
      title: "💡 Cooking Tip",
      description: data.message.message
    })
  }

  const handleQuestionMessage = (data: any) => {
    setMessages(prev => [...prev, data.message])
  }

  const handleTimerMessage = (data: any) => {
    setMessages(prev => [...prev, data.message])
    // Handle timer logic here
  }

  const handleSessionStarted = (event: any) => {
    setSession(prev => prev ? { ...prev, status: 'active', startedAt: event.detail.startedAt } : null)
  }

  const handleSessionPaused = (event: any) => {
    setSession(prev => prev ? { ...prev, status: 'paused' } : null)
  }

  const handleStepUpdated = (event: any) => {
    const { stepNumber } = event.detail
    setCurrentStep(stepNumber)
    setSession(prev => prev ? { ...prev, currentStep: stepNumber } : null)
  }

  const handleParticipantJoined = (event: any) => {
    const { participant } = event.detail
    setParticipants(prev => [...prev, participant])
    toast({
      title: "Participant joined",
      description: `${participant.userName} joined the cooking session`
    })
  }

  const handleParticipantLeft = (event: any) => {
    const { userId } = event.detail
    setParticipants(prev => prev.filter(p => p.userId !== userId))
  }

  const handleMessageReceived = (event: any) => {
    setMessages(prev => [...prev, event.detail.message])
  }

  const handleSendMessage = async () => {
    if (!currentUser || !newMessage.trim()) return

    const message: Omit<CookingMessage, 'id' | 'timestamp'> = {
      sessionId,
      userId: currentUser.id,
      userName: currentUser.name,
      message: newMessage.trim(),
      type: 'chat'
    }

    try {
      await cookingSessionManager.sendMessage(sessionId, message)
      setNewMessage('')
      if (messageInputRef.current) {
        messageInputRef.current.focus()
      }
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Failed to send message",
        variant: "destructive"
      })
    }
  }

  const handleStartSession = async () => {
    if (!isHost || !session) return

    try {
      await cookingSessionManager.startSession(sessionId)
    } catch (error) {
      toast({
        title: "Error starting session",
        description: "Failed to start cooking session",
        variant: "destructive"
      })
    }
  }

  const handlePauseSession = async () => {
    if (!isHost || !session) return

    try {
      await cookingSessionManager.pauseSession(sessionId)
    } catch (error) {
      toast({
        title: "Error pausing session",
        description: "Failed to pause cooking session",
        variant: "destructive"
      })
    }
  }

  const handleNextStep = async () => {
    if (!isHost || !session || currentStep >= recipeSteps.length - 1) return

    const nextStep = currentStep + 1
    try {
      await cookingSessionManager.nextStep(sessionId, nextStep)
    } catch (error) {
      toast({
        title: "Error advancing step",
        description: "Failed to advance to next step",
        variant: "destructive"
      })
    }
  }

  const handleUpdateMyStep = async (stepNumber: number) => {
    if (!currentUser) return

    try {
      await cookingSessionManager.updateParticipantStep(sessionId, currentUser.id, stepNumber)
      setParticipants(prev => 
        prev.map(p => 
          p.userId === currentUser.id 
            ? { ...p, currentStep: stepNumber }
            : p
        )
      )
    } catch (error) {
      toast({
        title: "Error updating progress",
        description: "Failed to update your progress",
        variant: "destructive"
      })
    }
  }

  const handleInviteParticipants = async () => {
    if (!inviteEmails.trim()) return

    const emails = inviteEmails.split(',').map(email => email.trim()).filter(email => email)
    
    // In real implementation, this would send invitations
    toast({
      title: "Invitations sent",
      description: `Cooking session invitations sent to ${emails.length} people`
    })
    
    setInviteEmails('')
    setInviteDialogOpen(false)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="h-4 w-4 text-yellow-500" />
      case 'question':
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case 'timer':
        return <Timer className="h-4 w-4 text-orange-500" />
      case 'step_update':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getParticipantProgress = (participant: CookingParticipant) => {
    return recipeSteps.length > 0 ? (participant.currentStep / recipeSteps.length) * 100 : 0
  }

  if (!session || !currentUser) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span>Loading cooking session...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentStepData = recipeSteps[currentStep]
  const progress = recipeSteps.length > 0 ? ((currentStep + 1) / recipeSteps.length) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <ChefHat className="h-6 w-6" />
                <span>{session.recipeName}</span>
                <Badge variant={session.status === 'active' ? 'secondary' : 'outline'} className={
                  session.status === 'active' ? 'bg-green-100 text-green-800' : ''
                }>
                  {session.status}
                </Badge>
              </CardTitle>
              <CardDescription className="flex items-center space-x-4">
                <span>Step {currentStep + 1} of {session.totalSteps}</span>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{participants.length} participants</span>
                </div>
                {session.startedAt && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Started {new Date(session.startedAt).toLocaleTimeString()}</span>
                  </div>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite to Cooking Session</DialogTitle>
                    <DialogDescription>
                      Invite others to join this live cooking session.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="invite-emails" className="block text-sm font-medium mb-2">
                        Email Addresses (comma-separated)
                      </label>
                      <Textarea
                        id="invite-emails"
                        placeholder="email1@example.com, email2@example.com"
                        value={inviteEmails}
                        onChange={(e) => setInviteEmails(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleInviteParticipants}>
                      Send Invitations
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {isHost && (
                <div className="flex items-center space-x-1">
                  {session.status === 'preparing' && (
                    <Button onClick={handleStartSession} size="sm">
                      <Play className="mr-2 h-4 w-4" />
                      Start
                    </Button>
                  )}
                  {session.status === 'active' && (
                    <>
                      <Button onClick={handlePauseSession} variant="outline" size="sm">
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </Button>
                      <Button 
                        onClick={handleNextStep} 
                        size="sm"
                        disabled={currentStep >= recipeSteps.length - 1}
                      >
                        <SkipForward className="mr-2 h-4 w-4" />
                        Next Step
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Progress */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Current Step */}
          {currentStepData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Step {currentStepData.number}: {currentStepData.title}</span>
                  {currentStepData.duration && (
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{currentStepData.duration} min</span>
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg">{currentStepData.instruction}</p>
                
                {currentStepData.temperature && (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      Temperature: {currentStepData.temperature}°F
                    </Badge>
                  </div>
                )}

                {currentStepData.ingredients && currentStepData.ingredients.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Ingredients for this step:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {currentStepData.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentStepData.equipment && currentStepData.equipment.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Equipment needed:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {currentStepData.equipment.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentStepData.tips && currentStepData.tips.length > 0 && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center space-x-1">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      <span>Pro Tips:</span>
                    </h4>
                    <ul className="text-sm space-y-1">
                      {currentStepData.tips.map((tip, index) => (
                        <li key={index}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-2">
                  <Button 
                    onClick={() => handleUpdateMyStep(currentStep)}
                    variant="outline"
                    size="sm"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark Complete
                  </Button>
                  <Button 
                    onClick={() => {
                      const tipMessage = `💡 ${currentStepData.tips?.[0] || 'Great job on this step!'}`
                      cookingSessionManager.sendMessage(sessionId, {
                        sessionId,
                        userId: currentUser.id,
                        userName: currentUser.name,
                        message: tipMessage,
                        type: 'tip',
                        stepNumber: currentStep
                      })
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Share Tip
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>Live Chat</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className="flex items-start space-x-2">
                      <div className="flex-shrink-0 mt-1">
                        {getMessageIcon(message.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{message.userName}</span>
                          <span className="text-xs text-gray-500">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          {message.stepNumber !== undefined && (
                            <Badge variant="outline" className="text-xs">
                              Step {message.stepNumber}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm mt-1">{message.message}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="flex space-x-2">
                <Input
                  ref={messageInputRef}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Participants ({participants.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {participants.map((participant) => (
                <div key={participant.id} className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback>
                        {participant.userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{participant.userName}</span>
                        {participant.role === 'host' && (
                          <Badge variant="secondary" className="text-xs">Host</Badge>
                        )}
                        {participant.role === 'observer' && (
                          <Badge variant="outline" className="text-xs">
                            <Eye className="mr-1 h-3 w-3" />
                            Observer
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Step {participant.currentStep + 1} of {recipeSteps.length}
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={getParticipantProgress(participant)} 
                    className="h-1"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium">Host</div>
                <div className="text-sm text-gray-600">{session.hostName}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Recipe</div>
                <div className="text-sm text-gray-600">{session.recipeName}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Duration</div>
                <div className="text-sm text-gray-600">
                  {recipeSteps.reduce((total, step) => total + (step.duration || 0), 0)} minutes
                </div>
              </div>
              {session.description && (
                <div>
                  <div className="text-sm font-medium">Description</div>
                  <div className="text-sm text-gray-600">{session.description}</div>
                </div>
              )}
              <div>
                <div className="text-sm font-medium">Tags</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {session.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}