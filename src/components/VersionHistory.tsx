import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Clock, GitBranch, RotateCcw, Eye, EyeOff } from 'lucide-react'
import { getPromptVersions, createPromptVersion, restorePromptVersion, type PromptVersion } from '../lib/versions'
import { useApp } from '../contexts/AppContext'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface VersionHistoryProps {
  promptId: string
  currentTitle: string
  currentDescription: string
  currentContent: string
  onVersionRestore?: (version: PromptVersion) => void
  className?: string
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  promptId,
  currentTitle,
  currentDescription,
  currentContent,
  onVersionRestore,
  className = ''
}) => {
  const { state } = useApp()
  const [versions, setVersions] = useState<PromptVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [changeDescription, setChangeDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadVersions()
  }, [promptId])

  const loadVersions = async () => {
    setLoading(true)
    const data = await getPromptVersions(promptId)
    setVersions(data)
    setLoading(false)
  }

  const handleCreateVersion = async () => {
    if (!changeDescription.trim()) {
      toast.error('Please describe the changes')
      return
    }

    setCreating(true)
    try {
      const result = await createPromptVersion(
        promptId,
        currentTitle,
        currentDescription,
        currentContent,
        changeDescription
      )

      if (result.success) {
        toast.success('Version created successfully')
        setShowCreateDialog(false)
        setChangeDescription('')
        await loadVersions()
      } else {
        toast.error(result.error || 'Failed to create version')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  const handleRestoreVersion = async (version: PromptVersion) => {
    try {
      const result = await restorePromptVersion(promptId, version.id)
      if (result.success) {
        toast.success('Version restored successfully')
        onVersionRestore?.(version)
        await loadVersions()
      } else {
        toast.error(result.error || 'Failed to restore version')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const toggleVersionExpansion = (versionId: string) => {
    const newExpanded = new Set(expandedVersions)
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId)
    } else {
      newExpanded.add(versionId)
    }
    setExpandedVersions(newExpanded)
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} />
              Version History
              <Badge variant="secondary">{versions.length}</Badge>
            </CardTitle>
            <CardDescription>
              Track changes and restore previous versions
            </CardDescription>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <GitBranch size={16} className="mr-2" />
                Create Version
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Version</DialogTitle>
                <DialogDescription>
                  Save the current state of this prompt as a new version
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="change-description">Change Description</Label>
                  <Textarea
                    id="change-description"
                    placeholder="Describe what changed in this version..."
                    value={changeDescription}
                    onChange={(e) => setChangeDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateVersion}
                    disabled={creating || !changeDescription.trim()}
                  >
                    {creating ? 'Creating...' : 'Create Version'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {versions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock size={48} className="mx-auto mb-4 opacity-50" />
            <p>No versions yet</p>
            <p className="text-sm">Create your first version to start tracking changes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex flex-col items-center">
                      <Badge variant="outline" className="text-xs">
                        v{version.version_number}
                      </Badge>
                      {index < versions.length - 1 && (
                        <div className="w-px h-8 bg-border mt-2"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium truncate">{version.title}</h4>
                        {index === 0 && (
                          <Badge variant="default" className="text-xs">
                            Latest
                          </Badge>
                        )}
                      </div>

                      {version.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {version.description}
                        </p>
                      )}

                      {version.change_description && (
                        <div className="bg-muted/50 rounded p-2 mb-2">
                          <p className="text-sm italic">
                            "{version.change_description}"
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={version.author?.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {version.author?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span>{version.author?.username || 'Unknown'}</span>
                        </div>
                        <span>{format(new Date(version.created_at), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVersionExpansion(version.id)}
                    >
                      {expandedVersions.has(version.id) ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </Button>

                    {index > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreVersion(version)}
                      >
                        <RotateCcw size={16} className="mr-1" />
                        Restore
                      </Button>
                    )}
                  </div>
                </div>

                {expandedVersions.has(version.id) && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="bg-muted/30 rounded p-3">
                      <pre className="whitespace-pre-wrap text-sm font-mono text-muted-foreground">
                        {version.content}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}