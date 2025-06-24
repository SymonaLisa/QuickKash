import React, { useState } from 'react';
import { Plus, Video, FileText, Link, Download, Save, X } from 'lucide-react';
import { supabaseManager, PremiumContent } from '../utils/supabase';

interface PremiumContentManagerProps {
  creatorAddress: string;
  onContentAdded: () => void;
}

export const PremiumContentManager: React.FC<PremiumContentManagerProps> = ({ 
  creatorAddress, 
  onContentAdded 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'video' as 'video' | 'pdf' | 'link' | 'download',
    contentUrl: '',
    downloadFilename: '',
    minimumTip: 10
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contentTypeOptions = [
    { value: 'video', label: 'Video', icon: Video },
    { value: 'pdf', label: 'PDF Document', icon: FileText },
    { value: 'link', label: 'External Link', icon: Link },
    { value: 'download', label: 'Download File', icon: Download }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await supabaseManager.addPremiumContent({
        creator_address: creatorAddress,
        title: formData.title,
        description: formData.description,
        content_type: formData.contentType,
        content_url: formData.contentUrl,
        download_filename: formData.contentType === 'download' ? formData.downloadFilename : undefined,
        minimum_tip: formData.minimumTip
      });

      if (result.success) {
        setFormData({
          title: '',
          description: '',
          contentType: 'video',
          contentUrl: '',
          downloadFilename: '',
          minimumTip: 10
        });
        setShowForm(false);
        onContentAdded();
      } else {
        setError(result.error || 'Failed to add content');
      }
    } catch (err) {
      setError('Failed to add premium content');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center space-x-2 py-3 btn-primary"
      >
        <Plus className="w-5 h-5" />
        <span>Add Premium Content</span>
      </button>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-primary">Add Premium Content</h3>
        <button
          onClick={() => setShowForm(false)}
          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Content Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="input-field"
            placeholder="e.g., Exclusive Behind-the-Scenes Video"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="input-field resize-none"
            rows={3}
            placeholder="Describe what supporters will get access to..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Content Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {contentTypeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, contentType: option.value as any }))}
                  className={`flex items-center space-x-2 p-3 rounded-xl border-2 transition-all ${
                    formData.contentType === option.value
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-slate-600 hover:border-slate-500 bg-slate-700/30 text-slate-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Content URL
          </label>
          <input
            type="url"
            value={formData.contentUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, contentUrl: e.target.value }))}
            className="input-field"
            placeholder={
              formData.contentType === 'video' ? 'https://youtube.com/watch?v=...' :
              formData.contentType === 'pdf' ? 'https://drive.google.com/file/d/...' :
              formData.contentType === 'download' ? 'https://dropbox.com/s/...' :
              'https://example.com/exclusive-content'
            }
            required
          />
        </div>

        {formData.contentType === 'download' && (
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Download Filename
            </label>
            <input
              type="text"
              value={formData.downloadFilename}
              onChange={(e) => setFormData(prev => ({ ...prev, downloadFilename: e.target.value }))}
              className="input-field"
              placeholder="exclusive-content.zip"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Minimum Tip Amount (ALGO)
          </label>
          <input
            type="number"
            min="1"
            step="0.1"
            value={formData.minimumTip}
            onChange={(e) => setFormData(prev => ({ ...prev, minimumTip: parseFloat(e.target.value) }))}
            className="input-field"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm backdrop-blur-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center space-x-2 py-3 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{isSubmitting ? 'Adding...' : 'Add Content'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};