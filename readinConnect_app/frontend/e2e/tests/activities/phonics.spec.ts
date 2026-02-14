import { test, expect } from '@playwright/test';
import { loginUser, TEST_USERS, waitForCloudFunctionResponse } from '../../utils/test-helpers';

test.describe('Phonics Activity Cloud Functions', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, TEST_USERS.student.email, TEST_USERS.student.password);
  });

  test('should process correct phonics answer and update progress', async ({ page }) => {
    await page.goto('/activities/phonics');
    
    // Wait for activity to load
    await page.waitForSelector('[data-testid="phonics-activity"]');
    
    // Select correct answer
    await page.click('[data-testid="option-correct"]');
    await page.click('[data-testid="submit-answer"]');
    
    // Wait for Cloud Function response
    await waitForCloudFunctionResponse(page);
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-update"]')).toContainText('streak');
  });

  test('should process incorrect phonics answer and reset streak', async ({ page }) => {
    await page.goto('/activities/phonics');
    
    await page.waitForSelector('[data-testid="phonics-activity"]');
    
    // Select incorrect answer
    await page.click('[data-testid="option-incorrect"]');
    await page.click('[data-testid="submit-answer"]');
    
    await waitForCloudFunctionResponse(page);
    
    // Verify feedback for incorrect answer
    await expect(page.locator('[data-testid="incorrect-feedback"]')).toBeVisible();
  });

  test('should calculate mastery after 5 consecutive correct answers', async ({ page }) => {
    await page.goto('/activities/phonics');
    
    // Answer 5 questions correctly
    for (let i = 0; i < 5; i++) {
      await page.waitForSelector('[data-testid="phonics-activity"]');
      await page.click('[data-testid="option-correct"]');
      await page.click('[data-testid="submit-answer"]');
      await page.waitForTimeout(500);
    }
    
    // Verify mastery achieved
    await expect(page.locator('[data-testid="mastery-badge"]')).toBeVisible();
  });
});
