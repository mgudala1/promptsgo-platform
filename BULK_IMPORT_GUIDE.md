# Admin Bulk Import Guide

## 🎯 Overview

The Bulk Import feature allows admins to quickly seed the platform with high-quality prompts using a simple CSV file. No more dealing with SQL, UUIDs, or database constraints!

## ✅ Benefits

- **Easy to use**: Work with Excel or Google Sheets
- **No technical knowledge needed**: Just fill in a template
- **Fast**: Import dozens of prompts in seconds
- **Safe**: Validates data before importing
- **Flexible**: Edit your CSV until it's perfect

## 🚀 How to Use

### Step 1: Access the Import Page

As an admin, navigate to: **`yoursite.com/?page=admin-bulk-import`**

Or add a link in your navigation menu (see Implementation section below).

### Step 2: Download the Template

1. Click **"Download Template"** button
2. Open the CSV in Excel or Google Sheets
3. You'll see these columns:
   - `title` (required)
   - `description` (optional)
   - `content` (required) 
   - `category` (required)
   - `type` (optional, defaults to "text")
   - `tags` (optional, comma-separated)
   - `model_compatibility` (optional, comma-separated)
   - `visibility` (optional, defaults to "public")

### Step 3: Fill in Your Prompts

**Example Row:**

```csv
title,description,content,category,type,tags,model_compatibility,visibility
"Email Writer","Create professional emails","You are an expert email writer...","Business","text","business,email,productivity","GPT-4,Claude-3.5-Sonnet","public"
```

**Important Tips:**

- Wrap long content in double quotes
- For multi-line content, use proper CSV escaping
- Separate tags with commas (no spaces): `tag1,tag2,tag3`
- Separate models with commas: `GPT-4,Claude-3.5-Sonnet,Gemini-1.5-Pro`

### Step 4: Upload and Import

1. Save your CSV file
2. Click the upload area or drag-and-drop your file
3. Click **"Import Prompts"**
4. Wait for confirmation

### Step 5: Verify

- Check the import results
- Click "View Imported Prompts" to see them on the Explore page
- All prompts will be created under your admin account

## 📋 CSV Template Reference

### Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| `title` | Prompt name | "Professional Email Generator" |
| `content` | Full prompt text | "You are an expert..." |
| `category` | Category name | "Business" |

### Optional Fields

| Field | Default | Options | Example |
|-------|---------|---------|---------|
| `description` | "" | Any text | "Create compelling emails" |
| `type` | "text" | text, code, image, agent, chain | "text" |
| `tags` | [] | Comma-separated | "business,email,productivity" |
| `model_compatibility` | ["GPT-4"] | Comma-separated | "GPT-4,Claude-3.5-Sonnet" |
| `visibility` | "public" | public, private, unlisted | "public" |

### Valid Categories

- Business
- Development  
- Marketing
- Data Analysis
- Creative
- Education
- Productivity
- Design
- Sales
- Customer Service

### Valid Types

- `text` - Text-based prompts
- `code` - Code generation prompts
- `image` - Image generation prompts  
- `agent` - AI agent prompts
- `chain` - Multi-step chain prompts

### Valid Visibility

- `public` - Visible to everyone
- `private` - Only visible to you
- `unlisted` - Accessible via link only

## 📝 CSV Formatting Tips

### For Long Content

Wrap in double quotes and escape internal quotes:

```csv
"content","This is a long prompt that spans multiple lines.

It can include paragraphs.

And bullet points:
- Point 1
- Point 2"
```

### For Content with Quotes

Escape double quotes by doubling them:

```csv
"content","The prompt says ""Hello World"" as an example."
```

### For Formulas (if editing in Excel)

Prefix with a single quote to prevent Excel from evaluating:

```csv
"content","'Use this formula: =SUM(A1:A10)"
```

## 🛠️ Implementation (Adding to Navigation)

### Option 1: Direct URL

Share this URL with admins:
```
yoursite.com/?page=admin-bulk-import
```

### Option 2: Add to Settings Page

Edit `src/components/SettingsPage.tsx`:

```tsx
{isAdmin(user) && (
  <Button onClick={() => window.location.href = '/?page=admin-bulk-import'}>
    Bulk Import Prompts
  </Button>
)}
```

### Option 3: Add to Admin Menu

Create an admin-only navigation section in `Navigation.tsx`.

## 🔒 Security

- Only users in the admin list can access this feature
- All prompts are created under the admin's account
- Failed imports don't affect the database
- Validation happens before any database writes

## ❌ Troubleshooting

### "No valid prompts found"
- Check CSV format
- Ensure headers match template exactly
- Verify no empty rows

### "Missing required fields"
- Title, content, and category are required
- Check for typos in column names

### "Failed to import [prompt]"
- Check error message for specific issue
- Verify data types match expected format
- Ensure slug generation doesn't conflict

### Import succeeds but prompts don't appear
- Refresh the page
- Check visibility is set to "public"
- Verify you're on the Explore page

## 💡 Best Practices

1. **Start Small**: Test with 2-3 prompts first
2. **Use Template**: Always start from the downloaded template
3. **Validate in Excel**: Fix any issues before uploading
4. **Backup**: Keep a copy of your CSV file
5. **Consistent Formatting**: Use similar structure across prompts
6. **Quality Over Quantity**: Focus on well-written, useful prompts

## 📊 Example Use Cases

### Seeding a New Platform

Import 20-30 high-quality prompts across categories to make your platform feel established.

### Category Launch

Create a CSV with 10 prompts for a new category you're launching.

### Content Updates

Bulk update prompts by exporting, editing, and re-importing.

### Testing

Create test prompts quickly for QA and development.

## 🎉 Sample Prompts

See `prompt-import-template.csv` for complete examples including:
- Professional Email Generator
- Code Review AI
- SEO Blog Post Optimizer
- And more!

---

**Need Help?** Check your error messages carefully - they'll tell you exactly what went wrong!