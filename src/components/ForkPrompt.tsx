import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { GitFork, Copy, Edit3 } from 'lucide-react'
import { forking } from '../lib/api'
import { toast } from 'sonner'

interface ForkPromptProps {
  promptId: string
  promptTitle: string
  onForked?: (newPromptId: string) => void
  className?: string
}

export const ForkPrompt: React.FC<ForkPromptProps> = ({
  promptId,
  promptTitle,
  onForked,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isForking, setIsForking] = useState(false)
  const [newTitle, setNewTitle] = useState(`${promptTitle} (Fork)`)
  const [newDescription, setNewDescription] = useState('')
  const [forkReason, setForkReason] = useState('')

  const handleFork = async () => {
    if (!newTitle.trim()) {
      toast.error('Please provide a title for your fork')
      return
    }

    setIsForking(true)
    try {
      const { data: newPromptId, error } = await forking.fork(
        promptId,
        newTitle.trim(),
        newDescription.trim() || undefined,
        forkReason.trim() || undefined
      )

      if (error) throw error

      toast.success('Prompt forked successfully!')
      setIsOpen(false)
      onForked?.(newPromptId)

      // Reset form
      setNewTitle(`${promptTitle} (Fork)`)
      setNewDescription('')
      setForkReason('')
    } catch (error: any) {
      console.error('Error forking prompt:', error)
      toast.error(error.message || 'Failed to fork prompt')
    } finally {
      setIsForking(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <GitFork size={16} className="mr-2" />
          Fork Prompt
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitFork size={20} />
            Fork Prompt
          </DialogTitle>
          <DialogDescription>
            Create your own version of this prompt. You can modify it and share it with the community.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="fork-title">New Title *</Label>
            <Input
              id="fork-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter a title for your forked prompt"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="fork-description">Description (Optional)</Label>
            <Textarea
              id="fork-description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Describe your changes or how you'll use this prompt..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="fork-reason">Why are you forking? (Optional)</Label>
            <Textarea
              id="fork-reason"
              value={forkReason}
              onChange={(e) => setForkReason(e.target.value)}
              placeholder="e.g., 'Adapting for marketing use case', 'Adding template variables', 'Fixing for GPT-4'..."
              rows={2}
              className="mt-1"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Copy size={16} className="text-blue-600 mt-0.5" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">What happens when you fork?</p>
                <ul className="text-blue-800 space-y-1">
                  <li>• Creates a new prompt in your account</li>
                  <li>• Copies all content and settings</li>
                  <li>• Tracks the fork relationship</li>
                  <li>• You can modify and share your version</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isForking}
          >
            Cancel
          </Button>
          <Button onClick={handleFork} disabled={isForking || !newTitle.trim()}>
            {isForking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Forking...
              </>
            ) : (
              <>
                <GitFork size={16} className="mr-2" />
                Fork Prompt
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}