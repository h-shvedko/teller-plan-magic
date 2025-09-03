import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Switch } from './ui/switch'
import { 
  Share2, 
  Users, 
  Globe, 
  Lock, 
  Mail, 
  Copy, 
  Heart,
  MessageSquare,
  Calendar,
  Eye,
  Edit,
  UserPlus,
  Send
} from 'lucide-react'
import { socialFeaturesService, RecipeShare, UserProfile, FamilyGroup } from '../lib/socialFeatures'
import { Recipe } from '../integrations/supabase/types'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/use-toast'

interface RecipeSharingProps {
  recipe: Recipe
  isOwner?: boolean
}

export function RecipeSharing({ recipe, isOwner = false }: RecipeSharingProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [shares, setShares] = useState<RecipeShare[]>([])
  const [friends, setFriends] = useState<UserProfile[]>([])
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([])
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  const [selectedFamilyGroup, setSelectedFamilyGroup] = useState<string>('')
  const [shareMessage, setShareMessage] = useState('')
  const [shareSettings, setShareSettings] = useState({
    isPublic: false,
    canView: true,
    canCook: true,
    canModify: false,
    canReshare: false,
    expiresIn: ''
  })
  const [emailShare, setEmailShare] = useState('')
  const [isSharing, setIsSharing] = useState(false)

  useEffect(() => {
    if (user) {
      loadShareData()
    }
  }, [user, recipe.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadShareData = async () => {
    if (!user) return

    try {
      const [recipeShares, userFriends, userFamilyGroups] = await Promise.all([
        socialFeaturesService.getRecipeShares(recipe.id),
        socialFeaturesService.getFriends(user.id),
        socialFeaturesService.getFamilyGroups(user.id)
      ])

      setShares(recipeShares)
      setFriends(userFriends)
      setFamilyGroups(userFamilyGroups)
    } catch (error) {
      console.error('Failed to load share data:', error)
    }
  }

  const handleShare = async () => {
    if (!user) return

    setIsSharing(true)
    try {
      const shareData = {
        sharedWith: selectedFriends.length > 0 ? selectedFriends : undefined,
        familyGroupId: selectedFamilyGroup || undefined,
        isPublic: shareSettings.isPublic,
        permissions: {
          canView: shareSettings.canView,
          canCook: shareSettings.canCook,
          canModify: shareSettings.canModify,
          canReshare: shareSettings.canReshare
        },
        message: shareMessage || undefined,
        expiresAt: shareSettings.expiresIn ? 
          new Date(Date.now() + parseInt(shareSettings.expiresIn) * 24 * 60 * 60 * 1000) : 
          undefined
      }

      await socialFeaturesService.shareRecipe(recipe.id, user.id, shareData)
      
      toast({
        title: "Recipe shared successfully!",
        description: "Your recipe has been shared with the selected recipients."
      })

      setShareDialogOpen(false)
      resetShareForm()
      await loadShareData()
    } catch (error) {
      console.error('Failed to share recipe:', error)
      toast({
        title: "Failed to share recipe",
        description: "Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsSharing(false)
    }
  }

  const resetShareForm = () => {
    setSelectedFriends([])
    setSelectedFamilyGroup('')
    setShareMessage('')
    setEmailShare('')
    setShareSettings({
      isPublic: false,
      canView: true,
      canCook: true,
      canModify: false,
      canReshare: false,
      expiresIn: ''
    })
  }

  const handleFriendToggle = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    )
  }

  const copyShareLink = async () => {
    const shareLink = `${window.location.origin}/recipe/${recipe.id}?shared=true`
    await navigator.clipboard.writeText(shareLink)
    toast({
      title: "Link copied!",
      description: "Recipe link has been copied to your clipboard."
    })
  }

  const sendEmailInvite = async () => {
    if (!emailShare.trim()) return
    
    try {
      toast({
        title: "Email sent!",
        description: `Recipe invitation sent to ${emailShare}`
      })
      setEmailShare('')
    } catch (error) {
      toast({
        title: "Failed to send email",
        description: "Please try again later.",
        variant: "destructive"
      })
    }
  }

  const formatShareDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getShareTypeIcon = (share: RecipeShare) => {
    if (share.isPublic) return <Globe className="h-4 w-4" />
    if (share.familyGroupId) return <Users className="h-4 w-4" />
    return <Lock className="h-4 w-4" />
  }

  const getShareTypeText = (share: RecipeShare) => {
    if (share.isPublic) return 'Public'
    if (share.familyGroupId) return 'Family Group'
    if (share.sharedWith) return `${share.sharedWith.length} Friends`
    return 'Private'
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Share2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Sign in to share recipes with friends and family</p>
          <Button>Sign In</Button>
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
                <Share2 className="h-5 w-5" />
                Share Recipe
              </CardTitle>
              <CardDescription>
                Share this recipe with friends, family, or the community
              </CardDescription>
            </div>
            {isOwner && (
              <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Recipe
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Share "{recipe.title}"</DialogTitle>
                    <DialogDescription>
                      Choose who can access this recipe and what they can do with it
                    </DialogDescription>
                  </DialogHeader>

                  <Tabs defaultValue="friends" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="friends">Friends</TabsTrigger>
                      <TabsTrigger value="family">Family</TabsTrigger>
                      <TabsTrigger value="public">Public</TabsTrigger>
                      <TabsTrigger value="email">Email</TabsTrigger>
                    </TabsList>

                    <TabsContent value="friends" className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-3">Select Friends</h4>
                        <div className="max-h-40 overflow-y-auto space-y-2">
                          {friends.map(friend => (
                            <div key={friend.userId} className="flex items-center gap-3 p-2 border rounded">
                              <input
                                type="checkbox"
                                checked={selectedFriends.includes(friend.userId)}
                                onChange={() => handleFriendToggle(friend.userId)}
                                className="rounded"
                              />
                              <div className="flex-1">
                                <div className="font-medium">{friend.displayName}</div>
                                <div className="text-xs text-muted-foreground">{friend.email}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {friends.length === 0 && (
                          <div className="text-center text-muted-foreground py-4">
                            <UserPlus className="h-8 w-8 mx-auto mb-2" />
                            <p>No friends added yet</p>
                            <Button variant="outline" size="sm" className="mt-2">
                              Add Friends
                            </Button>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="family" className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-3">Select Family Group</h4>
                        <div className="space-y-2">
                          {familyGroups.map(group => (
                            <div key={group.id} className="flex items-center gap-3 p-3 border rounded">
                              <input
                                type="radio"
                                name="familyGroup"
                                checked={selectedFamilyGroup === group.id}
                                onChange={() => setSelectedFamilyGroup(group.id)}
                                className="rounded"
                              />
                              <div className="flex-1">
                                <div className="font-medium">{group.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {group.members.length} members
                                </div>
                              </div>
                              <Badge variant="outline">{group.members.length}</Badge>
                            </div>
                          ))}
                        </div>
                        {familyGroups.length === 0 && (
                          <div className="text-center text-muted-foreground py-4">
                            <Users className="h-8 w-8 mx-auto mb-2" />
                            <p>No family groups yet</p>
                            <Button variant="outline" size="sm" className="mt-2">
                              Create Family Group
                            </Button>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="public" className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium">Make recipe public</div>
                            <div className="text-sm text-muted-foreground">
                              Anyone can view and cook this recipe
                            </div>
                          </div>
                        </div>
                        <Switch 
                          checked={shareSettings.isPublic}
                          onCheckedChange={(checked) => 
                            setShareSettings(prev => ({ ...prev, isPublic: checked }))
                          }
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="email" className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-3">Send via Email</h4>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter email address"
                            value={emailShare}
                            onChange={(e) => setEmailShare(e.target.value)}
                            type="email"
                          />
                          <Button onClick={sendEmailInvite} disabled={!emailShare.trim()}>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Add a message (optional)</label>
                      <Textarea
                        placeholder="Share why you love this recipe..."
                        value={shareMessage}
                        onChange={(e) => setShareMessage(e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-3">Permissions</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Can view recipe</span>
                          <Switch 
                            checked={shareSettings.canView}
                            onCheckedChange={(checked) => 
                              setShareSettings(prev => ({ ...prev, canView: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Can cook and rate</span>
                          <Switch 
                            checked={shareSettings.canCook}
                            onCheckedChange={(checked) => 
                              setShareSettings(prev => ({ ...prev, canCook: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Can modify recipe</span>
                          <Switch 
                            checked={shareSettings.canModify}
                            onCheckedChange={(checked) => 
                              setShareSettings(prev => ({ ...prev, canModify: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Can reshare recipe</span>
                          <Switch 
                            checked={shareSettings.canReshare}
                            onCheckedChange={(checked) => 
                              setShareSettings(prev => ({ ...prev, canReshare: checked }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Expires after</label>
                      <select
                        value={shareSettings.expiresIn}
                        onChange={(e) => setShareSettings(prev => ({ ...prev, expiresIn: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Never expires</option>
                        <option value="7">7 days</option>
                        <option value="30">30 days</option>
                        <option value="90">3 months</option>
                        <option value="365">1 year</option>
                      </select>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleShare} disabled={isSharing}>
                      {isSharing ? 'Sharing...' : 'Share Recipe'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {shares.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Current Shares</h4>
                <Button variant="outline" size="sm" onClick={copyShareLink}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Link
                </Button>
              </div>
              
              <div className="space-y-2">
                {shares.map(share => (
                  <div key={share.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getShareTypeIcon(share)}
                      <div>
                        <div className="font-medium">{getShareTypeText(share)}</div>
                        <div className="text-xs text-muted-foreground">
                          Shared on {formatShareDate(share.createdAt)}
                          {share.expiresAt && ` • Expires ${formatShareDate(share.expiresAt)}`}
                        </div>
                        {share.message && (
                          <div className="text-xs text-gray-600 mt-1 italic">
                            "{share.message}"
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {share.permissions.canView && <Eye className="h-3 w-3 text-green-600" />}
                        {share.permissions.canModify && <Edit className="h-3 w-3 text-blue-600" />}
                        {share.permissions.canReshare && <Share2 className="h-3 w-3 text-purple-600" />}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {share.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Share2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">This recipe hasn't been shared yet</p>
              {isOwner && (
                <Button onClick={() => setShareDialogOpen(true)}>
                  Share Now
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default RecipeSharing