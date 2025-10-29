import { Recipe } from '../integrations/supabase/types'

export interface UserProfile {
  userId: string
  displayName: string
  avatar?: string
  email: string
  bio?: string
  location?: string
  cookingLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  specialties: string[]
  joinedAt: Date
  isPublic: boolean
}

export interface FriendConnection {
  id: string
  userId: string
  friendId: string
  status: 'pending' | 'accepted' | 'blocked'
  createdAt: Date
  acceptedAt?: Date
}

export interface FamilyGroup {
  id: string
  name: string
  description?: string
  ownerId: string
  members: FamilyMember[]
  settings: FamilyGroupSettings
  createdAt: Date
}

export interface FamilyMember {
  userId: string
  role: 'owner' | 'admin' | 'member'
  permissions: FamilyPermissions
  joinedAt: Date
  nickname?: string
}

export interface FamilyPermissions {
  canEditMealPlans: boolean
  canAddRecipes: boolean
  canManageMembers: boolean
  canViewPrivateRecipes: boolean
}

export interface FamilyGroupSettings {
  mealPlanVisibility: 'all' | 'admins' | 'owner'
  recipeSharing: 'all' | 'members' | 'restricted'
  allowInvites: boolean
  requireApproval: boolean
}

export interface RecipeShare {
  id: string
  recipeId: string
  sharedBy: string
  sharedWith?: string[]
  familyGroupId?: string
  isPublic: boolean
  permissions: SharePermissions
  message?: string
  createdAt: Date
  expiresAt?: Date
}

export interface SharePermissions {
  canView: boolean
  canCook: boolean
  canModify: boolean
  canReshare: boolean
}

export interface MealPlanCollaboration {
  id: string
  mealPlanId: string
  familyGroupId: string
  collaborators: CollaboratorInfo[]
  settings: CollaborationSettings
  createdAt: Date
}

export interface CollaboratorInfo {
  userId: string
  role: 'owner' | 'editor' | 'viewer'
  lastActivity: Date
  contributions: number
}

export interface CollaborationSettings {
  allowEditing: boolean
  requireApproval: boolean
  notifyChanges: boolean
  votingEnabled: boolean
}

export interface CommunityCollection {
  id: string
  name: string
  description: string
  curatedBy: string
  category: string
  tags: string[]
  recipes: string[]
  isPublic: boolean
  isFeatured: boolean
  subscribers: number
  rating: number
  createdAt: Date
  updatedAt: Date
}

export interface Achievement {
  id: string
  name: string
  description: string
  category: 'cooking' | 'social' | 'collection' | 'sharing' | 'milestone'
  badgeIcon: string
  badgeColor: string
  requirements: AchievementRequirement[]
  points: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  isActive: boolean
}

export interface AchievementRequirement {
  type: 'recipe_count' | 'cuisine_variety' | 'friend_count' | 'shares_given' | 'collections_created' | 'days_streak'
  target: number
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time'
}

export interface UserAchievement {
  userId: string
  achievementId: string
  unlockedAt: Date
  progress?: number
  isDisplayed: boolean
}

export interface RecipeImportSource {
  type: 'url' | 'photo' | 'manual'
  originalUrl?: string
  originalImage?: string
  extractedData: RecipeImportData
  confidence: number
  needsReview: boolean
}

export interface RecipeImportData {
  title?: string
  description?: string
  ingredients?: Array<{
    name: string
    amount?: string
    unit?: string
    confidence: number
  }>
  instructions?: Array<{
    step: number
    text: string
    confidence: number
  }>
  prepTime?: number
  cookTime?: number
  servings?: number
  difficulty?: number
  tags?: string[]
  nutrition?: Record<string, number>
}

