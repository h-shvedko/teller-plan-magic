import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Trophy, 
  Star, 
  Target, 
  Clock, 
  Users, 
  BookOpen,
  Share2,
  Calendar,
  Zap,
  Award,
  Lock,
  CheckCircle,
  TrendingUp
} from 'lucide-react'
import { 
  socialFeaturesService, 
  Achievement, 
  UserAchievement
} from '../lib/socialFeatures'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/use-toast'

interface UserProgress {
  recipesCreated: number
  recipesShared: number
  friendsConnected: number
  collectionsCreated: number
  cuisinesExplored: string[]
  cookingStreak: number
  totalPoints: number
  level: number
}

export function CookingAchievements() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress>({
    recipesCreated: 12,
    recipesShared: 8,
    friendsConnected: 5,
    collectionsCreated: 2,
    cuisinesExplored: ['Italian', 'Mexican', 'Thai', 'French', 'Indian'],
    cookingStreak: 7,
    totalPoints: 285,
    level: 3
  })
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadAchievementData()
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadAchievementData = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const [allAchievements, unlockedAchievements] = await Promise.all([
        socialFeaturesService.getAchievements(),
        socialFeaturesService.getUserAchievements(user.id)
      ])

      setAchievements(allAchievements)
      setUserAchievements(unlockedAchievements)
    } catch (error) {
      console.error('Failed to load achievement data:', error)
      
      const mockAchievements = await socialFeaturesService.getAchievements()
      setAchievements(mockAchievements)
      
      setUserAchievements([
        {
          userId: user.id,
          achievementId: 'first_recipe',
          unlockedAt: new Date('2024-01-01'),
          isDisplayed: true
        },
        {
          userId: user.id,
          achievementId: 'social_chef',
          unlockedAt: new Date('2024-01-15'),
          isDisplayed: true
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const calculateProgress = (achievement: Achievement): number => {
    const requirement = achievement.requirements[0]
    
    switch (requirement.type) {
      case 'recipe_count':
        return Math.min(100, (userProgress.recipesCreated / requirement.target) * 100)
      case 'cuisine_variety':
        return Math.min(100, (userProgress.cuisinesExplored.length / requirement.target) * 100)
      case 'friend_count':
        return Math.min(100, (userProgress.friendsConnected / requirement.target) * 100)
      case 'shares_given':
        return Math.min(100, (userProgress.recipesShared / requirement.target) * 100)
      case 'collections_created':
        return Math.min(100, (userProgress.collectionsCreated / requirement.target) * 100)
      case 'days_streak':
        return Math.min(100, (userProgress.cookingStreak / requirement.target) * 100)
      default:
        return 0
    }
  }

  const isAchievementUnlocked = (achievementId: string): boolean => {
    return userAchievements.some(ua => ua.achievementId === achievementId)
  }

  const getNextLevelProgress = (): { current: number; next: number; progress: number } => {
    const pointsForCurrentLevel = userProgress.level * 100
    const pointsForNextLevel = (userProgress.level + 1) * 100
    const progressToNext = ((userProgress.totalPoints - pointsForCurrentLevel) / 100) * 100
    
    return {
      current: userProgress.level,
      next: userProgress.level + 1,
      progress: Math.min(100, progressToNext)
    }
  }

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50'
      case 'rare': return 'border-blue-300 bg-blue-50'
      case 'epic': return 'border-purple-300 bg-purple-50'
      case 'legendary': return 'border-yellow-300 bg-yellow-50'
      default: return 'border-gray-300 bg-gray-50'
    }
  }

  const getRarityBadge = (rarity: string): React.ReactNode => {
    const colors = {
      common: 'bg-gray-100 text-gray-800',
      rare: 'bg-blue-100 text-blue-800',
      epic: 'bg-purple-100 text-purple-800',
      legendary: 'bg-yellow-100 text-yellow-800'
    }
    
    return (
      <Badge className={colors[rarity as keyof typeof colors]}>
        {rarity}
      </Badge>
    )
  }

  const getCategoryIcon = (category: string): React.ReactNode => {
    switch (category) {
      case 'cooking': return <Trophy className="h-4 w-4" />
      case 'social': return <Users className="h-4 w-4" />
      case 'collection': return <BookOpen className="h-4 w-4" />
      case 'sharing': return <Share2 className="h-4 w-4" />
      case 'milestone': return <Star className="h-4 w-4" />
      default: return <Award className="h-4 w-4" />
    }
  }

  const getFilteredAchievements = (): Achievement[] => {
    if (selectedCategory === 'all') return achievements
    if (selectedCategory === 'unlocked') {
      return achievements.filter(a => isAchievementUnlocked(a.id))
    }
    if (selectedCategory === 'locked') {
      return achievements.filter(a => !isAchievementUnlocked(a.id))
    }
    return achievements.filter(a => a.category === selectedCategory)
  }

  const levelInfo = getNextLevelProgress()

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
          <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Sign in to track your cooking achievements</p>
          <Button>Sign In</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Level & Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Your Cooking Journey
          </CardTitle>
          <CardDescription>
            Level up by completing achievements and earning points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                Level {userProgress.level}
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                {userProgress.totalPoints} total points
              </div>
              <Progress value={levelInfo.progress} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round((100 - levelInfo.progress))}% to Level {levelInfo.next}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Recipes Created</span>
                <Badge variant="outline">{userProgress.recipesCreated}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cuisines Explored</span>
                <Badge variant="outline">{userProgress.cuisinesExplored.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Current Streak</span>
                <Badge variant="outline">{userProgress.cookingStreak} days</Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Recipes Shared</span>
                <Badge variant="outline">{userProgress.recipesShared}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Friends Connected</span>
                <Badge variant="outline">{userProgress.friendsConnected}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Collections Created</span>
                <Badge variant="outline">{userProgress.collectionsCreated}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
          <CardDescription>
            Unlock badges by completing cooking challenges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
              <TabsTrigger value="locked">Locked</TabsTrigger>
              <TabsTrigger value="cooking">Cooking</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="collection">Collections</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredAchievements().map(achievement => {
                  const isUnlocked = isAchievementUnlocked(achievement.id)
                  const progress = calculateProgress(achievement)
                  const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id)
                  
                  return (
                    <Card key={achievement.id} className={`${getRarityColor(achievement.rarity)} ${isUnlocked ? '' : 'opacity-75'}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{achievement.badgeIcon}</div>
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {achievement.name}
                                {isUnlocked && <CheckCircle className="h-4 w-4 text-green-500" />}
                                {!isUnlocked && progress < 100 && <Lock className="h-4 w-4 text-gray-400" />}
                              </CardTitle>
                              <CardDescription className="text-sm">
                                {achievement.description}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(achievement.category)}
                          <Badge variant="outline" className="text-xs">{achievement.category}</Badge>
                          {getRarityBadge(achievement.rarity)}
                          <Badge variant="secondary" className="text-xs">{achievement.points} pts</Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        {isUnlocked ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">Unlocked!</span>
                            </div>
                            {userAchievement && (
                              <div className="text-xs text-muted-foreground">
                                Earned on {userAchievement.unlockedAt.toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Progress</span>
                              <span className="text-sm text-muted-foreground">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <div className="text-xs text-muted-foreground">
                              {achievement.requirements[0].type === 'recipe_count' && 
                                `Create ${achievement.requirements[0].target - userProgress.recipesCreated} more recipes`}
                              {achievement.requirements[0].type === 'cuisine_variety' && 
                                `Explore ${achievement.requirements[0].target - userProgress.cuisinesExplored.length} more cuisines`}
                              {achievement.requirements[0].type === 'friend_count' && 
                                `Connect with ${achievement.requirements[0].target - userProgress.friendsConnected} more friends`}
                              {achievement.requirements[0].type === 'shares_given' && 
                                `Share ${achievement.requirements[0].target - userProgress.recipesShared} more recipes`}
                              {achievement.requirements[0].type === 'collections_created' && 
                                `Create ${achievement.requirements[0].target - userProgress.collectionsCreated} more collections`}
                              {achievement.requirements[0].type === 'days_streak' && 
                                `Cook for ${achievement.requirements[0].target - userProgress.cookingStreak} more days`}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {getFilteredAchievements().length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4" />
                  <p>No achievements in this category</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recently Unlocked */}
      {userAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recently Unlocked
            </CardTitle>
            <CardDescription>
              Your latest achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userAchievements
                .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
                .slice(0, 3)
                .map(userAchievement => {
                  const achievement = achievements.find(a => a.id === userAchievement.achievementId)
                  if (!achievement) return null
                  
                  return (
                    <div key={userAchievement.achievementId} className="flex items-center gap-3 p-3 border rounded-lg bg-green-50">
                      <div className="text-xl">{achievement.badgeIcon}</div>
                      <div className="flex-1">
                        <div className="font-medium">{achievement.name}</div>
                        <div className="text-sm text-muted-foreground">{achievement.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">+{achievement.points} pts</div>
                        <div className="text-xs text-muted-foreground">
                          {userAchievement.unlockedAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CookingAchievements