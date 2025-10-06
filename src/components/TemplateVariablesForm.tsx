import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Copy, Eye, EyeOff, RotateCcw } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import {
  extractTemplateVariables,
  replaceTemplateVariables,
  validateTemplateData,
  type TemplateVariable,
  type TemplateData
} from '../lib/templateVariables'
import { toast } from 'sonner'

interface TemplateVariablesFormProps {
  content: string
  onContentChange?: (newContent: string) => void
  className?: string
}

export const TemplateVariablesForm: React.FC<TemplateVariablesFormProps> = ({
  content,
  onContentChange,
  className = ''
}) => {
  const [variables, setVariables] = useState<TemplateVariable[]>([])
  const [templateData, setTemplateData] = useState<TemplateData>({})
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState('variables')

  useEffect(() => {
    const extractedVars = extractTemplateVariables(content)
    setVariables(extractedVars)

    // Initialize with default values
    const initialData: TemplateData = {}
    extractedVars.forEach(variable => {
      if (variable.defaultValue) {
        initialData[variable.key] = variable.defaultValue
      }
    })
    setTemplateData(initialData)
  }, [content])

  const handleVariableChange = (key: string, value: string) => {
    setTemplateData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const resetToDefaults = () => {
    const defaultData: TemplateData = {}
    variables.forEach(variable => {
      if (variable.defaultValue) {
        defaultData[variable.key] = variable.defaultValue
      }
    })
    setTemplateData(defaultData)
    toast.success('Reset to default values')
  }

  const copyResult = async () => {
    const result = replaceTemplateVariables(content, templateData)
    try {
      await navigator.clipboard.writeText(result)
      toast.success('Copied customized prompt to clipboard!')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const generateNewContent = () => {
    const result = replaceTemplateVariables(content, templateData)
    onContentChange?.(result)
    toast.success('Prompt updated with your values')
  }

  if (variables.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            No template variables found. Use <code>{'{{variable_name}}'}</code> format to create customizable prompts.
          </p>
        </CardContent>
      </Card>
    )
  }

  const previewContent = replaceTemplateVariables(content, templateData)
  const validation = validateTemplateData(variables, templateData)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Template Variables
          <Badge variant="secondary">{variables.length}</Badge>
        </CardTitle>
        <CardDescription>
          Customize this prompt by filling in the variables below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="variables">Variables</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="variables" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefaults}
                className="flex items-center gap-2"
              >
                <RotateCcw size={14} />
                Reset Defaults
              </Button>
            </div>

            {variables.map((variable) => (
              <div key={variable.key} className="space-y-2">
                <Label htmlFor={variable.key} className="flex items-center gap-2">
                  {variable.placeholder}
                  {variable.required && <span className="text-red-500">*</span>}
                </Label>

                {variable.description && (
                  <p className="text-xs text-muted-foreground">
                    {variable.description}
                  </p>
                )}

                <Textarea
                  id={variable.key}
                  placeholder={`Enter ${variable.placeholder.toLowerCase()}...`}
                  value={templateData[variable.key] || ''}
                  onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                  rows={2}
                  className="resize-none"
                />

                {variable.defaultValue && (
                  <p className="text-xs text-muted-foreground">
                    Default: {variable.defaultValue}
                  </p>
                )}
              </div>
            ))}

            {!validation.isValid && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">Please fix these issues:</p>
                <ul className="mt-1 text-sm text-red-700">
                  {validation.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                onClick={copyResult}
                disabled={!validation.isValid}
                className="flex items-center gap-2"
              >
                <Copy size={16} />
                Copy Result
              </Button>

              {onContentChange && (
                <Button
                  variant="secondary"
                  onClick={generateNewContent}
                  disabled={!validation.isValid}
                >
                  Use This Version
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Preview with your values:</Label>
                <Badge variant={validation.isValid ? "default" : "destructive"}>
                  {validation.isValid ? "Ready" : "Incomplete"}
                </Badge>
              </div>

              <div className="p-4 bg-gray-50 border rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {previewContent}
                </pre>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={copyResult}
                  disabled={!validation.isValid}
                  className="flex items-center gap-2"
                >
                  <Copy size={16} />
                  Copy Result
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}