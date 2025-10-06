export interface TemplateVariable {
  key: string
  placeholder: string
  description?: string
  defaultValue?: string
  required?: boolean
}

export interface TemplateData {
  [key: string]: string
}

// Extract variables from prompt content
export const extractTemplateVariables = (content: string): TemplateVariable[] => {
  const variableRegex = /\{\{([^}]+)\}\}/g
  const variables: TemplateVariable[] = []
  const found = new Set<string>()

  let match
  while ((match = variableRegex.exec(content)) !== null) {
    const fullMatch = match[1].trim()

    // Support format: {{variable}} or {{variable:description}} or {{variable:description:defaultValue}}
    const parts = fullMatch.split(':')
    const key = parts[0].trim()

    if (!found.has(key)) {
      found.add(key)
      variables.push({
        key,
        placeholder: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
        description: parts[1]?.trim() || undefined,
        defaultValue: parts[2]?.trim() || undefined,
        required: true
      })
    }
  }

  return variables
}

// Replace variables in content with values
export const replaceTemplateVariables = (
  content: string,
  values: TemplateData
): string => {
  let result = content

  Object.entries(values).forEach(([key, value]) => {
    // Replace all instances of {{key}}, {{key:description}}, {{key:description:default}}
    const variableRegex = new RegExp(`\\{\\{\\s*${key}\\s*(?::[^}]*)?\\}\\}`, 'g')
    result = result.replace(variableRegex, value || `{{${key}}}`)
  })

  return result
}

// Validate template data
export const validateTemplateData = (
  variables: TemplateVariable[],
  data: TemplateData
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  variables.forEach(variable => {
    if (variable.required && (!data[variable.key] || data[variable.key].trim() === '')) {
      errors.push(`${variable.placeholder} is required`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Get template preview with current values
export const getTemplatePreview = (
  content: string,
  values: TemplateData
): string => {
  return replaceTemplateVariables(content, values)
}