import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
  Shield, Lock, Eye, Download, UserCheck, AlertTriangle, Activity,
  Clock, Users, Key, FileText, Settings, CheckCircle, XCircle, QrCode
} from 'lucide-react';
import {
  enhancedSecurityService,
  AuditLogEntry,
  GDPRExportRequest,
  TwoFactorSetup,
  ExtendedRole,
  SecurityMetrics
} from '@/lib/enhancedSecurity';
import { toast } from 'sonner';

interface SecurityDashboardProps {
  userId: string;
  isAdmin: boolean;
}

export function SecurityDashboard({ userId, isAdmin }: SecurityDashboardProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [gdprRequests, setGdprRequests] = useState<GDPRExportRequest[]>([]);
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(null);
  const [userRoles, setUserRoles] = useState<ExtendedRole[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Two-Factor Authentication state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);

  // Role management state
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');

  // GDPR export state
  const [exportDataTypes, setExportDataTypes] = useState<string[]>(['all']);

  useEffect(() => {
    loadSecurityData();
  }, [userId, isAdmin]);

  const loadSecurityData = async () => {
    try {
      setIsLoading(true);

      const [logs, roles, metrics] = await Promise.all([
        enhancedSecurityService.getAuditLogs(isAdmin ? undefined : userId, undefined, undefined, undefined, 100),
        enhancedSecurityService.getUserRoles(userId),
        isAdmin ? enhancedSecurityService.getSecurityMetrics() : Promise.resolve(null)
      ]);

      setAuditLogs(logs);
      setUserRoles(roles);
      setSecurityMetrics(metrics);
    } catch (error) {
      console.error('Error loading security data:', error);
      toast.error('Failed to load security data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupTwoFactor = async () => {
    try {
      const setup = await enhancedSecurityService.setupTwoFactor(userId);
      setTwoFactorSetup(setup);
      setShowQRCode(true);
      toast.success('Two-factor authentication setup initiated');
    } catch (error) {
      toast.error('Failed to setup two-factor authentication');
    }
  };

  const handleVerifyTwoFactor = async () => {
    try {
      const success = await enhancedSecurityService.enableTwoFactor(userId, verificationToken);
      if (success) {
        setTwoFactorEnabled(true);
        setShowQRCode(false);
        setVerificationToken('');
        toast.success('Two-factor authentication enabled successfully');
      } else {
        toast.error('Invalid verification token');
      }
    } catch (error) {
      toast.error('Failed to verify two-factor authentication');
    }
  };

  const handleRequestGDPRExport = async () => {
    try {
      const exportRequest = await enhancedSecurityService.requestDataExport(userId, exportDataTypes);
      setGdprRequests(prev => [exportRequest, ...prev]);
      toast.success('Data export request submitted. You will be notified when ready.');
    } catch (error) {
      toast.error('Failed to request data export');
    }
  };

  const handleCreateRole = async () => {
    if (!isAdmin) return;

    try {
      const permissions = JSON.parse(newRolePermissions);
      const newRole = await enhancedSecurityService.createRole({
        name: newRoleName.toLowerCase().replace(/\s+/g, '_'),
        displayName: newRoleName,
        permissions,
        hierarchyLevel: 1,
        isSystemRole: false,
        description: `Custom role: ${newRoleName}`
      });

      toast.success('Role created successfully');
      setNewRoleName('');
      setNewRolePermissions('');
      loadSecurityData();
    } catch (error) {
      toast.error('Failed to create role. Check permissions JSON format.');
    }
  };

  const handleAssignRole = async () => {
    if (!isAdmin) return;

    try {
      const success = await enhancedSecurityService.assignRole(selectedUserId, selectedRoleId);
      if (success) {
        toast.success('Role assigned successfully');
        setSelectedUserId('');
        setSelectedRoleId('');
      } else {
        toast.error('Failed to assign role');
      }
    } catch (error) {
      toast.error('Failed to assign role');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failure': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'blocked': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Security Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive security management and monitoring
          </p>
        </div>
        <Button onClick={loadSecurityData} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Security Metrics Overview */}
      {securityMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Rate Limit Violations</p>
                  <p className="text-2xl font-bold">{securityMetrics.rateLimitViolations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Failed Auth Attempts</p>
                  <p className="text-2xl font-bold">{securityMetrics.failedAuthAttempts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Blocked IPs</p>
                  <p className="text-2xl font-bold">{securityMetrics.blockedIPs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Audit Logs</p>
                  <p className="text-2xl font-bold">{securityMetrics.auditLogEntries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Download className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">GDPR Requests</p>
                  <p className="text-2xl font-bold">{securityMetrics.gdprRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-cyan-500" />
                <div>
                  <p className="text-sm text-muted-foreground">2FA Users</p>
                  <p className="text-2xl font-bold">{securityMetrics.twoFactorAdoption}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR Compliance</TabsTrigger>
          <TabsTrigger value="2fa">Two-Factor Auth</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Status</CardTitle>
                <CardDescription>Current security configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Two-Factor Authentication
                  </span>
                  <Badge variant={twoFactorEnabled ? "default" : "destructive"}>
                    {twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Rate Limiting
                  </span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Audit Logging
                  </span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Role-Based Access
                  </span>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Roles & Permissions</CardTitle>
                <CardDescription>Current role assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userRoles.map((role) => (
                    <div key={role.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{role.displayName}</h4>
                        <Badge variant={role.isSystemRole ? "default" : "secondary"}>
                          {role.isSystemRole ? "System" : "Custom"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {role.description}
                      </p>
                      <div className="text-xs">
                        <p className="font-medium">Permissions: {role.permissions.length}</p>
                        <p>Hierarchy Level: {role.hierarchyLevel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Log Entries
              </CardTitle>
              <CardDescription>
                {isAdmin ? 'System-wide audit logs' : 'Your account activity logs'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.slice(0, 20).map((log) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span className="font-medium">{log.action.replace(/_/g, ' ')}</span>
                        <Badge variant={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {log.timestamp.toLocaleDateString()} {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Resource</p>
                        <p className="font-medium">{log.resource}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">User ID</p>
                        <p className="font-medium">{log.userId}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">IP Address</p>
                        <p className="font-medium">{log.ipAddress}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                          {log.status}
                        </Badge>
                      </div>
                    </div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <p className="font-medium mb-1">Metadata:</p>
                        <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gdpr" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                GDPR Data Export
              </CardTitle>
              <CardDescription>
                Request and manage your personal data exports for GDPR compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Data Types to Export</Label>
                <div className="mt-2 space-y-2">
                  {['all', 'profile', 'preferences', 'meal_plans', 'recipes', 'shopping_lists', 'audit_logs'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={type}
                        checked={exportDataTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExportDataTypes([...exportDataTypes, type]);
                          } else {
                            setExportDataTypes(exportDataTypes.filter(t => t !== type));
                          }
                        }}
                      />
                      <label htmlFor={type} className="capitalize">
                        {type.replace('_', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleRequestGDPRExport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Request Data Export
              </Button>
            </CardContent>
          </Card>

          {gdprRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Export Requests</CardTitle>
                <CardDescription>Your data export request history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gdprRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Export Request</span>
                        <Badge variant={
                          request.status === 'completed' ? 'default' :
                          request.status === 'failed' ? 'destructive' :
                          request.status === 'processing' ? 'secondary' : 'outline'
                        }>
                          {request.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Requested</p>
                          <p>{request.requestedAt.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Data Types</p>
                          <p>{request.dataTypes.join(', ')}</p>
                        </div>
                      </div>
                      {request.status === 'completed' && request.downloadUrl && (
                        <Button asChild className="mt-2" size="sm">
                          <a href={request.downloadUrl} download>
                            <Download className="h-4 w-4 mr-2" />
                            Download Export
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="2fa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Secure your account with two-factor authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!twoFactorEnabled ? (
                <div className="space-y-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Enhance Your Security</AlertTitle>
                    <AlertDescription>
                      Two-factor authentication adds an extra layer of security to your account.
                      We recommend enabling it to protect your personal data.
                    </AlertDescription>
                  </Alert>

                  {!showQRCode ? (
                    <Button onClick={handleSetupTwoFactor} className="w-full">
                      <Key className="h-4 w-4 mr-2" />
                      Setup Two-Factor Authentication
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="bg-white p-4 inline-block rounded-lg border">
                          <img 
                            src={twoFactorSetup?.qrCodeUrl} 
                            alt="QR Code for 2FA setup"
                            className="w-48 h-48"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Scan this QR code with your authenticator app
                        </p>
                      </div>

                      <div>
                        <Label>Secret Key (manual entry)</Label>
                        <Input 
                          value={twoFactorSetup?.secret || ''} 
                          readOnly 
                          className="font-mono text-sm"
                        />
                      </div>

                      <div>
                        <Label>Backup Codes (save these securely)</Label>
                        <Textarea
                          value={twoFactorSetup?.backupCodes.join('\n') || ''}
                          readOnly
                          className="font-mono text-sm h-32"
                        />
                      </div>

                      <div>
                        <Label>Verification Code</Label>
                        <Input
                          value={verificationToken}
                          onChange={(e) => setVerificationToken(e.target.value)}
                          placeholder="Enter 6-digit code from your app"
                          maxLength={6}
                        />
                      </div>

                      <Button 
                        onClick={handleVerifyTwoFactor}
                        disabled={verificationToken.length !== 6}
                        className="w-full"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify and Enable 2FA
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">Two-Factor Authentication Enabled</h3>
                    <p className="text-muted-foreground">
                      Your account is protected with two-factor authentication
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          {isAdmin && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Create New Role
                  </CardTitle>
                  <CardDescription>
                    Define custom roles with specific permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Role Name</Label>
                    <Input
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      placeholder="Enter role name"
                    />
                  </div>
                  <div>
                    <Label>Permissions (JSON)</Label>
                    <Textarea
                      value={newRolePermissions}
                      onChange={(e) => setNewRolePermissions(e.target.value)}
                      placeholder={`[{"id":"1","name":"recipe_create","resource":"recipes","action":"create"}]`}
                      className="font-mono text-sm h-32"
                    />
                  </div>
                  <Button onClick={handleCreateRole} disabled={!newRoleName || !newRolePermissions}>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Create Role
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Assign Role to User</CardTitle>
                  <CardDescription>
                    Assign roles to users for access control
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>User ID</Label>
                    <Input
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      placeholder="Enter user ID"
                    />
                  </div>
                  <div>
                    <Label>Role ID</Label>
                    <Input
                      value={selectedRoleId}
                      onChange={(e) => setSelectedRoleId(e.target.value)}
                      placeholder="Enter role ID"
                    />
                  </div>
                  <Button 
                    onClick={handleAssignRole} 
                    disabled={!selectedUserId || !selectedRoleId}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Assign Role
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Role Information</CardTitle>
              <CardDescription>
                Available roles and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userRoles.map((role) => (
                  <div key={role.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{role.displayName}</h4>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={role.isSystemRole ? "default" : "secondary"}>
                          {role.isSystemRole ? "System" : "Custom"}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Level {role.hierarchyLevel}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Permissions:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {role.permissions.map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {permission.resource}:{permission.action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}