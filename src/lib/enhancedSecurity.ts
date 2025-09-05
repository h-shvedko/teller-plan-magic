import { createClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RateLimitConfig {
  endpoint: string;
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'blocked';
}

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface GDPRExportRequest {
  id: string;
  userId: string;
  requestedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: Date;
  dataTypes: string[];
}

export interface ExtendedRole {
  id: string;
  name: string;
  displayName: string;
  permissions: Permission[];
  hierarchyLevel: number;
  isSystemRole: boolean;
  description: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute';
  conditions?: Record<string, any>;
}

export interface SecurityMetrics {
  rateLimitViolations: number;
  failedAuthAttempts: number;
  blockedIPs: number;
  auditLogEntries: number;
  gdprRequests: number;
  twoFactorAdoption: number;
}

class EnhancedSecurityService {
  private supabase = createClient();
  private rateLimitStore: Map<string, { count: number; resetTime: number; blocked: boolean }> = new Map();
  
  // Rate Limiting Implementation
  async checkRateLimit(
    identifier: string, 
    config: RateLimitConfig
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const key = `${config.endpoint}:${identifier}`;
    
    let limitData = this.rateLimitStore.get(key);
    
    if (!limitData || now > limitData.resetTime) {
      limitData = {
        count: 0,
        resetTime: now + config.windowMs,
        blocked: false
      };
      this.rateLimitStore.set(key, limitData);
    }
    
    if (limitData.blocked && now < limitData.resetTime) {
      await this.logAuditEvent({
        userId: identifier,
        action: 'RATE_LIMIT_EXCEEDED',
        resource: 'api_endpoint',
        resourceId: config.endpoint,
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        severity: 'medium',
        status: 'blocked',
        metadata: {
          endpoint: config.endpoint,
          requestCount: limitData.count,
          windowMs: config.windowMs
        }
      });
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: limitData.resetTime
      };
    }
    
    limitData.count++;
    
    if (limitData.count > config.maxRequests) {
      limitData.blocked = true;
      limitData.resetTime = now + config.blockDurationMs;
      this.rateLimitStore.set(key, limitData);
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: limitData.resetTime
      };
    }
    
    return {
      allowed: true,
      remaining: config.maxRequests - limitData.count,
      resetTime: limitData.resetTime
    };
  }
  
  async enforceRateLimit(
    userId: string,
    endpoint: string,
    customConfig?: Partial<RateLimitConfig>
  ): Promise<boolean> {
    const defaultConfig: RateLimitConfig = {
      endpoint,
      maxRequests: 100,
      windowMs: 60 * 1000, // 1 minute
      blockDurationMs: 5 * 60 * 1000 // 5 minutes
    };
    
    const config = { ...defaultConfig, ...customConfig };
    const result = await this.checkRateLimit(userId, config);
    
    if (!result.allowed) {
      toast.error('Rate limit exceeded. Please try again later.');
      return false;
    }
    
    return true;
  }

  // Audit Logging Implementation
  async logAuditEvent(entry: Omit<AuditLogEntry, 'id'>): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        ...entry,
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      const { error } = await this.supabase
        .from('audit_logs')
        .insert({
          id: auditEntry.id,
          user_id: auditEntry.userId,
          action: auditEntry.action,
          resource: auditEntry.resource,
          resource_id: auditEntry.resourceId,
          ip_address: auditEntry.ipAddress,
          user_agent: auditEntry.userAgent,
          timestamp: auditEntry.timestamp.toISOString(),
          metadata: auditEntry.metadata || {},
          severity: auditEntry.severity,
          status: auditEntry.status
        });
      
      if (error) {
        console.error('Failed to log audit event:', error);
      }
      
      // Store in local storage as backup
      this.storeAuditEventLocally(auditEntry);
      
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }
  
  private storeAuditEventLocally(entry: AuditLogEntry): void {
    try {
      const localAudits = JSON.parse(localStorage.getItem('audit_logs_backup') || '[]');
      localAudits.push(entry);
      
      // Keep only last 100 entries locally
      if (localAudits.length > 100) {
        localAudits.splice(0, localAudits.length - 100);
      }
      
      localStorage.setItem('audit_logs_backup', JSON.stringify(localAudits));
    } catch (error) {
      console.error('Failed to store audit event locally:', error);
    }
  }
  
  async getAuditLogs(
    userId?: string,
    startDate?: Date,
    endDate?: Date,
    severity?: string,
    limit: number = 50
  ): Promise<AuditLogEntry[]> {
    try {
      let query = this.supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      if (startDate) {
        query = query.gte('timestamp', startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte('timestamp', endDate.toISOString());
      }
      
      if (severity) {
        query = query.eq('severity', severity);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(`Failed to fetch audit logs: ${error.message}`);
      }
      
      return data?.map(log => ({
        id: log.id,
        userId: log.user_id,
        action: log.action,
        resource: log.resource,
        resourceId: log.resource_id,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        timestamp: new Date(log.timestamp),
        metadata: log.metadata,
        severity: log.severity,
        status: log.status
      })) || [];
      
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }

  // GDPR Data Export Implementation
  async requestDataExport(
    userId: string, 
    dataTypes: string[] = ['all']
  ): Promise<GDPRExportRequest> {
    try {
      const exportRequest: GDPRExportRequest = {
        id: `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        requestedAt: new Date(),
        status: 'pending',
        dataTypes
      };
      
      const { error } = await this.supabase
        .from('gdpr_export_requests')
        .insert({
          id: exportRequest.id,
          user_id: exportRequest.userId,
          requested_at: exportRequest.requestedAt.toISOString(),
          status: exportRequest.status,
          data_types: exportRequest.dataTypes
        });
      
      if (error) {
        throw new Error(`Failed to create export request: ${error.message}`);
      }
      
      // Log the GDPR request
      await this.logAuditEvent({
        userId,
        action: 'GDPR_EXPORT_REQUESTED',
        resource: 'user_data',
        resourceId: userId,
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        severity: 'medium',
        status: 'success',
        metadata: {
          exportId: exportRequest.id,
          dataTypes: dataTypes
        }
      });
      
      // Trigger background processing
      await this.processDataExport(exportRequest.id);
      
      return exportRequest;
      
    } catch (error) {
      console.error('Error requesting data export:', error);
      throw error;
    }
  }
  
  private async processDataExport(exportId: string): Promise<void> {
    try {
      // Update status to processing
      await this.supabase
        .from('gdpr_export_requests')
        .update({ status: 'processing' })
        .eq('id', exportId);
      
      // In a real implementation, this would trigger a background job
      // For now, we'll simulate the process
      setTimeout(async () => {
        try {
          // Mock data export generation
          const downloadUrl = await this.generateExportFile(exportId);
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
          
          await this.supabase
            .from('gdpr_export_requests')
            .update({
              status: 'completed',
              download_url: downloadUrl,
              expires_at: expiresAt.toISOString()
            })
            .eq('id', exportId);
          
        } catch (error) {
          await this.supabase
            .from('gdpr_export_requests')
            .update({ status: 'failed' })
            .eq('id', exportId);
        }
      }, 5000); // Simulate 5 second processing
      
    } catch (error) {
      console.error('Error processing data export:', error);
    }
  }
  
  private async generateExportFile(exportId: string): Promise<string> {
    // Mock implementation - in reality, this would generate a comprehensive data export
    const mockData = {
      exportId,
      generatedAt: new Date().toISOString(),
      userData: {
        profile: 'User profile data...',
        preferences: 'User preferences...',
        mealPlans: 'Meal plan data...',
        recipes: 'Recipe data...',
        shoppingLists: 'Shopping list data...',
        auditLogs: 'User audit logs...'
      }
    };
    
    const blob = new Blob([JSON.stringify(mockData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    return url;
  }
  
  async getExportStatus(exportId: string): Promise<GDPRExportRequest | null> {
    try {
      const { data, error } = await this.supabase
        .from('gdpr_export_requests')
        .select('*')
        .eq('id', exportId)
        .single();
      
      if (error || !data) {
        return null;
      }
      
      return {
        id: data.id,
        userId: data.user_id,
        requestedAt: new Date(data.requested_at),
        status: data.status,
        downloadUrl: data.download_url,
        expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
        dataTypes: data.data_types
      };
      
    } catch (error) {
      console.error('Error getting export status:', error);
      return null;
    }
  }

  // Two-Factor Authentication Implementation
  async setupTwoFactor(userId: string): Promise<TwoFactorSetup> {
    try {
      // Generate TOTP secret
      const secret = this.generateTOTPSecret();
      const qrCodeUrl = await this.generateQRCode(userId, secret);
      const backupCodes = this.generateBackupCodes();
      
      // Store 2FA setup in database (encrypted)
      const { error } = await this.supabase
        .from('user_two_factor')
        .upsert({
          user_id: userId,
          secret_encrypted: await this.encryptSecret(secret),
          backup_codes_encrypted: await this.encryptBackupCodes(backupCodes),
          enabled: false,
          setup_at: new Date().toISOString()
        });
      
      if (error) {
        throw new Error(`Failed to setup 2FA: ${error.message}`);
      }
      
      await this.logAuditEvent({
        userId,
        action: 'TWO_FACTOR_SETUP_INITIATED',
        resource: 'user_security',
        resourceId: userId,
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        severity: 'medium',
        status: 'success'
      });
      
      return {
        secret,
        qrCodeUrl,
        backupCodes
      };
      
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      throw error;
    }
  }
  
  async verifyTwoFactor(
    userId: string, 
    token: string, 
    isBackupCode: boolean = false
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('user_two_factor')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error || !data) {
        return false;
      }
      
      let isValid = false;
      
      if (isBackupCode) {
        const backupCodes = await this.decryptBackupCodes(data.backup_codes_encrypted);
        isValid = backupCodes.includes(token);
        
        if (isValid) {
          // Remove used backup code
          const updatedCodes = backupCodes.filter(code => code !== token);
          await this.supabase
            .from('user_two_factor')
            .update({
              backup_codes_encrypted: await this.encryptBackupCodes(updatedCodes)
            })
            .eq('user_id', userId);
        }
      } else {
        const secret = await this.decryptSecret(data.secret_encrypted);
        isValid = this.verifyTOTPToken(secret, token);
      }
      
      await this.logAuditEvent({
        userId,
        action: 'TWO_FACTOR_VERIFICATION_ATTEMPT',
        resource: 'user_authentication',
        resourceId: userId,
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        severity: isValid ? 'low' : 'medium',
        status: isValid ? 'success' : 'failure',
        metadata: {
          isBackupCode,
          tokenType: isBackupCode ? 'backup_code' : 'totp'
        }
      });
      
      return isValid;
      
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      return false;
    }
  }
  
  async enableTwoFactor(userId: string, verificationToken: string): Promise<boolean> {
    try {
      const isValid = await this.verifyTwoFactor(userId, verificationToken);
      
      if (!isValid) {
        return false;
      }
      
      const { error } = await this.supabase
        .from('user_two_factor')
        .update({
          enabled: true,
          enabled_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) {
        throw new Error(`Failed to enable 2FA: ${error.message}`);
      }
      
      await this.logAuditEvent({
        userId,
        action: 'TWO_FACTOR_ENABLED',
        resource: 'user_security',
        resourceId: userId,
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        severity: 'low',
        status: 'success'
      });
      
      return true;
      
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      return false;
    }
  }

  // Enhanced Role-Based Permissions
  async createRole(role: Omit<ExtendedRole, 'id'>): Promise<ExtendedRole> {
    try {
      const roleId = `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newRole: ExtendedRole = {
        ...role,
        id: roleId
      };
      
      const { error } = await this.supabase
        .from('extended_roles')
        .insert({
          id: newRole.id,
          name: newRole.name,
          display_name: newRole.displayName,
          permissions: newRole.permissions,
          hierarchy_level: newRole.hierarchyLevel,
          is_system_role: newRole.isSystemRole,
          description: newRole.description
        });
      
      if (error) {
        throw new Error(`Failed to create role: ${error.message}`);
      }
      
      return newRole;
      
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }
  
  async assignRole(userId: string, roleId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_role_assignments')
        .upsert({
          user_id: userId,
          role_id: roleId,
          assigned_at: new Date().toISOString()
        });
      
      if (error) {
        throw new Error(`Failed to assign role: ${error.message}`);
      }
      
      await this.logAuditEvent({
        userId,
        action: 'ROLE_ASSIGNED',
        resource: 'user_permissions',
        resourceId: userId,
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        severity: 'medium',
        status: 'success',
        metadata: {
          roleId
        }
      });
      
      return true;
      
    } catch (error) {
      console.error('Error assigning role:', error);
      return false;
    }
  }
  
  async checkPermission(
    userId: string, 
    resource: string, 
    action: string
  ): Promise<boolean> {
    try {
      const { data: roleAssignments, error } = await this.supabase
        .from('user_role_assignments')
        .select(`
          role_id,
          extended_roles (
            permissions,
            hierarchy_level
          )
        `)
        .eq('user_id', userId);
      
      if (error || !roleAssignments) {
        return false;
      }
      
      for (const assignment of roleAssignments) {
        const role = assignment.extended_roles;
        if (!role) continue;
        
        for (const permission of role.permissions) {
          if (permission.resource === resource && permission.action === action) {
            return true;
          }
          
          // Check for wildcard permissions
          if (permission.resource === '*' && permission.action === '*') {
            return true;
          }
          
          if (permission.resource === resource && permission.action === '*') {
            return true;
          }
        }
      }
      
      return false;
      
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }
  
  async getUserRoles(userId: string): Promise<ExtendedRole[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_role_assignments')
        .select(`
          extended_roles (*)
        `)
        .eq('user_id', userId);
      
      if (error || !data) {
        return [];
      }
      
      return data
        .map(assignment => assignment.extended_roles)
        .filter(role => role)
        .map(role => ({
          id: role.id,
          name: role.name,
          displayName: role.display_name,
          permissions: role.permissions,
          hierarchyLevel: role.hierarchy_level,
          isSystemRole: role.is_system_role,
          description: role.description
        }));
      
    } catch (error) {
      console.error('Error getting user roles:', error);
      return [];
    }
  }

  // Security Metrics and Monitoring
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    try {
      const [
        rateLimitViolations,
        failedAuthAttempts,
        auditLogCount,
        gdprRequestCount,
        twoFactorUsers
      ] = await Promise.all([
        this.countAuditLogs('RATE_LIMIT_EXCEEDED'),
        this.countAuditLogs('AUTHENTICATION_FAILED'),
        this.countAuditLogs(),
        this.countGDPRRequests(),
        this.countTwoFactorUsers()
      ]);
      
      return {
        rateLimitViolations,
        failedAuthAttempts,
        blockedIPs: this.countBlockedIPs(),
        auditLogEntries: auditLogCount,
        gdprRequests: gdprRequestCount,
        twoFactorAdoption: twoFactorUsers
      };
      
    } catch (error) {
      console.error('Error getting security metrics:', error);
      return {
        rateLimitViolations: 0,
        failedAuthAttempts: 0,
        blockedIPs: 0,
        auditLogEntries: 0,
        gdprRequests: 0,
        twoFactorAdoption: 0
      };
    }
  }

  // Helper Methods
  private generateTOTPSecret(): string {
    // Mock implementation - in reality would use a proper TOTP library
    return Array.from({ length: 32 }, () => 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]
    ).join('');
  }
  
  private async generateQRCode(userId: string, secret: string): Promise<string> {
    // Mock implementation - in reality would generate actual QR code
    const appName = 'Teller Plan Magic';
    const otpAuthUrl = `otpauth://totp/${appName}:${userId}?secret=${secret}&issuer=${appName}`;
    return `data:image/svg+xml;base64,${btoa(`<svg>QR Code for: ${otpAuthUrl}</svg>`)}`;
  }
  
  private generateBackupCodes(): string[] {
    return Array.from({ length: 8 }, () => 
      Math.random().toString(36).substr(2, 8).toUpperCase()
    );
  }
  
  private async encryptSecret(secret: string): Promise<string> {
    // Mock encryption - in reality would use proper encryption
    return btoa(secret + '_encrypted');
  }
  
  private async decryptSecret(encryptedSecret: string): Promise<string> {
    // Mock decryption - in reality would use proper decryption
    return atob(encryptedSecret).replace('_encrypted', '');
  }
  
  private async encryptBackupCodes(codes: string[]): Promise<string> {
    // Mock encryption - in reality would use proper encryption
    return btoa(JSON.stringify(codes) + '_encrypted');
  }
  
  private async decryptBackupCodes(encryptedCodes: string): Promise<string[]> {
    // Mock decryption - in reality would use proper decryption
    return JSON.parse(atob(encryptedCodes).replace('_encrypted', ''));
  }
  
  private verifyTOTPToken(secret: string, token: string): boolean {
    // Mock verification - in reality would use proper TOTP verification
    const expectedToken = (parseInt(secret.substr(0, 6), 36) % 1000000).toString().padStart(6, '0');
    return token === expectedToken;
  }
  
  private async getClientIP(): Promise<string> {
    try {
      // In a real implementation, this would get the actual client IP
      return '127.0.0.1';
    } catch {
      return 'unknown';
    }
  }
  
  private async countAuditLogs(action?: string): Promise<number> {
    try {
      let query = this.supabase
        .from('audit_logs')
        .select('count');
      
      if (action) {
        query = query.eq('action', action);
      }
      
      const { count } = await query;
      return count || 0;
    } catch {
      return 0;
    }
  }
  
  private async countGDPRRequests(): Promise<number> {
    try {
      const { count } = await this.supabase
        .from('gdpr_export_requests')
        .select('count');
      
      return count || 0;
    } catch {
      return 0;
    }
  }
  
  private async countTwoFactorUsers(): Promise<number> {
    try {
      const { count } = await this.supabase
        .from('user_two_factor')
        .select('count')
        .eq('enabled', true);
      
      return count || 0;
    } catch {
      return 0;
    }
  }
  
  private countBlockedIPs(): number {
    return Array.from(this.rateLimitStore.values())
      .filter(data => data.blocked).length;
  }
}

export const enhancedSecurityService = new EnhancedSecurityService();