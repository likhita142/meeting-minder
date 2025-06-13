import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [authStatus, setAuthStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [tablesStatus, setTablesStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [errorDetails, setErrorDetails] = useState<string>('');

  const testConnection = async () => {
    try {
      // Test basic connection by checking if we can reach Supabase
      const { data, error } = await supabase.auth.getSession();

      if (error && error.message.includes('network')) {
        console.error('Connection error:', error);
        setConnectionStatus('error');
        setErrorDetails('Cannot connect to Supabase');
        return false;
      }

      setConnectionStatus('success');
      return true;
    } catch (error) {
      console.error('Connection failed:', error);
      setConnectionStatus('error');
      setErrorDetails(error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  };

  const testAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth error:', error);
        setAuthStatus('error');
        return false;
      }
      
      setAuthStatus('success');
      return true;
    } catch (error) {
      console.error('Auth test failed:', error);
      setAuthStatus('error');
      return false;
    }
  };

  const testTables = async () => {
    try {
      // Check if user is authenticated first
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setTablesStatus('error');
        setErrorDetails('Please sign in first to test database tables (RLS protection)');
        return false;
      }

      // Test if tables exist by trying to query them
      const tables = ['meetings', 'action_items'];

      for (const table of tables) {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        if (error) {
          console.error(`Table ${table} error:`, error);
          setTablesStatus('error');
          setErrorDetails(`Table '${table}' error: ${error.message}`);
          return false;
        }
      }

      setTablesStatus('success');
      return true;
    } catch (error) {
      console.error('Tables test failed:', error);
      setTablesStatus('error');
      setErrorDetails(error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  };

  const runAllTests = async () => {
    setConnectionStatus('testing');
    setAuthStatus('testing');
    setTablesStatus('testing');
    setErrorDetails('');

    await testConnection();
    await testAuth();
    await testTables();
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500 animate-pulse" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Failed';
      default:
        return 'Testing...';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Database Connection</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(connectionStatus)}
            <span className="text-sm">{getStatusText(connectionStatus)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span>Authentication</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(authStatus)}
            <span className="text-sm">{getStatusText(authStatus)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span>Database Tables</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(tablesStatus)}
            <span className="text-sm">{getStatusText(tablesStatus)}</span>
          </div>
        </div>

        {errorDetails && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700 font-medium">Error Details:</p>
            <p className="text-xs text-red-600 mt-1">{errorDetails}</p>
          </div>
        )}

        <Button onClick={runAllTests} className="w-full">
          Run Tests Again
        </Button>

        {tablesStatus === 'error' && errorDetails.includes('sign in') && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-700 font-medium">Authentication Required:</p>
            <p className="text-xs text-yellow-600 mt-1">
              Database tables are protected by Row Level Security. Sign in to test table access.
            </p>
          </div>
        )}

        {tablesStatus === 'error' && !errorDetails.includes('sign in') && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700 font-medium">Database Issue:</p>
            <p className="text-xs text-blue-600 mt-1">
              There may be an issue with the database tables or RLS policies.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
