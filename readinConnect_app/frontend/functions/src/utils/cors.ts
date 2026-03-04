import * as functions from 'firebase-functions';

// CORS configuration for Cloud Functions
const corsConfig = {
  cors: {
    origin: [
      'https://readingconnect-lit.web.app',
      'https://readingconnect-lit.firebaseapp.com',
      'http://localhost:3000',
      'http://localhost:3001'
    ],
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
};

// Runtime options with CORS
export const runtimeOpts = {
  ...corsConfig,
  memory: '256MB' as const,
  timeoutSeconds: 30
};

export function onCallWithCors(
  handler: (data: any, context: functions.https.CallableContext) => Promise<any>
): functions.HttpsFunction {
  return functions.runWith(runtimeOpts).https.onCall(handler);
}
