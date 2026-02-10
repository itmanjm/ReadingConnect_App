import { getDatabase, ref, DatabaseReference, onValue, set, DatabaseReference as DatabaseReferenceType } from 'firebase/database'
import { getApp } from 'firebase/app'
import { auth } from './auth'

const app = getApp()
export const db = getDatabase(app)

console.log('Database: Firebase Realtime Database initialized')
console.log('Database: App:', app.name)
console.log('Database: Auth user:', auth.currentUser?.email)

export function getDbRef(path: string): DatabaseReference {
  return ref(db, path)
}

export function writeData<T>(ref: DatabaseReference, data: T): Promise<void> {
  return set(ref, data)
}

export function readData<T>(ref: DatabaseReference): Promise<T | null> {
  return new Promise((resolve, reject) => {
    onValue(ref, (snapshot) => {
      const data = snapshot.val() as T | null
      console.log('Database: Read from', ref.toString(), ':', data)
      resolve(data)
    }, (error) => {
      console.error('Database: Read error:', error)
      reject(error)
    })
  })
}

export function updateData<T>(ref: DatabaseReference, data: Partial<T>): Promise<void> {
  return new Promise((resolve, reject) => {
    set(ref, data)
      .then(() => {
        console.log('Database: Updated', ref.toString())
        resolve(undefined)
      })
      .catch((error) => {
        console.error('Database: Update error:', error)
        reject(error)
      })
  })
}
