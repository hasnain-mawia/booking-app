import { initializeApp } from "firebase/app";
import { collection, addDoc, getFirestore, query, onSnapshot, where } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA1ilJ5fHPBTuyGNy59ri153-lT9og3J7Q",
    authDomain: "firstapp-d0bc0.firebaseapp.com",
    databaseURL: "https://firstapp-d0bc0-default-rtdb.firebaseio.com",
    projectId: "firstapp-d0bc0",
    storageBucket: "firstapp-d0bc0.appspot.com",
    messagingSenderId: "117101917841",
    appId: "1:117101917841:web:d9cc91e457a56469af7130",
    measurementId: "G-2WNWJSJX1H"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const rideRequest = (ride) => {
    console.log('ride', ride)
    return addDoc(collection(db, "rides"), ride);
}

export {
    rideRequest,
    db,
    query,
    collection,
    onSnapshot,
    where,


}

