// Importo las configuraciones

// import { dbPouch } from './app.js'
import { firebaseConfig } from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    getDoc,
    setDoc,
    deleteDoc,
    doc

} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";


//   Inicio de la app
const app = initializeApp(firebaseConfig);

//   Creo base de datos de la app
const db = getFirestore(app)
//   Creo las funciones
// Elimino un recordatorio segun id
export const deleteRecordatorioFirebase = async (id) => {


    await deleteDoc(doc(db, "recordatorio", id));
}
// Busco un documento segun el id
export const getRecordatorioFirebase = async (id) => {
    try {

        const docRef = doc(db, "recordatorio", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log(docSnap.data());
            return docSnap.data()
        } else {
            
            console.log("Documento Inexistente");
        }
        
    } catch (error) {
        console.log(error);
       
    }
}
export const guardarRecordatorioFirebase = async (recordatorio) => {
    try {
        const doc = await addDoc(collection(db, 'recordatorio'), recordatorio);

        return doc.id;
    } catch (error) {
        console.error(error);
    }
}
// Traemos recordatorios del firebase
export const getRecordatoriosFirebase = async () => {
    try {
        const querySnapShot = await getDocs(collection(db, 'recordatorio'));
        const data = [];
        querySnapShot.forEach(doc => {
            const { title, body, fecha, fechaLimite, importanceType, _id } = doc.data();
            data.push({
                _id: _id,
                id: doc.id,
                title,
                body,
                fecha,
                fechaLimite,
                importanceType,
            })

        });
        return data;
    } catch (error) {
        console.log(error)
    }

}