const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = 'https://readingconnect-lit.web.app';
const TEACHER_EMAIL = 'nrgkid@gmail.com';
const TEACHER_PASSWORD = 'TestPass123!';
const STUDENT_EMAIL = 'drebusiness09@gmail.com';

test.describe('ReadingConnect Teacher Workflow', () => {
  
  test('1. Login Page Loads', async ({ page }) => {
    console.log('Testing login page...');
    await page.goto(`${BASE_URL}/auth/login`);
    
    // Check if page loads
    await expect(page).toHaveTitle(/ReadingConnect|Login|Welcome/i);
    
    // Check for login form elements
    const emailInput = await page.locator('input[type="email"]').first();
    const passwordInput = await page.locator('input[type="password"]').first();
    const submitButton = await page.locator('button[type="submit"]').first();
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    console.log('✅ Login page loaded successfully');
  });

  test('2. Teacher Login', async ({ page }) => {
    console.log('Testing teacher login...');
    await page.goto(`${BASE_URL}/auth/login`);
    
    // Fill login form
    await page.fill('input[type="email"]', TEACHER_EMAIL);
    await page.fill('input[type="password"]', TEACHER_PASSWORD);
    
    // Click login
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForTimeout(3000);
    
    // Check URL
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);
    
    // Should redirect to dashboard
    expect(currentUrl).toContain('dashboard');
    
    console.log('✅ Teacher login successful');
  });

  test('3. Teacher Dashboard Loads', async ({ page }) => {
    console.log('Testing teacher dashboard...');
    
    // Login first
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[type="email"]', TEACHER_EMAIL);
    await page.fill('input[type="password"]', TEACHER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Check dashboard elements
    const welcomeText = await page.locator('text=/Welcome/i').first();
    await expect(welcomeText).toBeVisible();
    
    // Check for student stats cards
    const studentsCard = await page.locator('text=/Students/i').first();
    await expect(studentsCard).toBeVisible();
    
    console.log('✅ Teacher dashboard loaded successfully');
  });

  test('4. Teacher Features Navigation', async ({ page }) => {
    console.log('Testing teacher feature navigation...');
    
    // Login first
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[type="email"]', TEACHER_EMAIL);
    await page.fill('input[type="password"]', TEACHER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Test Reports page
    await page.goto(`${BASE_URL}/teacher/reports`);
    await page.waitForTimeout(2000);
    const reportsUrl = page.url();
    expect(reportsUrl).toContain('/teacher/reports');
    console.log('✅ Reports page accessible');
    
    // Test Messages page
    await page.goto(`${BASE_URL}/teacher/messages`);
    await page.waitForTimeout(2000);
    const messagesUrl = page.url();
    expect(messagesUrl).toContain('/teacher/messages');
    console.log('✅ Messages page accessible');
    
    // Test Level Assignment page
    await page.goto(`${BASE_URL}/teacher/level-assignment`);
    await page.waitForTimeout(2000);
    const levelUrl = page.url();
    expect(levelUrl).toContain('/teacher/level-assignment');
    console.log('✅ Level Assignment page accessible');
  });

  test('5. Student Features Navigation', async ({ page }) => {
    console.log('Testing student feature navigation...');
    
    // Login as teacher
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[type="email"]', TEACHER_EMAIL);
    await page.fill('input[type="password"]', TEACHER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Test Phonics activity
    await page.goto(`${BASE_URL}/activities/phonics`);
    await page.waitForTimeout(2000);
    const phonicsUrl = page.url();
    expect(phonicsUrl).toContain('/activities/phonics');
    console.log('✅ Phonics activity accessible');
    
    // Test Sight Words activity
    await page.goto(`${BASE_URL}/activities/sight-words`);
    await page.waitForTimeout(2000);
    const sightWordsUrl = page.url();
    expect(sightWordsUrl).toContain('/activities/sight-words');
    console.log('✅ Sight Words activity accessible');
  });

  test('6. Check Console for Errors', async ({ page }) => {
    console.log('Checking console for errors...');
    
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.error('Console Error:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
      console.error('Page Error:', error.message);
    });
    
    // Load main pages
    await page.goto(`${BASE_URL}/auth/login`);
    await page.waitForTimeout(2000);
    
    // Login
    await page.fill('input[type="email"]', TEACHER_EMAIL);
    await page.fill('input[type="password"]', TEACHER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/dashboard/teacher`);
    await page.waitForTimeout(2000);
    
    // Check for critical errors
    const criticalErrors = errors.filter(e => 
      e.includes('Firebase') || 
      e.includes('auth') || 
      e.includes('invalid') ||
      e.includes('Error')
    );
    
    if (criticalErrors.length > 0) {
      console.log('❌ Critical errors found:', criticalErrors);
    } else {
      console.log('✅ No critical errors in console');
    }
    
    expect(criticalErrors.length).toBe(0);
  });
});
