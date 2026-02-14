import { test, expect } from '@playwright/test';
import { loginUser, TEST_USERS, waitForCloudFunctionResponse } from '../../utils/test-helpers';

test.describe('Teacher Tools - Student Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, TEST_USERS.teacher.email, TEST_USERS.teacher.password);
  });

  test('should display teacher dashboard with student list', async ({ page }) => {
    await page.goto('/teacher/dashboard');
    
    await page.waitForSelector('[data-testid="teacher-dashboard"]');
    await page.waitForSelector('[data-testid="students-list"]');
    
    await expect(page.locator('[data-testid="student-count"]')).toBeVisible();
  });

  test('should assign student to teacher', async ({ page }) => {
    await page.goto('/teacher/students/assign');
    
    await page.waitForSelector('[data-testid="assign-student-form"]');
    
    await page.fill('[data-testid="student-email"]', 'new.student@example.com');
    await page.click('[data-testid="assign-button"]');
    
    await waitForCloudFunctionResponse(page);
    
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Student assigned');
  });

  test('should view student detailed progress', async ({ page }) => {
    await page.goto('/teacher/dashboard');
    
    await page.waitForSelector('[data-testid="students-list"]');
    await page.locator('[data-testid="view-progress-button"]').first().click();
    
    await page.waitForURL('/**/progress/*');
    
    await expect(page.locator('[data-testid="student-progress-detail"]')).toBeVisible();
    await expect(page.locator('[data-testid="phonics-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="sight-words-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="fluency-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="comprehension-progress"]')).toBeVisible();
  });
});

test.describe('Teacher Tools - Observations', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, TEST_USERS.teacher.email, TEST_USERS.teacher.password);
  });

  test('should create observation sheet for student', async ({ page }) => {
    await page.goto('/teacher/observations/new');
    
    await page.waitForSelector('[data-testid="observation-form"]');
    
    await page.fill('[data-testid="student-select"]', 'test-student-id');
    await page.fill('[data-testid="observation-notes"]', 'Student showing great improvement in phonics');
    await page.click('[data-testid="save-observation"]');
    
    await waitForCloudFunctionResponse(page);
    
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Observation saved');
  });

  test('should view observation sheets for a student', async ({ page }) => {
    await page.goto('/teacher/students/test-student-id/observations');
    
    await page.waitForSelector('[data-testid="observations-list"]');
    
    await expect(page.locator('[data-testid="observation-item"]').first()).toBeVisible();
  });

  test('should update existing observation', async ({ page }) => {
    await page.goto('/teacher/observations');
    
    await page.waitForSelector('[data-testid="observations-list"]');
    await page.locator('[data-testid="edit-observation"]').first().click();
    
    await page.waitForSelector('[data-testid="observation-form"]');
    await page.fill('[data-testid="observation-notes"]', 'Updated observation notes');
    await page.click('[data-testid="update-observation"]');
    
    await waitForCloudFunctionResponse(page);
    
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Observation updated');
  });
});
