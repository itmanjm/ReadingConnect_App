import { test, expect } from '@playwright/test';
import { loginUser, TEST_USERS, waitForCloudFunctionResponse } from '../../utils/test-helpers';

test.describe('Achievement System - Badge Awarding', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, TEST_USERS.student.email, TEST_USERS.student.password);
  });

  test('should award First Steps badge on first activity completion', async ({ page }) => {
    await page.goto('/activities/phonics');
    
    await page.waitForSelector('[data-testid="phonics-activity"]');
    await page.click('[data-testid="option-correct"]');
    await page.click('[data-testid="submit-answer"]');
    
    await waitForCloudFunctionResponse(page, 15000);
    
    // Check for badge notification
    await expect(page.locator('[data-testid="badge-notification"]')).toContainText('First Steps');
  });

  test('should award Activity Enthusiast badge after 50 activities', async ({ page }) => {
    // Simulate completing 50 activities
    await page.evaluate(() => {
      (window as any).testCompleteMultipleActivities(50);
    });
    
    await waitForCloudFunctionResponse(page, 20000);
    
    await expect(page.locator('[data-testid="badge-unlocked"]')).toContainText('Activity Enthusiast');
  });

  test('should display earned badges on profile', async ({ page }) => {
    await page.goto('/profile');
    
    await page.waitForSelector('[data-testid="badges-section"]');
    
    await expect(page.locator('[data-testid="badge-list"]')).toBeVisible();
  });

  test('should show badge progress for unearned badges', async ({ page }) => {
    await page.goto('/profile/badges');
    
    await page.waitForSelector('[data-testid="badge-progress"]');
    
    // Check that progress is shown for activity badges
    const progressIndicators = page.locator('[data-testid="progress-indicator"]');
    await expect(progressIndicators.first()).toBeVisible();
  });
});

test.describe('Achievement System - Streak Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, TEST_USERS.student.email, TEST_USERS.student.password);
  });

  test('should track daily streak correctly', async ({ page }) => {
    await page.goto('/profile');
    
    await page.waitForSelector('[data-testid="streak-counter"]');
    
    const streakText = await page.locator('[data-testid="current-streak"]').textContent();
    expect(streakText).toMatch(/\d+ day/);
  });

  test('should award Week Warrior badge for 7-day streak', async ({ page }) => {
    // Simulate 7-day streak
    await page.evaluate(() => {
      (window as any).testSetStreak(7);
    });
    
    await waitForCloudFunctionResponse(page, 15000);
    
    await expect(page.locator('[data-testid="badge-notification"]')).toContainText('Week Warrior');
  });
});
