// Test script to verify image functionality
// Run this in the browser console to debug image issues

// Test 1: Check if images are being loaded from database
console.log('=== Testing Image Loading ===');

// Get all prompts from state
const prompts = window.appState?.prompts || [];
console.log('Total prompts in state:', prompts.length);

// Check prompts with images
const promptsWithImages = prompts.filter(p => p.images && p.images.length > 0);
console.log('Prompts with images:', promptsWithImages.length);

promptsWithImages.forEach(prompt => {
  console.log(`Prompt "${prompt.title}" has ${prompt.images.length} images:`);
  prompt.images.forEach((img, i) => {
    console.log(`  Image ${i+1}:`, {
      id: img.id,
      url: img.url,
      altText: img.altText,
      isPrimary: img.isPrimary,
      size: img.size,
      mimeType: img.mimeType
    });
  });
});

// Test 2: Check if API calls are working
console.log('\n=== Testing API Calls ===');

async function testImageAPI() {
  try {
    // Test getting prompts with images
    const response = await fetch('/api/prompts?limit=5');
    const data = await response.json();
    console.log('API response:', data);

    if (data.data && data.data.length > 0) {
      const promptWithImages = data.data.find(p => p.prompt_images && p.prompt_images.length > 0);
      if (promptWithImages) {
        console.log('Found prompt with images in API:', promptWithImages.title);
        console.log('Images:', promptWithImages.prompt_images);
      } else {
        console.log('No prompts with images found in API response');
      }
    }
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testImageAPI();

// Test 3: Check Supabase connection
console.log('\n=== Testing Supabase Connection ===');

async function testSupabaseConnection() {
  try {
    const { data, error } = await window.supabase.from('prompts').select('id, title').limit(1);
    if (error) {
      console.error('Supabase error:', error);
    } else {
      console.log('Supabase connection OK, sample prompt:', data[0]);
    }
  } catch (error) {
    console.error('Supabase test failed:', error);
  }
}

testSupabaseConnection();

// Instructions
console.log('\n=== Debug Instructions ===');
console.log('1. Check if prompts have images in the state');
console.log('2. Check if API returns images');
console.log('3. Check if Supabase connection works');
console.log('4. Look for any console errors when loading prompt details');
console.log('5. Try creating/editing a prompt with images');