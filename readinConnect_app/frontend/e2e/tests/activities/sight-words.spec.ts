import { test, expect } from '@playwright/test';
import { loginUser, TEST_USERS, waitForCloudFunctionResponse } from '../../utils/test-helpers';

test.describe('Sight Words Activity Cloud Functions', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, TEST_USERS.student.email, TEST_USERS.student.password);
  });

  test('should process sight word answer and track mastery', async ({ page }) => {
    await page.goto('/activities/sight-words');
    
    await page.waitForSelector('[data-testid="sight-word-card"]');
    
    // Mark word as known
    await page.click('[data-testid="mark-known"]');
    
    await waitForCloudFunctionResponse(page);
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="mastery-progress"]')).toBeVisible();
  });

  test('should handle practice mode for unknown words', async ({ page }) => {
    await page.goto('/activities/sight-words');
    
    await page.waitForSelector('[data-testid="sight-word-card"]');
    
    // Mark word for practice
    await page.click('[data-testid="mark-practice"]');
    
    await waitForCloudFunctionResponse(page);
    
    await expect(page.locator('[data-testid="practice-queue"]')).toContainText('Added to practice');
  });

  test('should award Sight Words Master badge after mastering all words', async ({ page }) => {
    await page.goto('/activities/sight-words');
    
    // Simulate mastering all required words
    await page.evaluate(() => {
      (window as any).testMasterAllSightWords();
    });
    
    await waitForCloudFunctionResponse(page, 15000);
    
    await expect(page.locator('[data-testid="badge-unlocked"]')).toContainText('Sight Words Master');
  });
});