export class SocialFeaturesService {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return null
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  }

  async sendFriendRequest(userId: string, friendId: string): Promise<void> {
    const connection: FriendConnection = {
      id: `friend_${Date.now()}`,
      userId,
      friendId,
      status: 'pending',
      createdAt: new Date()
    }
  }

  async acceptFriendRequest(connectionId: string): Promise<void> {
  }

  async getFriends(userId: string): Promise<UserProfile[]> {
    return []
  }

  async getFriendRequests(userId: string): Promise<FriendConnection[]> {
    return []
  }

  async createFamilyGroup(ownerId: string, groupData: Omit<FamilyGroup, 'id' | 'createdAt'>): Promise<FamilyGroup> {
    const group: FamilyGroup = {
      id: `family_${Date.now()}`,
      createdAt: new Date(),
      ...groupData
    }
    return group
  }

  async inviteToFamilyGroup(groupId: string, inviterId: string, inviteeEmail: string): Promise<void> {
  }

  async joinFamilyGroup(groupId: string, userId: string, inviteCode?: string): Promise<void> {
  }

  async getFamilyGroups(userId: string): Promise<FamilyGroup[]> {
    return []
  }

  async shareRecipe(
    recipeId: string, 
    sharedBy: string, 
    shareData: {
      sharedWith?: string[]
      familyGroupId?: string
      isPublic?: boolean
      permissions?: Partial<SharePermissions>
      message?: string
      expiresAt?: Date
    }
  ): Promise<RecipeShare> {
    const share: RecipeShare = {
      id: `share_${Date.now()}`,
      recipeId,
      sharedBy,
      createdAt: new Date(),
      permissions: {
        canView: true,
        canCook: true,
        canModify: false,
        canReshare: false,
        ...shareData.permissions
      },
      isPublic: shareData.isPublic || false,
      ...shareData
    }
    return share
  }

  async getSharedRecipes(userId: string): Promise<RecipeShare[]> {
    return []
  }

  async getRecipeShares(recipeId: string): Promise<RecipeShare[]> {
    return []
  }

  async createMealPlanCollaboration(
    mealPlanId: string,
    familyGroupId: string,
    ownerId: string,
    settings?: Partial<CollaborationSettings>
  ): Promise<MealPlanCollaboration> {
    const collaboration: MealPlanCollaboration = {
      id: `collab_${Date.now()}`,
      mealPlanId,
      familyGroupId,
      collaborators: [{
        userId: ownerId,
        role: 'owner',
        lastActivity: new Date(),
        contributions: 0
      }],
      settings: {
        allowEditing: true,
        requireApproval: false,
        notifyChanges: true,
        votingEnabled: false,
        ...settings
      },
      createdAt: new Date()
    }
    return collaboration
  }

  async addCollaborator(collaborationId: string, userId: string, role: 'editor' | 'viewer'): Promise<void> {
  }

  async getMealPlanCollaborations(userId: string): Promise<MealPlanCollaboration[]> {
    return []
  }

  async createCommunityCollection(
    curatorId: string,
    collectionData: Omit<CommunityCollection, 'id' | 'createdAt' | 'updatedAt' | 'subscribers' | 'rating'>
  ): Promise<CommunityCollection> {
    const collection: CommunityCollection = {
      id: `collection_${Date.now()}`,
      curatedBy: curatorId,
      subscribers: 0,
      rating: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...collectionData
    }
    return collection
  }

  async getFeaturedCollections(): Promise<CommunityCollection[]> {
    return []
  }

  async searchCollections(query: string, category?: string): Promise<CommunityCollection[]> {
    return []
  }

  async subscribeToCollection(userId: string, collectionId: string): Promise<void> {
  }

  async getSubscribedCollections(userId: string): Promise<CommunityCollection[]> {
    return []
  }

  async getAchievements(): Promise<Achievement[]> {
    return [
      {
        id: 'first_recipe',
        name: 'First Recipe',
        description: 'Create your first recipe',
        category: 'cooking',
        badgeIcon: '👨‍🍳',
        badgeColor: '#4CAF50',
        requirements: [{ type: 'recipe_count', target: 1 }],
        points: 10,
        rarity: 'common',
        isActive: true
      },
      {
        id: 'social_chef',
        name: 'Social Chef',
        description: 'Share 5 recipes with friends',
        category: 'social',
        badgeIcon: '🤝',
        badgeColor: '#2196F3',
        requirements: [{ type: 'shares_given', target: 5 }],
        points: 25,
        rarity: 'rare',
        isActive: true
      },
      {
        id: 'cuisine_explorer',
        name: 'Cuisine Explorer',
        description: 'Cook recipes from 10 different cuisines',
        category: 'cooking',
        badgeIcon: '🌍',
        badgeColor: '#FF9800',
        requirements: [{ type: 'cuisine_variety', target: 10 }],
        points: 50,
        rarity: 'epic',
        isActive: true
      },
      {
        id: 'community_curator',
        name: 'Community Curator',
        description: 'Create 3 community collections',
        category: 'collection',
        badgeIcon: '📚',
        badgeColor: '#9C27B0',
        requirements: [{ type: 'collections_created', target: 3 }],
        points: 75,
        rarity: 'epic',
        isActive: true
      },
      {
        id: 'master_chef',
        name: 'Master Chef',
        description: 'Create 100 recipes',
        category: 'milestone',
        badgeIcon: '👑',
        badgeColor: '#FFD700',
        requirements: [{ type: 'recipe_count', target: 100 }],
        points: 200,
        rarity: 'legendary',
        isActive: true
      }
    ]
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return []
  }

  async checkAndUnlockAchievements(userId: string, activity: {
    type: 'recipe_created' | 'recipe_shared' | 'friend_added' | 'collection_created'
    data?: Record<string, unknown>
  }): Promise<Achievement[]> {
    return []
  }

  async importRecipeFromUrl(url: string): Promise<RecipeImportData> {
    const mockImport: RecipeImportData = {
      title: 'Imported Recipe',
      description: 'A delicious recipe imported from the web',
      ingredients: [
        { name: 'flour', amount: '2', unit: 'cups', confidence: 0.9 },
        { name: 'sugar', amount: '1', unit: 'cup', confidence: 0.8 }
      ],
      instructions: [
        { step: 1, text: 'Mix ingredients together', confidence: 0.9 },
        { step: 2, text: 'Bake for 30 minutes', confidence: 0.8 }
      ],
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      difficulty: 3
    }
    return mockImport
  }

  async importRecipeFromPhoto(imageData: string | File): Promise<RecipeImportData> {
    const mockImport: RecipeImportData = {
      title: 'Recipe from Photo',
      description: 'Extracted from image using OCR',
      ingredients: [
        { name: 'ingredient 1', amount: '1', unit: 'cup', confidence: 0.7 },
        { name: 'ingredient 2', amount: '2', unit: 'tbsp', confidence: 0.6 }
      ],
      instructions: [
        { step: 1, text: 'Prepare ingredients', confidence: 0.6 },
        { step: 2, text: 'Cook as instructed', confidence: 0.5 }
      ],
      prepTime: 20,
      cookTime: 25,
      servings: 2,
      difficulty: 2
    }
    return mockImport
  }

  async validateRecipeImport(importData: RecipeImportData): Promise<{
    isValid: boolean
    issues: Array<{
      field: string
      issue: string
      severity: 'error' | 'warning' | 'info'
    }>
    suggestions: Array<{
      field: string
      suggestion: string
    }>
  }> {
    const issues = []
    const suggestions = []

    if (!importData.title) {
      issues.push({ field: 'title', issue: 'Recipe title is required', severity: 'error' as const })
    }

    if (!importData.ingredients || importData.ingredients.length === 0) {
      issues.push({ field: 'ingredients', issue: 'At least one ingredient is required', severity: 'error' as const })
    }

    if (!importData.instructions || importData.instructions.length === 0) {
      issues.push({ field: 'instructions', issue: 'At least one instruction step is required', severity: 'error' as const })
    }

    if (importData.ingredients) {
      const lowConfidenceIngredients = importData.ingredients.filter(ing => ing.confidence < 0.7)
      if (lowConfidenceIngredients.length > 0) {
        issues.push({
          field: 'ingredients',
          issue: `${lowConfidenceIngredients.length} ingredients have low confidence`,
          severity: 'warning' as const
        })
        suggestions.push({
          field: 'ingredients',
          suggestion: 'Review and verify ingredient names and amounts'
        })
      }
    }

    if (importData.instructions) {
      const lowConfidenceSteps = importData.instructions.filter(step => step.confidence < 0.7)
      if (lowConfidenceSteps.length > 0) {
        issues.push({
          field: 'instructions',
          issue: `${lowConfidenceSteps.length} instruction steps have low confidence`,
          severity: 'warning' as const
        })
        suggestions.push({
          field: 'instructions',
          suggestion: 'Review and clarify instruction steps'
        })
      }
    }

    return {
      isValid: !issues.some(issue => issue.severity === 'error'),
      issues,
      suggestions
    }
  }
}

export const socialFeaturesService = new SocialFeaturesService()