import * as admin from 'firebase-admin';

admin.initializeApp();

export * from './activities/processPhonicsAnswer';
export * from './activities/processSightWordAnswer';
export * from './activities/processFluencySession';
export * from './activities/processComprehensionAnswer';
export * from './mastery/checkPhaseUnlock';
export * from './badges';
export * from './teachers';
export * from './teachers/observations';
export * from './users/onSignup';
export * from './tts/generateTTS';

