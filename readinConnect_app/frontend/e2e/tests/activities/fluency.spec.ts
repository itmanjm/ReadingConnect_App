import { test, expect } from '@playwright/test';
import { loginUser, TEST_USERS, waitForCloudFunctionResponse } from '../../utils/test-helpers';

test.describe('Fluency Activity Cloud Functions', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, TEST_USERS.student.email, TEST_USERS.student.password);
  });

  test('should process fluency session and calculate WPM', async ({ page }) => {
    await page.goto('/activities/fluency');
    
    await page.waitForSelector('[data-testid="fluency-passage"]');
    
    // Start recording
    await page.click('[data-testid="start-recording"]');
    await page.waitForTimeout(2000);
    await page.click('[data-testid="stop-recording"]');
    
    await waitForCloudFunctionResponse(page, 15000);
    
    await expect(page.locator('[data-testid="wpm-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="accuracy-score"]')).toBeVisible();
  });

  test('should track fluency progress over multiple sessions', async ({ page }) => {
    await page.goto('/activities/fluency');
    
    // Complete first session
    await page.waitForSelector('[data-testid="fluency-passage"]');
    await page.click('[data-testid="start-recording"]');
    await page.waitForTimeout(2000);
    await page.click('[data-testid="stop-recording"]');
    await waitForCloudFunctionResponse(page, 15000);
    
    // Check progress tracking
    await page.goto('/progress/fluency');
    await expect(page.locator('[data-testid="fluency-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="session-count"]')).toContainText('1');
  });
});
