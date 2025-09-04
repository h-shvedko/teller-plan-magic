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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { MarketplaceService, RecipeLicense, MarketplaceRecipe } from '@/lib/marketplaceFeatures'
import { 
  FileText, 
  Shield, 
  Globe, 
  DollarSign, 
  Calendar,
  Users,
  Award,
  Scale,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Download,
  Share2,
  Clock,
  MapPin,
  Percent
} from 'lucide-react'

interface RecipeLicensingSystemProps {
  currentUser?: any
  chefId?: string
}

interface LicenseRequest {
  id: string
  recipeId: string
  recipeTitle: string
  licenseType: string
  requestorName: string
  requestorEmail: string
  requestorCompany?: string
  intendedUse: string
  proposedTerms: {
    duration?: number
    territory: string
    royaltyRate?: number
    flatFee?: number
  }
  status: 'pending' | 'approved' | 'rejected' | 'negotiating'
  submittedAt: Date
  responseDeadline: Date
}

interface LicenseAgreement {
  id: string
  recipeId: string
  recipeTitle: string
  licenseId: string
  licenseeName: string
  licenseeEmail: string
  licenseeCompany?: string
  terms: RecipeLicense
  financials: {
    totalValue: number
    royaltyRate?: number
    flatFee?: number
    paymentSchedule: string
  }
  status: 'active' | 'expired' | 'terminated' | 'pending-signature'
  signedAt?: Date
  expiresAt?: Date
  revenue: {
    totalEarned: number
    lastPayment: number
    lastPaymentDate?: Date
  }
}

