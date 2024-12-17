import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { submitLeadRequest, RequestError } from '../../../lib/api/requestedLeads';

export default function RequestLeadForm() {
  const [request, setRequest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      await submitLeadRequest(request);
      setStatus('success');
      setRequest('');
      
      // Reset success status after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error submitting request:', error);
      setStatus('error');
      setErrorMessage(
        error instanceof RequestError 
          ? error.message 
          : 'Failed to submit request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-gray-500 mb-2">
          Help us improve! Let us know what kind of engagements you're looking for.
        </p>
        <textarea
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          placeholder="Describe the type of speaking opportunities you're interested in..."
          className="w-full h-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 resize-none disabled:opacity-50"
          disabled={isSubmitting}
        />
      </div>

      {status === 'error' && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {status === 'success' && (
        <div className="flex items-center space-x-2 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Request submitted successfully!</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!request.trim() || isSubmitting}
        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Submit Request
          </>
        )}
      </button>
    </form>
  );
}