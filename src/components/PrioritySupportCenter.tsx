import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { MessageSquare, Phone, Mail, Clock, User, AlertTriangle, CheckCircle, Star, Headphones, Zap, Crown, Video, FileText, Send } from 'lucide-react';
import { PremiumFeaturesService, PrioritySupportTicket, SupportAgent, SupportMessage } from '../lib/premiumFeatures';

const PrioritySupportCenter: React.FC = () => {
  const [tickets, setTickets] = useState<PrioritySupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<PrioritySupportTicket | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<SupportAgent[]>([]);
  const [newTicketForm, setNewTicketForm] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'Medium',
    attachments: [] as string[]
  });
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const service = new PremiumFeaturesService();

  useEffect(() => {
    loadSupportData();
  }, []);

  const loadSupportData = async () => {
    setIsLoading(true);
    try {
      // Load support agents
      const agent = await service.getAvailablePremiumAgent();
      setAvailableAgents([agent]);

      // Mock existing tickets
      setTickets([
        {
          id: 'ticket-001',
          userId: 'current-user',
          subject: 'Recipe scaling not working properly',
          description: 'When I try to scale recipes for 6 people, the ingredient amounts seem incorrect.',
          category: 'Recipe',
          priority: 'Medium',
          status: 'Resolved',
          assignedAgent: agent,
          createdDate: '2024-03-10T10:00:00Z',
          lastUpdated: '2024-03-12T14:30:00Z',
          responseTime: 15, // 15 minutes
          resolutionTime: 2880, // 48 hours
          messages: [
            {
              id: 'msg-001',
              ticketId: 'ticket-001',
              senderId: 'current-user',
              senderType: 'Customer',
              content: 'I\'m having trouble with recipe scaling. When I change from 4 to 6 servings, the amounts don\'t look right.',
              timestamp: '2024-03-10T10:00:00Z',
              isRead: true,
              messageType: 'Text'
            },
            {
              id: 'msg-002',
              ticketId: 'ticket-001',
              senderId: 'agent-premium-001',
              senderType: 'Agent',
              content: 'Hi! I\'d be happy to help you with recipe scaling. Can you tell me which specific recipe you\'re having trouble with? This will help me reproduce the issue.',
              timestamp: '2024-03-10T10:15:00Z',
              isRead: true,
              messageType: 'Text'
            },
            {
              id: 'msg-003',
              ticketId: 'ticket-001',
              senderId: 'current-user',
              senderType: 'Customer',
              content: 'It\'s the "Mediterranean Quinoa Bowl" recipe. When I scale from 4 to 6 servings, it shows 2.25 cups of quinoa instead of 1.5 cups.',
              timestamp: '2024-03-10T11:30:00Z',
              isRead: true,
              messageType: 'Text'
            },
            {
              id: 'msg-004',
              ticketId: 'ticket-001',
              senderId: 'agent-premium-001',
              senderType: 'Agent',
              content: 'Thank you for the details! I\'ve identified the issue - there was a rounding error in our scaling algorithm for fractional ingredients. Our development team has fixed this and the update is now live. Please try scaling the recipe again and let me know if you see the correct amounts now.',
              timestamp: '2024-03-12T14:30:00Z',
              isRead: true,
              messageType: 'Text'
            }
          ],
          attachments: [],
          escalationLevel: 0,
          satisfactionRating: 5,
          tags: ['recipe-scaling', 'bug-fix'],
          relatedTickets: [],
          internalNotes: []
        },
        {
          id: 'ticket-002',
          userId: 'current-user',
          subject: 'Premium recipe collection payment issue',
          description: 'I purchased the Gordon Ramsay collection but can\'t access it.',
          category: 'Billing',
          priority: 'High',
          status: 'In Progress',
          assignedAgent: agent,
          createdDate: '2024-03-15T09:30:00Z',
          lastUpdated: '2024-03-15T10:00:00Z',
          responseTime: 5, // 5 minutes
          messages: [
            {
              id: 'msg-005',
              ticketId: 'ticket-002',
              senderId: 'current-user',
              senderType: 'Customer',
              content: 'I completed the purchase for Gordon Ramsay\'s Signature Steaks collection about an hour ago but I still can\'t access the recipes. The payment went through (I have the confirmation email) but the collection doesn\'t appear in my premium content.',
              timestamp: '2024-03-15T09:30:00Z',
              isRead: true,
              messageType: 'Text'
            },
            {
              id: 'msg-006',
              ticketId: 'ticket-002',
              senderId: 'agent-premium-001',
              senderType: 'Agent',
              content: 'I\'m so sorry for the inconvenience! As a premium subscriber, this should have been instant. I\'m checking your account now and will have this resolved within the next 15 minutes. I\'ll also add a complimentary bonus collection for the trouble.',
              timestamp: '2024-03-15T09:35:00Z',
              isRead: true,
              messageType: 'Text'
            }
          ],
          attachments: [],
          escalationLevel: 1,
          tags: ['billing', 'premium-content', 'urgent'],
          relatedTickets: [],
          internalNotes: []
        }
      ]);
    } catch (error) {
      console.error('Failed to load support data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicketForm.subject || !newTicketForm.description || !newTicketForm.category) {
      return;
    }

    try {
      const ticket = await service.createSupportTicket(
        'current-user',
        newTicketForm.subject,
        newTicketForm.description,
        newTicketForm.category,
        newTicketForm.priority
      );
      
      setTickets([ticket, ...tickets]);
      setShowCreateDialog(false);
      setNewTicketForm({
        subject: '',
        description: '',
        category: '',
        priority: 'Medium',
        attachments: []
      });
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const message: SupportMessage = {
      id: `msg-${Date.now()}`,
      ticketId: selectedTicket.id,
      senderId: 'current-user',
      senderType: 'Customer',
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false,
      messageType: 'Text'
    };

    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === selectedTicket.id) {
        return {
          ...ticket,
          messages: [...ticket.messages, message],
          lastUpdated: new Date().toISOString()
        };
      }
      return ticket;
    });

    setTickets(updatedTickets);
    setSelectedTicket({
      ...selectedTicket,
      messages: [...selectedTicket.messages, message],
      lastUpdated: new Date().toISOString()
    });
    setNewMessage('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'secondary';
      case 'in progress': return 'default';
      case 'waiting for customer': return 'outline';
      case 'resolved': return 'outline';
      case 'closed': return 'outline';
      default: return 'outline';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getResponseTimeText = (responseTime: number) => {
    if (responseTime < 60) return `${responseTime} minutes`;
    const hours = Math.floor(responseTime / 60);
    const minutes = responseTime % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hours`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading support center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Crown className="h-8 w-8 text-yellow-500" />
          Priority Support Center
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get premium support with priority response times, dedicated agents, and personalized assistance.
        </p>
      </div>

      {/* Premium Support Benefits */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Your Premium Support Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">15-Minute Response</h4>
                <p className="text-sm text-muted-foreground">Priority queue for faster support</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Dedicated Agents</h4>
                <p className="text-sm text-muted-foreground">Specialized premium support team</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Video className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">Video Support</h4>
                <p className="text-sm text-muted-foreground">Screen sharing and video calls</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <MessageSquare className="h-5 w-5" />
              Create Support Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Priority Support Ticket</DialogTitle>
              <DialogDescription>
                Get fast, personalized help from our premium support team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newTicketForm.category} onValueChange={(value) => 
                    setNewTicketForm(prev => ({ ...prev, category: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technical">Technical Issue</SelectItem>
                      <SelectItem value="Billing">Billing & Payments</SelectItem>
                      <SelectItem value="Recipe">Recipe Support</SelectItem>
                      <SelectItem value="Nutrition">Nutrition Guidance</SelectItem>
                      <SelectItem value="Account">Account Management</SelectItem>
                      <SelectItem value="Feature Request">Feature Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newTicketForm.priority} onValueChange={(value) => 
                    setNewTicketForm(prev => ({ ...prev, priority: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Critical">Critical (Account issues)</SelectItem>
                      <SelectItem value="High">High (Premium features)</SelectItem>
                      <SelectItem value="Medium">Medium (General support)</SelectItem>
                      <SelectItem value="Low">Low (Questions)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide detailed information about your issue..."
                  rows={5}
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTicket}>
                Create Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Button variant="outline" size="lg" className="gap-2">
          <Phone className="h-5 w-5" />
          Schedule Call
        </Button>
        
        <Button variant="outline" size="lg" className="gap-2">
          <Video className="h-5 w-5" />
          Live Chat
        </Button>
      </div>

      {/* Support Dashboard */}
      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="agents">Support Agents</TabsTrigger>
          <TabsTrigger value="resources">Help Resources</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tickets List */}
            <div className="lg:col-span-2 space-y-4">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg">{ticket.subject}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {ticket.description}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                          <Badge variant={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">{ticket.category}</Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Response: {getResponseTimeText(ticket.responseTime)}
                          </div>
                        </div>
                        <div>
                          Created {formatTime(ticket.createdDate)}
                        </div>
                      </div>

                      {ticket.assignedAgent && (
                        <div className="flex items-center gap-2 text-sm">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {ticket.assignedAgent.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground">Assigned to</span>
                          <span className="font-medium">{ticket.assignedAgent.name}</span>
                          <div className="flex items-center gap-1 ml-2">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{ticket.assignedAgent.rating}</span>
                          </div>
                        </div>
                      )}

                      {ticket.satisfactionRating && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Your rating:</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i <= ticket.satisfactionRating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Ticket Details */}
            <div className="lg:col-span-1">
              {selectedTicket ? (
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-base">{selectedTicket.subject}</span>
                      <Badge variant={getStatusColor(selectedTicket.status)}>
                        {selectedTicket.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Ticket #{selectedTicket.id.split('-')[1]}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Messages */}
                    <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                      {selectedTicket.messages.map((message) => (
                        <div key={message.id} className={`flex ${message.senderType === 'Customer' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            message.senderType === 'Customer' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.senderType === 'Customer' 
                                ? 'text-primary-foreground/70' 
                                : 'text-muted-foreground'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* New Message Input */}
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows={3}
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()} className="w-full gap-2">
                        <Send className="h-4 w-4" />
                        Send Message
                      </Button>
                    </div>

                    {/* Ticket Info */}
                    <div className="pt-4 border-t space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority:</span>
                        <Badge variant={getPriorityColor(selectedTicket.priority)}>
                          {selectedTicket.priority}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span>{selectedTicket.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(selectedTicket.createdDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Response Time:</span>
                        <span className="text-green-600">{getResponseTimeText(selectedTicket.responseTime)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No Ticket Selected</h3>
                    <p className="text-sm text-muted-foreground">
                      Click on a ticket to view details and continue the conversation.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableAgents.map((agent) => (
              <Card key={agent.id}>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <Avatar className="h-16 w-16 mx-auto">
                      <AvatarFallback className="text-lg">
                        {agent.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-bold text-lg">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground">{agent.email}</p>
                    </div>

                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{agent.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({agent.totalTicketsResolved} tickets)
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${agent.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm">{agent.isOnline ? 'Online' : 'Offline'}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Avg response: {agent.averageResponseTime} min
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Specialties:</h4>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {agent.specialties.map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Languages:</h4>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {agent.languages.map((language) => (
                          <Badge key={language} variant="secondary" className="text-xs">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Message {agent.name.split(' ')[0]}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Help Articles
                </CardTitle>
                <CardDescription>Common questions and solutions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'How to access premium recipe collections',
                    'Setting up meal plan preferences',
                    'Using the AI nutritionist consultation',
                    'Exporting meal plans and shopping lists',
                    'Managing your subscription settings'
                  ].map((article, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 hover:bg-muted rounded cursor-pointer">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{article}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video Tutorials
                </CardTitle>
                <CardDescription>Step-by-step video guides</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'Premium Features Overview (5:32)',
                    'Using Celebrity Chef Collections (8:15)',
                    'AI Nutritionist Setup Guide (6:45)',
                    'Advanced Meal Planning Tips (12:20)',
                    'Export & Sharing Features (4:18)'
                  ].map((video, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 hover:bg-muted rounded cursor-pointer">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{video}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Support Feedback</CardTitle>
              <CardDescription>Help us improve our support experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-4">How was your support experience?</h3>
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button key={rating} variant="outline" size="sm" className="w-12 h-12 p-0">
                        <Star className="h-5 w-5" />
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="feedback-comments">Additional Comments</Label>
                    <Textarea
                      id="feedback-comments"
                      placeholder="Tell us about your experience..."
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <Label>What did we do well?</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        'Quick response time',
                        'Knowledgeable agent',
                        'Clear communication',
                        'Problem solved efficiently',
                        'Friendly service',
                        'Follow-up support'
                      ].map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input type="checkbox" id={`good-${index}`} className="rounded" />
                          <label htmlFor={`good-${index}`} className="text-sm">{item}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>What could we improve?</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        'Faster response time',
                        'More detailed explanations',
                        'Better follow-up',
                        'More self-service options',
                        'Video call support',
                        'Extended support hours'
                      ].map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input type="checkbox" id={`improve-${index}`} className="rounded" />
                          <label htmlFor={`improve-${index}`} className="text-sm">{item}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full">Submit Feedback</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrioritySupportCenter;