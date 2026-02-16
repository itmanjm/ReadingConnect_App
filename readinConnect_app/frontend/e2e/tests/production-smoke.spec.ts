import { test, expect } from '@playwright/test';

const BASE_URL = 'https://readingconnect-lit.web.app';

test.describe('ReadingConnect Production Tests', () => {
  
  test('Login page loads correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    
    // Check page title
    await expect(page).toHaveTitle(/Welcome Back|ReadingConnect/i);
    
    // Check for form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check for Google sign-in button
    await expect(page.locator('text=Sign in with Google')).toBeVisible();
  });

  test('Registration page loads correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/register`);
    
    await expect(page).toHaveTitle(/Join the Fun|ReadingConnect/i);
    
    // Check for form elements
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Check for role selection
    await expect(page.locator('text=Student')).toBeVisible();
    await expect(page.locator('text=Teacher')).toBeVisible();
  });

  test('Teacher dashboard requires authentication', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/teacher`);
    
    // Should redirect to login
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('Teacher login workflow', async ({ page }) => {
    // Navigate to login
    await page.goto(`${BASE_URL}/auth/login`);
    
    // Fill credentials
    await page.fill('input[type="email"]', 'nrgkid@gmail.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForTimeout(3000);
    
    // Should be on dashboard
    const url = page.url();
    expect(url).toContain('dashboard');
    
    // Check for teacher-specific content
    const pageContent = await page.content();
    expect(pageContent).toContain('Welcome');
  });

  test('Teacher features are accessible after login', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[type="email"]', 'nrgkid@gmail.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Test Reports page
    await page.goto(`${BASE_URL}/teacher/reports`);
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/teacher/reports');
    
    // Test Level Assignment
    await page.goto(`${BASE_URL}/teacher/level-assignment`);
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/teacher/level-assignment');
    
    // Test Observation Sheets
    await page.goto(`${BASE_URL}/teacher/observation-sheets`);
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/teacher/observation-sheets');
  });

  test('Activity pages are accessible', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[type="email"]', 'nrgkid@gmail.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Test Phonics
    await page.goto(`${BASE_URL}/activities/phonics`);
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/activities/phonics');
    
    // Test Sight Words
    await page.goto(`${BASE_URL}/activities/sight-words`);
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/activities/sight-words');
    
    // Test Fluency
    await page.goto(`${BASE_URL}/activities/fluency`);
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/activities/fluency');
    
    // Test Comprehension
    await page.goto(`${BASE_URL}/activities/comprehension`);
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/activities/comprehension');
  });

  test('Console should not have critical errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', (error: Error) => {
      errors.push(error.message);
    });
    
    await page.goto(`${BASE_URL}/auth/login`);
    await page.waitForTimeout(3000);
    
    await page.fill('input[type="email"]', 'nrgkid@gmail.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    await page.goto(`${BASE_URL}/dashboard/teacher`);
    await page.waitForTimeout(3000);
    
    const criticalErrors = errors.filter((e: string) => 
      e.includes('Firebase') && 
      (e.includes('invalid') || e.includes('error') || e.includes('credential'))
    );
    
    if (errors.length > 0) {
      console.log('Console errors found:', errors);
    }
    
    expect(criticalErrors).toHaveLength(0);
  });
});
