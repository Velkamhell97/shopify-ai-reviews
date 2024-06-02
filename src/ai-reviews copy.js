import { initializeApp } from "firebase/app";
import { getFirestore, getDoc, doc } from 'firebase/firestore/lite';

const firebaseConfig = {
  apiKey: "AIzaSyBfj1JWIPDwo4Fz7LKO1PhTKOIRI_MpzTs",
  authDomain: "shopify-reviews-422715.firebaseapp.com",
  projectId: "shopify-reviews-422715",
  storageBucket: "shopify-reviews-422715.appspot.com",
  messagingSenderId: "260432829218",
  appId: "1:260432829218:web:477853af8134c60439e37b"
};

const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);

async function getStoreInfo(shopId) {
  const docRef = doc(firestore, `stores/${shopId}`);
  
  const docSnap = await getDoc(docRef);

  if(!docSnap.exists()) {
    throw new Error("La tienda no se encuentra registrada.");
  }
  
  const { active } = docSnap.data();

  return { active };
}

async function getProductInfo(shopId, productId) {
  const docRef = doc(firestore, `stores/${shopId}/products/${productId}`);
  
  const docSnap = await getDoc(docRef);
  
  const { reviews } = docSnap.data() ?? {};

  const exists = docSnap.exists();

  return { exists, reviews };
}

window.getStoreInfo = getStoreInfo;
window.getProductInfo = getProductInfo;