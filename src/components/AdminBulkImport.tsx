import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { prompts as promptsAPI } from '../lib/api';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export function AdminBulkImport() {
  const { state } = useApp();
  const user = state.user;
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const prompts = [];

    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      // Parse CSV with proper quote handling
      for (let char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ''));

      if (values.length === headers.length) {
        const prompt: any = {};
        headers.forEach((header, index) => {
          prompt[header] = values[index];
        });
        prompts.push(prompt);
      }
    }

    return prompts;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file || !user) return;

    setImporting(true);
    setResult(null);

    try {
      const text = await file.text();
      const prompts = parseCSV(text);

      if (prompts.length === 0) {
        setResult({
          success: 0,
          failed: 0,
          errors: ['No valid prompts found in CSV file']
        });
        return;
      }

      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const promptData of prompts) {
        try {
          // Validate required fields
          if (!promptData.title || !promptData.content || !promptData.category) {
            errors.push(`Skipped prompt: Missing required fields (title, content, or category)`);
            failed++;
            continue;
          }

          // Create slug from title
          const slug = promptData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            + '-' + Date.now();

          // Parse arrays from comma-separated strings
          const tags = promptData.tags ? promptData.tags.split(',').map((t: string) => t.trim()) : [];
          const modelCompatibility = promptData.model_compatibility 
            ? promptData.model_compatibility.split(',').map((m: string) => m.trim())
            : ['GPT-4'];

          // Create the prompt with 'unlisted' visibility for admin moderation
          await promptsAPI.create({
            user_id: user.id,
            title: promptData.title,
            slug,
            description: promptData.description || '',
            content: promptData.content,
            type: (promptData.type || 'text') as any,
            model_compatibility: modelCompatibility,
            tags,
            visibility: (promptData.visibility || 'unlisted') as any, // Changed default to 'unlisted' for moderation
            category: promptData.category,
            version: '1.0.0'
          });

          success++;
        } catch (error: any) {
          failed++;
          errors.push(`Failed to import "${promptData.title}": ${error.message}`);
        }
      }

      setResult({ success, failed, errors });
    } catch (error: any) {
      setResult({
        success: 0,
        failed: 0,
        errors: [`Failed to read file: ${error.message}`]
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `title,description,content,category,type,tags,model_compatibility,visibility
"Professional Email Generator","Create compelling professional emails","You are a professional email writing assistant...","Business","text","business,email,communication","GPT-4,Claude-3.5-Sonnet","public"
"Code Review AI","Comprehensive code review","You are an expert code reviewer...","Development","code","coding,review,quality","GPT-4,Claude-3.5-Sonnet","public"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompt-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Bulk Import Prompts</h1>
        <p className="text-muted-foreground">
          Import multiple prompts at once using a CSV file. Perfect for seeding your platform with quality content.
        </p>
      </div>

      {/* Template Download */}
      <Card className="p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
            <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Download CSV Template</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start with our template to ensure your CSV is formatted correctly. 
              Open in Excel or Google Sheets to easily fill in your prompts.
            </p>
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>
        </div>
      </Card>

      {/* File Upload */}
      <Card className="p-6 mb-6">
        <h3 className="font-semibold mb-4">Upload Your CSV File</h3>
        
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              {file ? file.name : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-muted-foreground">
              CSV file up to 10MB
            </p>
          </label>
        </div>

        {file && (
          <div className="mt-4">
            <Button
              onClick={handleImport}
              disabled={importing}
              className="w-full"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Prompts
                </>
              )}
            </Button>
          </div>
        )}
      </Card>

      {/* Results */}
      {result && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Import Results</h3>
          
          <div className="space-y-4">
            {result.success > 0 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium">
                  Successfully imported {result.success} prompt{result.success !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {result.failed > 0 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium">
                  Failed to import {result.failed} prompt{result.failed !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {result.errors.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">Error Details:</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 pl-6">
                  {result.errors.map((error, index) => (
                    <li key={index} className="list-disc">{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.success > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  Your prompts have been imported successfully! They are currently unlisted and require admin approval before appearing publicly.
                  Go to Content Moderation to review and approve them.
                </p>
                <Button variant="outline" onClick={() => window.location.href = '/admin/content-moderation'}>
                  Go to Content Moderation
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-6 mt-6 bg-muted/50">
        <h3 className="font-semibold mb-3">CSV Format Instructions</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li><strong>Required columns:</strong> title, content, category</li>
          <li><strong>Optional columns:</strong> description, type, tags, model_compatibility, visibility</li>
          <li><strong>Tags:</strong> Comma-separated list (e.g., "business,email,productivity")</li>
          <li><strong>Models:</strong> Comma-separated list (e.g., "GPT-4,Claude-3.5-Sonnet")</li>
          <li><strong>Type:</strong> text, code, image, agent, or chain (defaults to "text")</li>
          <li><strong>Visibility:</strong> public, private, or unlisted (defaults to "unlisted" - requires admin approval)</li>
          <li><strong>Long content:</strong> Wrap in quotes and use proper CSV escaping</li>
        </ul>
      </Card>
    </div>
  );
}