export function RecipeLicensingSystem({ currentUser, chefId }: RecipeLicensingSystemProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('requests')
  const [licenseRequests, setLicenseRequests] = useState<LicenseRequest[]>([])
  const [activeAgreements, setActiveAgreements] = useState<LicenseAgreement[]>([])
  const [availableRecipes, setAvailableRecipes] = useState<MarketplaceRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false)
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<MarketplaceRecipe | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<LicenseRequest | null>(null)

  const [licenseForm, setLicenseForm] = useState({
    type: 'non-exclusive' as any,
    permissions: {
      canModify: false,
      canRedistribute: false,
      canCommercialUse: false,
      requiresAttribution: true
    },
    royaltyRate: 15,
    exclusivityPeriod: 12,
    territory: 'worldwide' as any,
    restrictions: [] as string[]
  })

  const [requestResponse, setRequestResponse] = useState({
    decision: 'pending' as 'approved' | 'rejected' | 'negotiating',
    counterOffer: {
      royaltyRate: 0,
      flatFee: 0,
      territory: 'worldwide',
      duration: 12
    },
    notes: ''
  })

  // Mock data for demonstration
  const mockLicenseRequests: LicenseRequest[] = [
    {
      id: 'req1',
      recipeId: 'recipe1',
      recipeTitle: 'Truffle Mushroom Risotto with Parmesan Crisps',
      licenseType: 'commercial',
      requestorName: 'Sarah Johnson',
      requestorEmail: 'sarah@finediningmag.com',
      requestorCompany: 'Fine Dining Magazine',
      intendedUse: 'Include recipe in upcoming cookbook about luxury comfort food',
      proposedTerms: {
        duration: 24,
        territory: 'North America',
        flatFee: 1500
      },
      status: 'pending',
      submittedAt: new Date('2024-10-15'),
      responseDeadline: new Date('2024-10-29')
    },
    {
      id: 'req2',
      recipeId: 'recipe2',
      recipeTitle: 'Mediterranean Quinoa Bowl',
      licenseType: 'non-exclusive',
      requestorName: 'David Chen',
      requestorEmail: 'david@healthyeats.com',
      requestorCompany: 'Healthy Eats Blog',
      intendedUse: 'Feature in meal planning app with attribution',
      proposedTerms: {
        duration: 12,
        territory: 'worldwide',
        royaltyRate: 10
      },
      status: 'pending',
      submittedAt: new Date('2024-10-18'),
      responseDeadline: new Date('2024-11-01')
    }
  ]

  const mockActiveAgreements: LicenseAgreement[] = [
    {
      id: 'agreement1',
      recipeId: 'recipe3',
      recipeTitle: 'Classic French Onion Soup',
      licenseId: 'license123',
      licenseeName: 'Restaurant Group Inc.',
      licenseeEmail: 'legal@restaurantgroup.com',
      licenseeCompany: 'Restaurant Group Inc.',
      terms: {
        id: 'license123',
        type: 'exclusive',
        permissions: {
          canModify: true,
          canRedistribute: false,
          canCommercialUse: true,
          requiresAttribution: true
        },
        restrictions: ['Cannot be used by competitors'],
        royaltyRate: 20,
        exclusivityPeriod: 18,
        territory: 'North America',
        terms: 'Exclusive commercial license for restaurant use'
      },
      financials: {
        totalValue: 5000,
        flatFee: 5000,
        paymentSchedule: 'One-time payment'
      },
      status: 'active',
      signedAt: new Date('2024-08-15'),
      expiresAt: new Date('2026-02-15'),
      revenue: {
        totalEarned: 5000,
        lastPayment: 5000,
        lastPaymentDate: new Date('2024-08-15')
      }
    },
    {
      id: 'agreement2',
      recipeId: 'recipe4',
      recipeTitle: 'Chocolate Lava Cake',
      licenseId: 'license456',
      licenseeName: 'Sweet Dreams Bakery',
      licenseeEmail: 'owner@sweetdreamsbakery.com',
      licenseeCompany: 'Sweet Dreams Bakery',
      terms: {
        id: 'license456',
        type: 'non-exclusive',
        permissions: {
          canModify: false,
          canRedistribute: false,
          canCommercialUse: true,
          requiresAttribution: true
        },
        restrictions: ['Must maintain original recipe integrity'],
        royaltyRate: 12,
        territory: 'Regional',
        terms: 'Non-exclusive commercial license for bakery use'
      },
      financials: {
        totalValue: 0,
        royaltyRate: 12,
        paymentSchedule: 'Monthly royalties'
      },
      status: 'active',
      signedAt: new Date('2024-09-01'),
      expiresAt: new Date('2025-09-01'),
      revenue: {
        totalEarned: 480,
        lastPayment: 120,
        lastPaymentDate: new Date('2024-10-01')
      }
    }
  ]

  useEffect(() => {
    loadLicensingData()
  }, [chefId])

  const loadLicensingData = async () => {
    setLoading(true)
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 800))
      const recipes = await MarketplaceService.getMarketplaceRecipes({ chefId })
      
      setLicenseRequests(mockLicenseRequests)
      setActiveAgreements(mockActiveAgreements)
      setAvailableRecipes(recipes)
    } catch (error) {
      toast({
        title: "Error loading licensing data",
        description: "Failed to load licensing information",
        variant: "destructive"
      })
    }
    setLoading(false)
  }

  const handleCreateLicense = async () => {
    if (!selectedRecipe) return
    
    try {
      const licenseData = {
        ...licenseForm,
        terms: `License agreement for recipe: ${selectedRecipe.title}`
      }
      
      const newLicense = await MarketplaceService.createLicenseAgreement(licenseData)
      
      toast({
        title: "License created!",
        description: "Recipe license terms have been created successfully."
      })
      
      setLicenseDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error creating license",
        description: "Failed to create recipe license",
        variant: "destructive"
      })
    }
  }

  const handleRespondToRequest = async () => {
    if (!selectedRequest) return
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setLicenseRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, status: requestResponse.decision }
            : req
        )
      )
      
      toast({
        title: "Response sent!",
        description: `License request has been ${requestResponse.decision}.`
      })
      
      setRequestDialogOpen(false)
      setSelectedRequest(null)
    } catch (error) {
      toast({
        title: "Error responding to request",
        description: "Failed to send response",
        variant: "destructive"
      })
    }
  }

  const handleSubmitLicenseRequest = async (recipeId: string, requestData: any) => {
    try {
      const result = await MarketplaceService.requestRecipeLicense(recipeId, requestData)
      
      if (result.success) {
        toast({
          title: "License request submitted!",
          description: result.message
        })
      }
    } catch (error) {
      toast({
        title: "Error submitting request",
        description: "Failed to submit license request",
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
            <span>Loading licensing data...</span>
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
            <Scale className="h-6 w-6" />
            <span>Recipe Licensing System</span>
          </CardTitle>
          <CardDescription>
            Manage recipe licensing requests, create license agreements, and track licensing revenue.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="requests" className="flex items-center space-x-1">
            <FileText className="h-4 w-4" />
            <span>Requests</span>
          </TabsTrigger>
          <TabsTrigger value="agreements" className="flex items-center space-x-1">
            <Shield className="h-4 w-4" />
            <span>Agreements</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-1">
            <Edit className="h-4 w-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4" />
            <span>Revenue</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">License Requests</h3>
            <Badge variant="secondary">{licenseRequests.filter(r => r.status === 'pending').length} Pending</Badge>
          </div>
          
          {licenseRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">No license requests yet</h3>
                <p className="text-gray-600 mb-4">License requests will appear here when others want to use your recipes commercially.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {licenseRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold">{request.recipeTitle}</h4>
                        <div className="flex items-center space-x-4">
                          <Badge 
                            variant={request.status === 'pending' ? 'default' : 
                                    request.status === 'approved' ? 'secondary' : 'destructive'}
                          >
                            {request.status}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {request.requestorName} • {request.requestorCompany}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{request.requestorEmail}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          Deadline: {request.responseDeadline.toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.ceil((request.responseDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-2">Intended Use</h5>
                        <p className="text-gray-600 text-sm">{request.intendedUse}</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <h5 className="font-medium mb-1">License Type</h5>
                          <Badge variant="outline" className="capitalize">{request.licenseType}</Badge>
                        </div>
                        <div>
                          <h5 className="font-medium mb-1">Territory</h5>
                          <span className="text-sm text-gray-600">{request.proposedTerms.territory}</span>
                        </div>
                        <div>
                          <h5 className="font-medium mb-1">Duration</h5>
                          <span className="text-sm text-gray-600">{request.proposedTerms.duration} months</span>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Proposed Terms</h5>
                        <div className="flex items-center space-x-4">
                          {request.proposedTerms.flatFee && (
                            <div className="text-center">
                              <div className="text-xl font-bold text-green-600">${request.proposedTerms.flatFee}</div>
                              <div className="text-xs text-gray-500">Flat Fee</div>
                            </div>
                          )}
                          {request.proposedTerms.royaltyRate && (
                            <div className="text-center">
                              <div className="text-xl font-bold text-blue-600">{request.proposedTerms.royaltyRate}%</div>
                              <div className="text-xs text-gray-500">Royalty Rate</div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {request.status === 'pending' && (
                        <div className="flex justify-end space-x-2 pt-4 border-t">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setSelectedRequest(request)
                              setRequestResponse({...requestResponse, decision: 'rejected'})
                              setRequestDialogOpen(true)
                            }}
                          >
                            Decline
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request)
                              setRequestResponse({...requestResponse, decision: 'negotiating'})
                              setRequestDialogOpen(true)
                            }}
                          >
                            Negotiate
                          </Button>
                          <Button 
                            onClick={() => {
                              setSelectedRequest(request)
                              setRequestResponse({...requestResponse, decision: 'approved'})
                              setRequestDialogOpen(true)
                            }}
                          >
                            Accept
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="agreements" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Active License Agreements</h3>
            <Badge variant="secondary">{activeAgreements.filter(a => a.status === 'active').length} Active</Badge>
          </div>
          
          {activeAgreements.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">No active agreements</h3>
                <p className="text-gray-600 mb-4">Approved license requests will create active agreements that appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeAgreements.map((agreement) => (
                <Card key={agreement.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold">{agreement.recipeTitle}</h4>
                        <div className="flex items-center space-x-4">
                          <Badge 
                            variant={agreement.status === 'active' ? 'secondary' : 
                                    agreement.status === 'expired' ? 'destructive' : 'default'}
                          >
                            {agreement.status}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {agreement.licenseeName} • {agreement.licenseeCompany}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ${agreement.revenue.totalEarned.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Total Earned</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 mb-4">
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium mb-1">License Type</h5>
                          <Badge variant="outline" className="capitalize">{agreement.terms.type}</Badge>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-1">Territory</h5>
                          <span className="text-sm text-gray-600">{agreement.terms.territory}</span>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-1">Permissions</h5>
                          <div className="space-y-1">
                            {agreement.terms.permissions.canModify && (
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-xs">Can modify</span>
                              </div>
                            )}
                            {agreement.terms.permissions.canCommercialUse && (
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-xs">Commercial use</span>
                              </div>
                            )}
                            {agreement.terms.permissions.requiresAttribution && (
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-3 w-3 text-blue-500" />
                                <span className="text-xs">Attribution required</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium mb-1">Financial Terms</h5>
                          <div className="space-y-1">
                            {agreement.financials.flatFee && (
                              <div className="text-sm">
                                Flat Fee: <span className="font-semibold">${agreement.financials.flatFee.toLocaleString()}</span>
                              </div>
                            )}
                            {agreement.financials.royaltyRate && (
                              <div className="text-sm">
                                Royalty Rate: <span className="font-semibold">{agreement.financials.royaltyRate}%</span>
                              </div>
                            )}
                            <div className="text-sm text-gray-600">{agreement.financials.paymentSchedule}</div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-1">Agreement Period</h5>
                          <div className="text-sm space-y-1">
                            <div>Signed: {agreement.signedAt?.toLocaleDateString()}</div>
                            <div>Expires: {agreement.expiresAt?.toLocaleDateString()}</div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-1">Last Payment</h5>
                          <div className="text-sm space-y-1">
                            <div>${agreement.revenue.lastPayment} on {agreement.revenue.lastPaymentDate?.toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <Button variant="outline" size="sm">
                        <Download className="mr-1 h-3 w-3" />
                        Download Agreement
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-1 h-3 w-3" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">License Templates</h3>
            <Dialog open={licenseDialogOpen} onOpenChange={setLicenseDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create License Template</DialogTitle>
                  <DialogDescription>
                    Create a reusable license template for your recipes.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="licenseType">License Type</Label>
                      <Select value={licenseForm.type} onValueChange={(value) => setLicenseForm({...licenseForm, type: value as any})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="exclusive">Exclusive</SelectItem>
                          <SelectItem value="non-exclusive">Non-exclusive</SelectItem>
                          <SelectItem value="creative-commons">Creative Commons</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="territory">Territory</Label>
                      <Select value={licenseForm.territory} onValueChange={(value) => setLicenseForm({...licenseForm, territory: value as any})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="worldwide">Worldwide</SelectItem>
                          <SelectItem value="regional">Regional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Permissions</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={licenseForm.permissions.canModify}
                          onCheckedChange={(checked) => setLicenseForm({
                            ...licenseForm, 
                            permissions: {...licenseForm.permissions, canModify: checked}
                          })}
                        />
                        <Label>Allow modifications</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={licenseForm.permissions.canRedistribute}
                          onCheckedChange={(checked) => setLicenseForm({
                            ...licenseForm, 
                            permissions: {...licenseForm.permissions, canRedistribute: checked}
                          })}
                        />
                        <Label>Allow redistribution</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={licenseForm.permissions.canCommercialUse}
                          onCheckedChange={(checked) => setLicenseForm({
                            ...licenseForm, 
                            permissions: {...licenseForm.permissions, canCommercialUse: checked}
                          })}
                        />
                        <Label>Allow commercial use</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={licenseForm.permissions.requiresAttribution}
                          onCheckedChange={(checked) => setLicenseForm({
                            ...licenseForm, 
                            permissions: {...licenseForm.permissions, requiresAttribution: checked}
                          })}
                        />
                        <Label>Require attribution</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="royaltyRate">Royalty Rate (%)</Label>
                      <Input
                        id="royaltyRate"
                        type="number"
                        value={licenseForm.royaltyRate}
                        onChange={(e) => setLicenseForm({...licenseForm, royaltyRate: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="exclusivityPeriod">Exclusivity Period (months)</Label>
                      <Input
                        id="exclusivityPeriod"
                        type="number"
                        value={licenseForm.exclusivityPeriod}
                        onChange={(e) => setLicenseForm({...licenseForm, exclusivityPeriod: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="restrictions">Additional Restrictions</Label>
                    <Textarea
                      id="restrictions"
                      placeholder="List any additional restrictions..."
                      value={licenseForm.restrictions.join('\n')}
                      onChange={(e) => setLicenseForm({...licenseForm, restrictions: e.target.value.split('\n').filter(r => r.trim())})}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateLicense}>Create Template</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">Standard Commercial License</h4>
                    <p className="text-sm text-gray-600">Non-exclusive commercial use with attribution</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="outline">15% Royalty</Badge>
                      <Badge variant="outline">Worldwide</Badge>
                      <Badge variant="outline">Attribution Required</Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">Premium Exclusive License</h4>
                    <p className="text-sm text-gray-600">Exclusive rights with modification permissions</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="outline">25% Royalty</Badge>
                      <Badge variant="outline">Regional</Badge>
                      <Badge variant="outline">Modifications Allowed</Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Licensing Revenue</h3>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">${activeAgreements.reduce((sum, a) => sum + a.revenue.totalEarned, 0).toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Agreements</p>
                    <p className="text-2xl font-bold">{activeAgreements.filter(a => a.status === 'active').length}</p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                    <p className="text-2xl font-bold">{licenseRequests.filter(r => r.status === 'pending').length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Royalty Rate</p>
                    <p className="text-2xl font-bold">{(activeAgreements.reduce((sum, a) => sum + (a.financials.royaltyRate || 0), 0) / activeAgreements.length || 0).toFixed(1)}%</p>
                  </div>
                  <Percent className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Agreement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeAgreements.map((agreement) => (
                  <div key={agreement.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h5 className="font-medium">{agreement.recipeTitle}</h5>
                      <p className="text-sm text-gray-600">{agreement.licenseeName}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">${agreement.revenue.totalEarned}</div>
                      <div className="text-sm text-gray-500">
                        Last: ${agreement.revenue.lastPayment} on {agreement.revenue.lastPaymentDate?.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to License Request</DialogTitle>
            <DialogDescription>
              {selectedRequest && `Respond to ${selectedRequest.requestorName}'s request for "${selectedRequest.recipeTitle}"`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Decision</Label>
              <Select value={requestResponse.decision} onValueChange={(value) => setRequestResponse({...requestResponse, decision: value as any})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approve</SelectItem>
                  <SelectItem value="rejected">Reject</SelectItem>
                  <SelectItem value="negotiating">Request Negotiation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {requestResponse.decision === 'negotiating' && (
              <div className="space-y-3">
                <Label>Counter Offer</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="counterRoyalty">Royalty Rate (%)</Label>
                    <Input
                      id="counterRoyalty"
                      type="number"
                      value={requestResponse.counterOffer.royaltyRate}
                      onChange={(e) => setRequestResponse({
                        ...requestResponse, 
                        counterOffer: {...requestResponse.counterOffer, royaltyRate: parseInt(e.target.value)}
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="counterDuration">Duration (months)</Label>
                    <Input
                      id="counterDuration"
                      type="number"
                      value={requestResponse.counterOffer.duration}
                      onChange={(e) => setRequestResponse({
                        ...requestResponse, 
                        counterOffer: {...requestResponse.counterOffer, duration: parseInt(e.target.value)}
                      })}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="responseNotes">Additional Notes</Label>
              <Textarea
                id="responseNotes"
                placeholder="Add any additional terms or comments..."
                value={requestResponse.notes}
                onChange={(e) => setRequestResponse({...requestResponse, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleRespondToRequest}>Send Response</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}