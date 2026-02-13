import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, set } from 'firebase/compat/database'

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
})

const db = getDatabase(app)
const testRef = ref(db, 'test')

console.log('Database initialized:', db)
console.log('Test ref:', testRef)
console.log('getDatabase type:', typeof getDatabase)

set(testRef, { hello: 'world' })
  .then(() => {
    console.log('Write succeeded')
  })
  .catch((error) => {
    console.error('Write failed:', error)
  })
