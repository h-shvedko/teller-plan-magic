import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { MarketplaceService, SponsorshipInfo, MarketplaceRecipe } from '@/lib/marketplaceFeatures'
import { 
  Star, 
  DollarSign, 
  Eye, 
  TrendingUp,
  Calendar,
  Target,
  Award,
  Briefcase,
  BarChart3,
  FileText,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Image,
  Clock,
  Users
} from 'lucide-react'

interface SponsoredContentManagerProps {
  currentUser?: any
  chefId?: string
}

interface SponsorshipProposal {
  id: string
  brandName: string
  brandLogo: string
  campaignTitle: string
  description: string
  requirements: string[]
  compensation: {
    amount: number
    type: 'flat' | 'per-view' | 'per-click' | 'revenue-share'
    currency: string
  }
  duration: {
    startDate: Date
    endDate: Date
  }
  deliverables: string[]
  status: 'pending' | 'accepted' | 'declined' | 'active' | 'completed'
  submittedAt: Date
}

interface CampaignPerformance {
  campaignId: string
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  engagementRate: number
  clickThroughRate: number
  conversionRate: number
  roi: number
}

export function SponsoredContentManager({ currentUser, chefId }: SponsoredContentManagerProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('opportunities')
  const [sponsorshipProposals, setSponsorshipProposals] = useState<SponsorshipProposal[]>([])
  const [activeSponsorships, setActiveSponsorships] = useState<SponsorshipInfo[]>([])
  const [sponsoredRecipes, setSponsoredRecipes] = useState<MarketplaceRecipe[]>([])
  const [campaignPerformance, setCampaignPerformance] = useState<CampaignPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [proposalDialogOpen, setProposalDialogOpen] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<SponsorshipProposal | null>(null)

  const [applicationForm, setApplicationForm] = useState({
    brandInterests: [] as string[],
    audienceDescription: '',
    contentStyle: '',
    rateCard: {
      flatFee: 0,
      perViewRate: 0,
      perClickRate: 0
    },
    portfolioUrls: [] as string[],
    exclusivityPreferences: 'non-exclusive'
  })

  // Mock data for demonstration
  const mockProposals: SponsorshipProposal[] = [
    {
      id: 'prop1',
      brandName: 'Williams Sonoma',
      brandLogo: 'https://example.com/williams-sonoma-logo.jpg',
      campaignTitle: 'Holiday Baking Collection',
      description: 'Create 3 holiday baking recipes featuring Williams Sonoma bakeware and tools.',
      requirements: [
        'Feature at least 3 Williams Sonoma products in recipes',
        'Include product placement in recipe photos',
        'Mention brand in video/description',
        'Use #WilliamsSonomaPartner hashtag'
      ],
      compensation: {
        amount: 2500,
        type: 'flat',
        currency: 'USD'
      },
      duration: {
        startDate: new Date('2024-11-01'),
        endDate: new Date('2024-12-31')
      },
      deliverables: [
        '3 original holiday recipes',
        'Professional recipe photography',
        'Recipe video content (optional, +$500)',
        'Social media promotion'
      ],
      status: 'pending',
      submittedAt: new Date('2024-10-15')
    },
    {
      id: 'prop2',
      brandName: 'KitchenAid',
      brandLogo: 'https://example.com/kitchenaid-logo.jpg',
      campaignTitle: 'Stand Mixer Recipe Series',
      description: 'Showcase the versatility of KitchenAid stand mixers with 5 diverse recipes.',
      requirements: [
        'Feature KitchenAid stand mixer in all recipes',
        'Highlight unique mixer attachments',
        'Create step-by-step video content',
        'Cross-promote on social media'
      ],
      compensation: {
        amount: 3500,
        type: 'flat',
        currency: 'USD'
      },
      duration: {
        startDate: new Date('2024-12-01'),
        endDate: new Date('2025-02-28')
      },
      deliverables: [
        '5 stand mixer recipes',
        'Video content for each recipe',
        'Professional photography',
        'Blog post series',
        'Instagram Reels'
      ],
      status: 'pending',
      submittedAt: new Date('2024-10-20')
    }
  ]

  const mockActiveSponsorships: SponsorshipInfo[] = [
    {
      id: 'active1',
      sponsorName: 'Whole Foods Market',
      sponsorLogo: 'https://example.com/wholefoods-logo.jpg',
      sponsorshipType: 'ingredient',
      campaignId: 'wfm_organic_fall',
      displayRequirements: {
        showSponsorLogo: true,
        mentionInDescription: true,
        dedicatedCallout: true,
        disclaimerText: 'This recipe is sponsored by Whole Foods Market.'
      },
      compensation: {
        amount: 1500,
        currency: 'USD',
        type: 'flat'
      },
      performance: {
        impressions: 25400,
        clicks: 892,
        conversions: 156,
        revenue: 1500
      },
      duration: {
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-11-30')
      }
    }
  ]

  const mockPerformanceData: CampaignPerformance[] = [
    {
      campaignId: 'wfm_organic_fall',
      impressions: 25400,
      clicks: 892,
      conversions: 156,
      revenue: 1500,
      engagementRate: 4.8,
      clickThroughRate: 3.5,
      conversionRate: 17.5,
      roi: 285
    }
  ]

  useEffect(() => {
    loadSponsorshipData()
  }, [chefId])

  const loadSponsorshipData = async () => {
    setLoading(true)
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 800))
      setSponsorshipProposals(mockProposals)
      setActiveSponsorships(mockActiveSponsorships)
      setCampaignPerformance(mockPerformanceData)
    } catch (error) {
      toast({
        title: "Error loading sponsorship data",
        description: "Failed to load sponsorship information",
        variant: "destructive"
      })
    }
    setLoading(false)
  }

  const handleAcceptProposal = async (proposalId: string) => {
    try {
      const proposal = sponsorshipProposals.find(p => p.id === proposalId)
      if (proposal) {
        // Create sponsorship from proposal
        const sponsorshipData = {
          sponsorName: proposal.brandName,
          sponsorLogo: proposal.brandLogo,
          sponsorshipType: 'brand' as any,
          displayRequirements: {
            showSponsorLogo: true,
            mentionInDescription: true,
            dedicatedCallout: true,
            disclaimerText: `This recipe is sponsored by ${proposal.brandName}.`
          },
          compensation: proposal.compensation,
          duration: proposal.duration
        }
        
        const newSponsorship = await MarketplaceService.createSponsorship(sponsorshipData)
        setActiveSponsorships([...activeSponsorships, newSponsorship])
        
        // Update proposal status
        setSponsorshipProposals(prev => 
          prev.map(p => p.id === proposalId ? { ...p, status: 'accepted' as const } : p)
        )
        
        toast({
          title: "Proposal accepted!",
          description: `Partnership with ${proposal.brandName} has been activated.`
        })
      }
    } catch (error) {
      toast({
        title: "Error accepting proposal",
        description: "Failed to accept sponsorship proposal",
        variant: "destructive"
      })
    }
  }

  const handleDeclineProposal = async (proposalId: string) => {
    setSponsorshipProposals(prev => 
      prev.map(p => p.id === proposalId ? { ...p, status: 'declined' as const } : p)
    )
    
    toast({
      title: "Proposal declined",
      description: "The sponsorship proposal has been declined."
    })
  }

  const handleSubmitApplication = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Application submitted!",
        description: "Your brand partnership application has been submitted for review."
      })
    } catch (error) {
      toast({
        title: "Error submitting application",
        description: "Failed to submit partnership application",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span>Loading sponsorship data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-6 w-6" />
            <span>Sponsored Content Manager</span>
          </CardTitle>
          <CardDescription>
            Manage brand partnerships, sponsored content campaigns, and track performance metrics.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="opportunities" className="flex items-center space-x-1">
            <Briefcase className="h-4 w-4" />
            <span>Opportunities</span>
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center space-x-1">
            <CheckCircle className="h-4 w-4" />
            <span>Active</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-1">
            <BarChart3 className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
          <TabsTrigger value="apply" className="flex items-center space-x-1">
            <Plus className="h-4 w-4" />
            <span>Apply</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Partnership Opportunities</h3>
            <Badge variant="secondary">{sponsorshipProposals.filter(p => p.status === 'pending').length} Pending</Badge>
          </div>
          
          {sponsorshipProposals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">No sponsorship opportunities yet</h3>
                <p className="text-gray-600 mb-4">Build your chef profile and publish quality recipes to attract brand partnerships.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sponsorshipProposals.map((proposal) => (
                <Card key={proposal.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Image className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">{proposal.brandName}</h4>
                          <p className="text-sm text-gray-600">{proposal.campaignTitle}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge 
                              variant={proposal.status === 'pending' ? 'default' : 
                                      proposal.status === 'accepted' ? 'secondary' : 'destructive'}
                            >
                              {proposal.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Submitted {proposal.submittedAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ${proposal.compensation.amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">{proposal.compensation.type} fee</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-2">Campaign Description</h5>
                        <p className="text-gray-600 text-sm">{proposal.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium mb-2">Requirements</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {proposal.requirements.map((req, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-2">Deliverables</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {proposal.deliverables.map((deliverable, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <FileText className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>{deliverable}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{proposal.duration.startDate.toLocaleDateString()} - {proposal.duration.endDate.toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        {proposal.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button variant="outline" onClick={() => handleDeclineProposal(proposal.id)}>
                              Decline
                            </Button>
                            <Button onClick={() => handleAcceptProposal(proposal.id)}>
                              Accept Partnership
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Active Sponsorships</h3>
            <Badge variant="secondary">{activeSponsorships.length} Active</Badge>
          </div>
          
          {activeSponsorships.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">No active sponsorships</h3>
                <p className="text-gray-600 mb-4">Accept partnership opportunities to start earning from sponsored content.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeSponsorships.map((sponsorship) => (
                <Card key={sponsorship.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Image className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">{sponsorship.sponsorName}</h4>
                          <p className="text-sm text-gray-600 capitalize">{sponsorship.sponsorshipType} Partnership</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="secondary">Active</Badge>
                            <span className="text-sm text-gray-500">
                              Ends {sponsorship.duration.endDate.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ${sponsorship.compensation.amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">{sponsorship.compensation.type} fee</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{sponsorship.performance.impressions.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Impressions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{sponsorship.performance.clicks}</div>
                        <div className="text-sm text-gray-500">Clicks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{sponsorship.performance.conversions}</div>
                        <div className="text-sm text-gray-500">Conversions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">${sponsorship.performance.revenue}</div>
                        <div className="text-sm text-gray-500">Revenue</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium">Display Requirements</h5>
                      <div className="text-sm text-gray-600">
                        <p>{sponsorship.displayRequirements.disclaimerText}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          {sponsorship.displayRequirements.showSponsorLogo && (
                            <span className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>Show logo</span>
                            </span>
                          )}
                          {sponsorship.displayRequirements.mentionInDescription && (
                            <span className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>Mention in description</span>
                            </span>
                          )}
                          {sponsorship.displayRequirements.dedicatedCallout && (
                            <span className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>Dedicated callout</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Campaign Performance</h3>
          </div>
          
          {campaignPerformance.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">No performance data yet</h3>
                <p className="text-gray-600 mb-4">Complete active campaigns to view performance analytics.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Performance Summary */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold">${campaignPerformance.reduce((sum, c) => sum + c.revenue, 0).toLocaleString()}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                        <p className="text-2xl font-bold">{campaignPerformance.reduce((sum, c) => sum + c.impressions, 0).toLocaleString()}</p>
                      </div>
                      <Eye className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg. CTR</p>
                        <p className="text-2xl font-bold">{(campaignPerformance.reduce((sum, c) => sum + c.clickThroughRate, 0) / campaignPerformance.length).toFixed(1)}%</p>
                      </div>
                      <Target className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg. ROI</p>
                        <p className="text-2xl font-bold">{(campaignPerformance.reduce((sum, c) => sum + c.roi, 0) / campaignPerformance.length).toFixed(0)}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Detailed Performance */}
              {campaignPerformance.map((performance) => (
                <Card key={performance.campaignId}>
                  <CardHeader>
                    <CardTitle className="text-lg">Campaign Performance: {performance.campaignId}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Engagement Rate</span>
                            <span className="text-sm text-gray-600">{performance.engagementRate}%</span>
                          </div>
                          <Progress value={performance.engagementRate * 10} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Click-Through Rate</span>
                            <span className="text-sm text-gray-600">{performance.clickThroughRate}%</span>
                          </div>
                          <Progress value={performance.clickThroughRate * 10} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Conversion Rate</span>
                            <span className="text-sm text-gray-600">{performance.conversionRate}%</span>
                          </div>
                          <Progress value={performance.conversionRate * 2} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Impressions:</span>
                          <span className="font-semibold">{performance.impressions.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Clicks:</span>
                          <span className="font-semibold">{performance.clicks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Conversions:</span>
                          <span className="font-semibold">{performance.conversions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Revenue:</span>
                          <span className="font-semibold text-green-600">${performance.revenue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">ROI:</span>
                          <span className="font-semibold text-purple-600">{performance.roi}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="apply" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Apply for Brand Partnerships</CardTitle>
              <CardDescription>
                Submit your application to join our brand partnership program and start earning from sponsored content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Award className="h-4 w-4" />
                <AlertTitle>Partnership Requirements</AlertTitle>
                <AlertDescription>
                  • Verified chef profile with at least 10 published recipes<br/>
                  • Average rating of 4.5+ stars<br/>
                  • Active social media presence<br/>
                  • Professional content quality
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="brandInterests">Brand Categories of Interest</Label>
                  <Input
                    id="brandInterests"
                    placeholder="e.g., Kitchen Tools, Organic Ingredients, Cookware"
                    value={applicationForm.brandInterests.join(', ')}
                    onChange={(e) => setApplicationForm({...applicationForm, brandInterests: e.target.value.split(',').map(s => s.trim())})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="audienceDescription">Audience Description</Label>
                  <Textarea
                    id="audienceDescription"
                    placeholder="Describe your audience demographics, interests, and engagement patterns..."
                    value={applicationForm.audienceDescription}
                    onChange={(e) => setApplicationForm({...applicationForm, audienceDescription: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="contentStyle">Content Style & Approach</Label>
                  <Textarea
                    id="contentStyle"
                    placeholder="Describe your content creation style, aesthetic, and approach to brand integration..."
                    value={applicationForm.contentStyle}
                    onChange={(e) => setApplicationForm({...applicationForm, contentStyle: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-4">
                  <Label>Rate Card (Optional)</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="flatFee">Flat Fee Rate ($)</Label>
                      <Input
                        id="flatFee"
                        type="number"
                        placeholder="500"
                        value={applicationForm.rateCard.flatFee || ''}
                        onChange={(e) => setApplicationForm({
                          ...applicationForm, 
                          rateCard: {...applicationForm.rateCard, flatFee: parseInt(e.target.value)}
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="perViewRate">Per 1k Views ($)</Label>
                      <Input
                        id="perViewRate"
                        type="number"
                        step="0.01"
                        placeholder="5.00"
                        value={applicationForm.rateCard.perViewRate || ''}
                        onChange={(e) => setApplicationForm({
                          ...applicationForm, 
                          rateCard: {...applicationForm.rateCard, perViewRate: parseFloat(e.target.value)}
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="perClickRate">Per Click ($)</Label>
                      <Input
                        id="perClickRate"
                        type="number"
                        step="0.01"
                        placeholder="0.50"
                        value={applicationForm.rateCard.perClickRate || ''}
                        onChange={(e) => setApplicationForm({
                          ...applicationForm, 
                          rateCard: {...applicationForm.rateCard, perClickRate: parseFloat(e.target.value)}
                        })}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="portfolioUrls">Portfolio URLs</Label>
                  <Input
                    id="portfolioUrls"
                    placeholder="https://instagram.com/yourprofile, https://youtube.com/yourchannel"
                    value={applicationForm.portfolioUrls.join(', ')}
                    onChange={(e) => setApplicationForm({...applicationForm, portfolioUrls: e.target.value.split(',').map(s => s.trim())})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="exclusivityPreferences">Exclusivity Preferences</Label>
                  <Select value={applicationForm.exclusivityPreferences} onValueChange={(value) => setApplicationForm({...applicationForm, exclusivityPreferences: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="non-exclusive">Non-exclusive partnerships</SelectItem>
                      <SelectItem value="category-exclusive">Category exclusive partnerships</SelectItem>
                      <SelectItem value="full-exclusive">Full exclusivity partnerships</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={handleSubmitApplication} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Submit Partnership Application
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}