import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBxWCMO2jovFoO2p0bRtjObLG6Wm_BUh3A',
  authDomain: 'vue-blog-501c8.firebaseapp.com',
  projectId: 'vue-blog-501c8',
  storageBucket: 'vue-blog-501c8.firebasestorage.app',
  messagingSenderId: '453986197221',
  appId: '1:453986197221:web:822f170abbea04e29c7e0c',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
