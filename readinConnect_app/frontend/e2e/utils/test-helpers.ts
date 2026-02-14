import { Page } from '@playwright/test';

export const TEST_USERS = {
  student: {
    email: 'test.student@example.com',
    password: 'TestPassword123!',
    role: 'student'
  },
  teacher: {
    email: 'test.teacher@example.com', 
    password: 'TestPassword123!',
    role: 'teacher'
  },
  parent: {
    email: 'test.parent@example.com',
    password: 'TestPassword123!',
    role: 'parent'
  }
};

export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/**/dashboard');
}

export async function logoutUser(page: Page) {
  await page.goto('/logout');
  await page.waitForURL('/login');
}

export async function waitForCloudFunctionResponse(page: Page, timeout = 10000) {
  await page.waitForFunction(() => {
    return document.body.innerText.includes('Success') || 
           document.body.innerText.includes('Error');
  }, { timeout });
}
