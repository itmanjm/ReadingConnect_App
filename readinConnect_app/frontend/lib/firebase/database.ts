/**
 * @deprecated This file was originally for Firebase Realtime Database.
 * ReadinConnect now uses Firestore exclusively.
 * Please import from '@/lib/firebase/firestore' or '@/lib/firebase/auth' instead.
 */

// Re-export Firestore for backward compatibility
export { db } from './firestore'

console.warn('DEPRECATED: @/lib/firebase/database is deprecated. Use @/lib/firebase/firestore instead.')
