import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useApp } from '../contexts/AppContext';
import { admin as adminAPI } from '../lib/api';
import { isAdmin } from '../lib/admin';
import {
  FileText,
  Activity,
  Play,
  Clock,
  Database,
  HardDrive,
  Zap,
  RefreshCw
} from 'lucide-react';

interface SystemLog {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  source: 'frontend' | 'backend' | 'database' | 'api' | 'system' | 'external';
  message: string;
  details: any;
  user_id?: string;
  created_at: string;
}

interface HealthCheck {
  id: string;
  type: 'database' | 'cache' | 'queue' | 'external_api' | 'storage' | 'system';
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  response_time_ms?: number;
  details: any;
  error_message?: string;
  checked_at: string;
}

interface BackgroundJob {
  id: string;
  name: string;
  description?: string;
  job_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: number;
  parameters: any;
  created_at: string;
  updated_at: string;
}

export function SystemLogsHealth() {
  const { state } = useApp();
  const user = state.user;

  // Logs state
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logFilters, setLogFilters] = useState<{
    level: string;
    source: string;
    limit: number;
    offset: number;
  }>({
    level: 'all',
    source: 'all',
    limit: 50,
    offset: 0
  });

  // Health state
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [healthLoading, setHealthLoading] = useState(true);

  // Jobs state
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [triggeringJob, setTriggeringJob] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin(user)) return;

    loadLogs();
    loadHealthChecks();
    loadJobs();
  }, [user, logFilters]);

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const filters = {
        ...logFilters,
        level: logFilters.level === 'all' ? undefined : logFilters.level as any,
        source: logFilters.source === 'all' ? undefined : logFilters.source as any
      };
      const { data, error } = await adminAPI.getSystemLogs(filters);
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const loadHealthChecks = async () => {
    setHealthLoading(true);
    try {
      const { data, error } = await adminAPI.getHealthChecks();
      if (error) throw error;
      setHealthChecks(data || []);
    } catch (error) {
      console.error('Error loading health checks:', error);
    } finally {
      setHealthLoading(false);
    }
  };

  const loadJobs = async () => {
    setJobsLoading(true);
    try {
      const { data, error } = await adminAPI.getBackgroundJobs();
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setJobsLoading(false);
    }
  };

  const triggerJob = async (jobType: string, parameters: any = {}) => {
    setTriggeringJob(jobType);
    try {
      const { error } = await adminAPI.triggerManualJob(jobType, parameters);
      if (error) throw error;
      // Reload jobs after triggering
      await loadJobs();
    } catch (error) {
      console.error('Error triggering job:', error);
    } finally {
      setTriggeringJob(null);
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'debug': return 'bg-gray-100 text-gray-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warn': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'fatal': return 'bg-red-900 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy': return 'bg-red-100 text-red-800';
      case 'unknown': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthIcon = (type: string) => {
    switch (type) {
      case 'database': return <Database className="w-4 h-4" />;
      case 'cache': return <HardDrive className="w-4 h-4" />;
      case 'queue': return <Zap className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (!isAdmin(user)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">System Logs & Health</h1>
          <p className="text-muted-foreground">Monitor system status, logs, and background jobs</p>
        </div>
        <Button onClick={() => { loadLogs(); loadHealthChecks(); loadJobs(); }} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh All
        </Button>
      </div>

      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="health">Health Monitoring</TabsTrigger>
          <TabsTrigger value="jobs">Background Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                System Logs
              </CardTitle>
              <CardDescription>Recent system events and errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Select value={logFilters.level} onValueChange={(value: string) => { console.log('Selected level:', value); setLogFilters(prev => ({ ...prev, level: value as any })) }}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warn">Warn</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="fatal">Fatal</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={logFilters.source} onValueChange={(value: string) => { console.log('Selected source:', value); setLogFilters(prev => ({ ...prev, source: value as any })) }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="frontend">Frontend</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={loadLogs} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {logsLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            {new Date(log.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={getLogLevelColor(log.level)}>
                              {log.level.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize">{log.source}</TableCell>
                          <TableCell className="max-w-md truncate" title={log.message}>
                            {log.message}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Health Monitoring
              </CardTitle>
              <CardDescription>Current status of system components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Last updated: {healthChecks.length > 0 ? new Date(Math.max(...healthChecks.map(h => new Date(h.checked_at).getTime()))).toLocaleString() : 'Never'}
                </p>
                <Button onClick={loadHealthChecks} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {healthLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4">
                  {healthChecks.map((check) => (
                    <Card key={check.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getHealthIcon(check.type)}
                          <div>
                            <h3 className="font-medium">{check.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">{check.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getHealthStatusColor(check.status)}>
                            {check.status}
                          </Badge>
                          {check.response_time_ms && (
                            <span className="text-sm text-muted-foreground">
                              {check.response_time_ms}ms
                            </span>
                          )}
                        </div>
                      </div>
                      {check.error_message && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          {check.error_message}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Background Jobs
              </CardTitle>
              <CardDescription>Manual job triggers and status monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  {jobs.filter(j => j.status === 'pending').length} pending jobs
                </p>
                <Button onClick={loadJobs} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              <div className="grid gap-4 mb-6">
                <Card className="p-4">
                  <h3 className="font-medium mb-3">Quick Actions</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => triggerJob('refresh_materialized_view', { view_name: 'success_stats' })}
                      disabled={triggeringJob === 'refresh_materialized_view'}
                      variant="outline"
                      size="sm"
                    >
                      {triggeringJob === 'refresh_materialized_view' ? (
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Refresh Success Stats
                    </Button>

                    <Button
                      onClick={() => triggerJob('cleanup_logs', { retention_days: 30 })}
                      disabled={triggeringJob === 'cleanup_logs'}
                      variant="outline"
                      size="sm"
                    >
                      {triggeringJob === 'cleanup_logs' ? (
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4 mr-2" />
                      )}
                      Cleanup Old Logs
                    </Button>

                    <Button
                      onClick={() => triggerJob('update_metrics', { metric_types: ['engagement', 'activity'] })}
                      disabled={triggeringJob === 'update_metrics'}
                      variant="outline"
                      size="sm"
                    >
                      {triggeringJob === 'update_metrics' ? (
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Activity className="w-4 h-4 mr-2" />
                      )}
                      Update Metrics
                    </Button>
                  </div>
                </Card>
              </div>

              {jobsLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{job.name}</div>
                              {job.description && (
                                <div className="text-sm text-muted-foreground">{job.description}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{job.job_type}</TableCell>
                          <TableCell>
                            <Badge className={getJobStatusColor(job.status)}>
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{job.priority}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(job.created_at).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}