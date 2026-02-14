import { test, expect } from '@playwright/test';
import { loginUser, TEST_USERS, waitForCloudFunctionResponse } from '../../utils/test-helpers';

test.describe('Comprehension Activity Cloud Functions', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, TEST_USERS.student.email, TEST_USERS.student.password);
  });

  test('should process comprehension answer and provide feedback', async ({ page }) => {
    await page.goto('/activities/comprehension');
    
    await page.waitForSelector('[data-testid="comprehension-passage"]');
    await page.waitForSelector('[data-testid="comprehension-question"]');
    
    // Select answer
    await page.click('[data-testid="answer-option-a"]');
    await page.click('[data-testid="submit-answer"]');
    
    await waitForCloudFunctionResponse(page);
    
    await expect(page.locator('[data-testid="feedback-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="accuracy-update"]')).toBeVisible();
  });

  test('should track comprehension accuracy by question type', async ({ page }) => {
    await page.goto('/activities/comprehension');
    
    // Answer multiple questions
    for (let i = 0; i < 3; i++) {
      await page.waitForSelector('[data-testid="comprehension-question"]');
      await page.click('[data-testid="answer-option-correct"]');
      await page.click('[data-testid="submit-answer"]');
      await page.waitForTimeout(500);
      
      if (i < 2) {
        await page.click('[data-testid="next-question"]');
      }
    }
    
    // Verify progress tracking
    await page.goto('/progress/comprehension');
    await expect(page.locator('[data-testid="accuracy-by-type"]')).toBeVisible();
  });

  test('should complete passage and unlock next level', async ({ page }) => {
    await page.goto('/activities/comprehension');
    
    // Complete all questions in passage
    await page.waitForSelector('[data-testid="comprehension-passage"]');
    
    for (let i = 0; i < 5; i++) {
      await page.waitForSelector('[data-testid="comprehension-question"]');
      await page.click('[data-testid="answer-option-correct"]');
      await page.click('[data-testid="submit-answer"]');
      await page.waitForTimeout(500);
      
      if (i < 4) {
        await page.click('[data-testid="next-question"]');
      }
    }
    
    await waitForCloudFunctionResponse(page);
    
    await expect(page.locator('[data-testid="passage-complete"]')).toBeVisible();
    await expect(page.locator('[data-testid="unlock-notification"]')).toBeVisible();
  });
});
