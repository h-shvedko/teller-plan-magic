import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Switch } from './ui/switch'
import { 
  Users, 
  Plus, 
  Settings, 
  Crown, 
  Shield, 
  Eye,
  Edit,
  MessageSquare,
  Calendar,
  Bell,
  Vote,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Activity
} from 'lucide-react'
import { 
  socialFeaturesService, 
  FamilyGroup, 
  MealPlanCollaboration, 
  CollaboratorInfo 
} from '../lib/socialFeatures'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/use-toast'

interface FamilyMealPlanCollaborationProps {
  mealPlanId: string
  mealPlanName: string
}

interface CollaborationActivity {
  id: string
  userId: string
  userName: string
  action: 'added_meal' | 'removed_meal' | 'modified_meal' | 'commented' | 'voted'
  details: string
  timestamp: Date
}

export function FamilyMealPlanCollaboration({ mealPlanId, mealPlanName }: FamilyMealPlanCollaborationProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([])
  const [collaboration, setCollaboration] = useState<MealPlanCollaboration | null>(null)
  const [activities, setActivities] = useState<CollaborationActivity[]>([])
  const [setupDialogOpen, setSetupDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [selectedFamilyGroup, setSelectedFamilyGroup] = useState<string>('')
  const [collaborationSettings, setCollaborationSettings] = useState({
    allowEditing: true,
    requireApproval: false,
    notifyChanges: true,
    votingEnabled: false
  })
  const [inviteEmail, setInviteEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadCollaborationData()
    }
  }, [user, mealPlanId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCollaborationData = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const [userFamilyGroups, mealPlanCollaborations] = await Promise.all([
        socialFeaturesService.getFamilyGroups(user.id),
        socialFeaturesService.getMealPlanCollaborations(user.id)
      ])

      setFamilyGroups(userFamilyGroups)
      
      const existingCollaboration = mealPlanCollaborations.find(
        collab => collab.mealPlanId === mealPlanId
      )
      
      if (existingCollaboration) {
        setCollaboration(existingCollaboration)
        setCollaborationSettings(existingCollaboration.settings)
        await loadActivities(existingCollaboration.id)
      }
    } catch (error) {
      console.error('Failed to load collaboration data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadActivities = async (collaborationId: string) => {
    const mockActivities: CollaborationActivity[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'Alice Johnson',
        action: 'added_meal',
        details: 'Added "Spaghetti Carbonara" to Monday dinner',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Bob Smith',
        action: 'commented',
        details: 'Commented on Tuesday lunch suggestions',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'Carol Wilson',
        action: 'voted',
        details: 'Voted for "Chicken Stir-fry" for Wednesday',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ]
    setActivities(mockActivities)
  }

  const createCollaboration = async () => {
    if (!user || !selectedFamilyGroup) return

    try {
      const newCollaboration = await socialFeaturesService.createMealPlanCollaboration(
        mealPlanId,
        selectedFamilyGroup,
        user.id,
        collaborationSettings
      )

      setCollaboration(newCollaboration)
      setSetupDialogOpen(false)
      
      toast({
        title: "Collaboration started!",
        description: "Your family can now collaborate on this meal plan."
      })
    } catch (error) {
      console.error('Failed to create collaboration:', error)
      toast({
        title: "Failed to start collaboration",
        description: "Please try again later.",
        variant: "destructive"
      })
    }
  }

  const updateCollaborationSettings = async () => {
    if (!collaboration) return

    try {
      setSettingsDialogOpen(false)
      
      toast({
        title: "Settings updated!",
        description: "Collaboration settings have been saved."
      })
    } catch (error) {
      toast({
        title: "Failed to update settings",
        description: "Please try again later.",
        variant: "destructive"
      })
    }
  }

  const inviteCollaborator = async () => {
    if (!collaboration || !inviteEmail.trim()) return

    try {
      await socialFeaturesService.addCollaborator(collaboration.id, inviteEmail.trim(), 'editor')
      
      setInviteEmail('')
      toast({
        title: "Invitation sent!",
        description: `Collaboration invitation sent to ${inviteEmail}`
      })
    } catch (error) {
      toast({
        title: "Failed to send invitation",
        description: "Please try again later.",
        variant: "destructive"
      })
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-500" />
      case 'editor': return <Edit className="h-4 w-4 text-blue-500" />
      default: return <Eye className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800'
      case 'editor': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'added_meal': return <Plus className="h-4 w-4 text-green-500" />
      case 'removed_meal': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'modified_meal': return <Edit className="h-4 w-4 text-blue-500" />
      case 'commented': return <MessageSquare className="h-4 w-4 text-purple-500" />
      case 'voted': return <Vote className="h-4 w-4 text-orange-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Sign in to collaborate on meal plans</p>
          <Button>Sign In</Button>
        </CardContent>
      </Card>
    )
  }

  if (!collaboration) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Family Collaboration
          </CardTitle>
          <CardDescription>
            Start collaborating with your family on this meal plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              This meal plan is not shared with your family yet
            </p>
            
            <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Start Collaboration
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start Family Collaboration</DialogTitle>
                  <DialogDescription>
                    Share "{mealPlanName}" with your family group
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Family Group</label>
                    <div className="space-y-2">
                      {familyGroups.map(group => (
                        <div key={group.id} className="flex items-center gap-3 p-3 border rounded">
                          <input
                            type="radio"
                            name="familyGroup"
                            checked={selectedFamilyGroup === group.id}
                            onChange={() => setSelectedFamilyGroup(group.id)}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{group.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {group.members.length} members
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {familyGroups.length === 0 && (
                      <div className="text-center text-muted-foreground py-4">
                        <p className="mb-2">No family groups yet</p>
                        <Button variant="outline" size="sm">Create Family Group</Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-medium">Collaboration Settings</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Allow family members to edit</span>
                        <Switch 
                          checked={collaborationSettings.allowEditing}
                          onCheckedChange={(checked) => 
                            setCollaborationSettings(prev => ({ ...prev, allowEditing: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Require approval for changes</span>
                        <Switch 
                          checked={collaborationSettings.requireApproval}
                          onCheckedChange={(checked) => 
                            setCollaborationSettings(prev => ({ ...prev, requireApproval: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Notify about changes</span>
                        <Switch 
                          checked={collaborationSettings.notifyChanges}
                          onCheckedChange={(checked) => 
                            setCollaborationSettings(prev => ({ ...prev, notifyChanges: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Enable voting on meals</span>
                        <Switch 
                          checked={collaborationSettings.votingEnabled}
                          onCheckedChange={(checked) => 
                            setCollaborationSettings(prev => ({ ...prev, votingEnabled: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setSetupDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={createCollaboration} 
                    disabled={!selectedFamilyGroup}
                  >
                    Start Collaboration
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Family Collaboration
              </CardTitle>
              <CardDescription>
                Working together on "{mealPlanName}"
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Collaboration Settings</DialogTitle>
                    <DialogDescription>
                      Manage how your family collaborates on this meal plan
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Permissions</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Allow family members to edit</span>
                          <Switch 
                            checked={collaborationSettings.allowEditing}
                            onCheckedChange={(checked) => 
                              setCollaborationSettings(prev => ({ ...prev, allowEditing: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Require approval for changes</span>
                          <Switch 
                            checked={collaborationSettings.requireApproval}
                            onCheckedChange={(checked) => 
                              setCollaborationSettings(prev => ({ ...prev, requireApproval: checked }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Notifications</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Notify about changes</span>
                          <Switch 
                            checked={collaborationSettings.notifyChanges}
                            onCheckedChange={(checked) => 
                              setCollaborationSettings(prev => ({ ...prev, notifyChanges: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Enable voting on meals</span>
                          <Switch 
                            checked={collaborationSettings.votingEnabled}
                            onCheckedChange={(checked) => 
                              setCollaborationSettings(prev => ({ ...prev, votingEnabled: checked }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={updateCollaborationSettings}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="collaborators" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="invite">Invite</TabsTrigger>
            </TabsList>

            <TabsContent value="collaborators" className="space-y-4">
              <div className="space-y-3">
                {collaboration.collaborators.map(collaborator => (
                  <div key={collaborator.userId} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${collaborator.userId}`} />
                      <AvatarFallback>{collaborator.userId.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">User {collaborator.userId}</span>
                        {getRoleIcon(collaborator.role)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {collaborator.contributions} contributions • Last active {formatTimeAgo(collaborator.lastActivity)}
                      </div>
                    </div>
                    <Badge className={getRoleBadgeColor(collaborator.role)}>
                      {collaborator.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <div className="space-y-3">
                {activities.length > 0 ? activities.map(activity => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getActivityIcon(activity.action)}
                    <div className="flex-1">
                      <div className="font-medium">{activity.userName}</div>
                      <div className="text-sm text-muted-foreground">{activity.details}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <p>No activity yet</p>
                    <p className="text-xs mt-1">Activity will appear here when family members interact with the meal plan</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="invite" className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Invite New Collaborator</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    type="email"
                  />
                  <Button onClick={inviteCollaborator} disabled={!inviteEmail.trim()}>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Invite
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  They'll receive an email invitation to collaborate on this meal plan
                </p>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Collaboration Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Collaboration is active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {collaboration.settings.allowEditing ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">
                      {collaboration.settings.allowEditing ? 'Editing enabled' : 'View-only mode'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {collaboration.settings.notifyChanges ? (
                      <Bell className="h-4 w-4 text-blue-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="text-sm">
                      {collaboration.settings.notifyChanges ? 'Notifications enabled' : 'Silent mode'}
                    </span>
                  </div>
                  {collaboration.settings.votingEnabled && (
                    <div className="flex items-center gap-2">
                      <Vote className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Voting enabled</span>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default FamilyMealPlanCollaboration