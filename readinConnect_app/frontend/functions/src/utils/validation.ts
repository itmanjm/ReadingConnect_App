import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const validateAuth = (context: any): string => {
  if (!context?.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }
  return context.auth.uid;
};

export const validateInput = <T extends Record<string, unknown>>(
  data: unknown,
  schema: Record<keyof T, string>
): T => {
  if (!data || typeof data !== 'object') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid input data'
    );
  }

  for (const [key, expectedType] of Object.entries(schema)) {
    const value = (data as any)[key];
    const actualType = Array.isArray(value) ? 'array' : typeof value;

    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'array': 'array'
    };

    if (actualType !== typeMap[expectedType]) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Invalid type for ${String(key)}: expected ${expectedType}, got ${actualType}`
      );
    }
  }

  return data as T;
};

export const sendFeedbackNotification = async (feedbackId: string, feedback: any): Promise<void> => {
  console.log(`New feedback submitted: ${feedbackId}`, feedback);
};
