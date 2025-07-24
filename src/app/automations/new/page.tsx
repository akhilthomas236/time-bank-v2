'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { 
  ArrowLeft, 
  Save, 
  Upload,
  X,
  Plus,
  Calculator
} from 'lucide-react';
import { 
  AUTOMATION_CATEGORIES, 
  AutomationFormData
} from '@/types';
import { calculateCredits, validateAutomationForm } from '@/lib/utils';
import Link from 'next/link';

export default function NewAutomationPage() {
  const router = useRouter();
  const { currentUser, addAutomation } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<AutomationFormData>({
    title: '',
    description: '',
    category: '',
    timeSavedPerExecution: 0,
    frequency: 'weekly',
    tags: [],
    evidence: []
  });
  
  const [newTag, setNewTag] = useState('');

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const handleInputChange = (field: keyof AutomationFormData, value: string | number | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const calculateEstimatedCredits = () => {
    const { timeSavedPerExecution, frequency } = formData;
    if (!timeSavedPerExecution || !frequency) return 0;
    
    // Estimate executions per month
    const executionsPerMonth = {
      daily: 30,
      weekly: 4,
      monthly: 1
    }[frequency];
    
    const totalTimeSaved = timeSavedPerExecution * executionsPerMonth;
    return calculateCredits(totalTimeSaved);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateAutomationForm(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calculate credits
      const estimatedMonthlyExecutions = {
        daily: 30,
        weekly: 4,
        monthly: 1
      }[formData.frequency];
      
      const totalTimeSaved = formData.timeSavedPerExecution * estimatedMonthlyExecutions;
      const creditsEarned = calculateCredits(totalTimeSaved);

      // Submit automation
      addAutomation({
        userId: currentUser.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        timeSavedPerExecution: formData.timeSavedPerExecution,
        frequency: formData.frequency,
        totalExecutions: estimatedMonthlyExecutions,
        creditsEarned,
        status: 'pending',
        submissionDate: new Date(),
        evidence: formData.evidence?.map(file => file.name) || [],
        tags: formData.tags
      });

      // Redirect to automations page
      router.push('/automations');
    } catch {
      setErrors(['Failed to submit automation. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const estimatedCredits = calculateEstimatedCredits();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/automations"
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submit New Automation</h1>
          <p className="text-gray-600 mt-1">Share your automation and earn credits for the time saved</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <X className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Automation Title *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Automated Daily Report Generation"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what your automation does, how it works, and the problem it solves..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="">Select a category</option>
                {AUTOMATION_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Time Savings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Time Savings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Saved Per Execution (minutes) *
              </label>
              <input
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 30"
                value={formData.timeSavedPerExecution || ''}
                onChange={(e) => handleInputChange('timeSavedPerExecution', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usage Frequency *
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.frequency}
                onChange={(e) => handleInputChange('frequency', e.target.value as 'daily' | 'weekly' | 'monthly')}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* Credit Estimation */}
          {estimatedCredits > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Estimated Monthly Credits</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-blue-600">{estimatedCredits}</span>
                <span className="text-sm text-blue-700 ml-2">
                  (Based on {formData.frequency} usage saving {formData.timeSavedPerExecution}min each time)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
          <p className="text-sm text-gray-600 mb-4">Add tags to help categorize and discover your automation</p>
          
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>

          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Evidence */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Evidence (Optional)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Upload screenshots, code snippets, or documentation to support your submission
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Drag and drop files here, or click to select</p>
            <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB each</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <Link
            href="/automations"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Automation'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
