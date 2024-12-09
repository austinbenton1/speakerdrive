import React, { useState, useEffect } from 'react';
import { Key, Mail as MailIcon, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import GmailConnectionModal from '../modals/GmailConnectionModal';
import OutlookConnectionModal from '../modals/OutlookConnectionModal';
import { useAuth } from '../../hooks/useAuth';

interface SmtpStatus {
  is_gmail_smtp: boolean | null;
  smtp_email: string | null;
  smtp_host?: string | null;
}

export default function SecurityTab() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGmailModal, setShowGmailModal] = useState(false);
  const [showOutlookModal, setShowOutlookModal] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<SmtpStatus>({
    is_gmail_smtp: null,
    smtp_email: null,
    smtp_host: null
  });

  useEffect(() => {
    const fetchSmtpStatus = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_gmail_smtp, smtp_email, smtp_host')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setSmtpStatus({
            is_gmail_smtp: data.is_gmail_smtp,
            smtp_email: data.smtp_email,
            smtp_host: data.smtp_host
          });
        }
      } catch (err) {
        console.error('Error fetching SMTP status:', err);
      }
    };

    fetchSmtpStatus();
  }, [user?.id]);

  const handleGmailConnect = async (data: { email: string; appPassword: string }) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          smtp_email: data.email,
          smtp_password: data.appPassword,
          is_gmail_smtp: true,
          smtp_host: null,
          smtp_port: null
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setSmtpStatus({
        is_gmail_smtp: true,
        smtp_email: data.email,
        smtp_host: null
      });

    } catch (err) {
      console.error('Error connecting Gmail:', err);
      setError('Failed to connect Gmail account. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleOutlookConnect = async (data: { email: string; password: string; host: string; port: string }) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          smtp_email: data.email,
          smtp_password: data.password,
          smtp_host: data.host,
          smtp_port: data.port,
          is_gmail_smtp: false
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setSmtpStatus({
        is_gmail_smtp: false,
        smtp_email: data.email,
        smtp_host: data.host
      });

    } catch (err) {
      console.error('Error connecting Outlook:', err);
      setError('Failed to connect Outlook account. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          smtp_email: null,
          smtp_password: null,
          smtp_host: null,
          smtp_port: null,
          is_gmail_smtp: null
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setSmtpStatus({
        is_gmail_smtp: null,
        smtp_email: null,
        smtp_host: null
      });

    } catch (err) {
      console.error('Error disconnecting email:', err);
      setError('Failed to disconnect email account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isOutlookConnected = !smtpStatus.is_gmail_smtp && smtpStatus.smtp_email && smtpStatus.smtp_host;

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Password Reset Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Password Reset</h3>
        <p className="text-sm text-gray-500 mb-4">Change your account password</p>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          disabled={isLoading}
        >
          <Key className="w-4 h-4 mr-2" />
          Reset Password
        </button>
      </div>

      {/* Email Authentication Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Email Authentication</h3>
        <p className="text-sm text-gray-500 mb-4">Connect your email account to streamline communications</p>
        
        <div className="space-y-4">
          {/* Gmail Connection */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
                alt="Gmail"
                className="h-6 w-6 mr-3"
              />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Gmail Account</h4>
                <p className="text-xs text-gray-500">
                  {smtpStatus.is_gmail_smtp 
                    ? `Connected: ${smtpStatus.smtp_email}` 
                    : 'Not connected'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {smtpStatus.is_gmail_smtp && (
                <button
                  onClick={handleDisconnect}
                  disabled={isLoading}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Disconnect
                </button>
              )}
              <button
                onClick={() => setShowGmailModal(true)}
                disabled={isLoading || (smtpStatus.is_gmail_smtp === false)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <MailIcon className="w-4 h-4 mr-2" />
                    {smtpStatus.is_gmail_smtp ? 'Reconnect' : 'Connect'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Outlook Connection */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg"
                alt="Outlook"
                className="h-6 w-6 mr-3"
              />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Outlook Account</h4>
                <p className="text-xs text-gray-500">
                  {isOutlookConnected 
                    ? `Connected: ${smtpStatus.smtp_email}` 
                    : 'Not connected'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isOutlookConnected && (
                <button
                  onClick={handleDisconnect}
                  disabled={isLoading}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Disconnect
                </button>
              )}
              <button
                onClick={() => setShowOutlookModal(true)}
                disabled={isLoading || (smtpStatus.is_gmail_smtp === true)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <MailIcon className="w-4 h-4 mr-2" />
                    {isOutlookConnected ? 'Reconnect' : 'Connect'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gmail Connection Modal */}
      <GmailConnectionModal
        isOpen={showGmailModal}
        onClose={() => setShowGmailModal(false)}
        onSubmit={handleGmailConnect}
      />

      {/* Outlook Connection Modal */}
      <OutlookConnectionModal
        isOpen={showOutlookModal}
        onClose={() => setShowOutlookModal(false)}
        onSubmit={handleOutlookConnect}
      />
    </div>
  );
}