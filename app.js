import { guardarRecordatorioFirebase, getRecordatoriosFirebase, deleteRecordatorioFirebase, getRecordatorioFirebase } from "./firebase.js";

const db = new PouchDB("recordatorios");
// Selecciono los elementos
const inputTarea = document.querySelector("#tarea");
const inputTitulo = document.querySelector("#titulo");

const form = document.querySelector("form");

const listaRecordatorios = document.querySelector("#recordatorios");

let radioInput = document.querySelectorAll('#nuevoRecordatorio input[type="radio"]');


let radioDivTrue = document.querySelector(".divRadioTrue");

let radioDivFalse = document.querySelector(".divRadioFalse");

let recordatorios = [];

// Funcion que depende que radio pone se crea otro campo
let existingDiv = null;

let valorRadio = null;
const eventoRadios = (radios) => {

  radios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      // Elimina el div existente si hay uno
      if (existingDiv) {
        existingDiv.remove();
        existingDiv = null;
        valorRadio = false;
        return valorRadio;
      }

      if (e.target.value === "True") {
        // Crea un nuevo div
        let div = document.createElement("div");

        let p = document.createElement("p");
        p.innerText = "Inserte fecha límite";
        p.setAttribute("class", "mt-3");

        let fecha = document.createElement("input");
        fecha.setAttribute("type", "datetime-local");
        fecha.setAttribute("id", "datetime");
        fecha.setAttribute("name", "datetime");
        fecha.setAttribute("class", "form-control  mb-3");

        div.appendChild(p);
        div.appendChild(fecha);
        radioDivTrue.insertAdjacentElement("afterend", div);
        valorRadio = true;
        existingDiv = div;
        return valorRadio;
      }
    });
  });
}
// Funcion 1 - Leer los inputs y los pushea en array contactos
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  // Creamos recordatorio con los datos ingresados
  const idRandom = crypto.randomUUID();
  let fechaMax = document.getElementById("datetime")
    ? document.getElementById("datetime").value
    : "Sin fecha límite";
  const title = inputTitulo.value
  const body = inputTarea.value;
  const fecha = new Date().toLocaleDateString();
  const recordatorio = {
    fecha: fecha,
    fechaLimite: fechaMax ? fechaMax : "Sin fecha límite",
    title: title,
    body: body,
    importanceType: valorRadio ? "True" : "False",
  };
  // Añadimos recordatorio al firebase
  const id = await guardarRecordatorioFirebase(recordatorio);
  // Asignamos el mismo id de firebase para el indexed db
  recordatorio._id = id
  recordatorio.id = id
  // Añadimos recordatorio a indexed db
  db.put(recordatorio)
    .then((resp) => {
      console.log(resp);
      console.log(recordatorio)
    })
    .catch((error) => {
      console.error(error);
    });
  if (!recordatorio._id) {
    recordatorio._id = recordatorio.id;
  }
  recordatorios.push(recordatorio);
  // Vaciamos inout
  inputTarea.value = "";
  inputTitulo.value = "";
  radioInput.value = "";
  renderizarRecordatorios(recordatorios);

});
let btns;

// Funcion 2 - Recibe un array y los renderiza las notas
const renderizarRecordatorios = (lista) => {
  // Limpio el contenedor
  let html = ""
  listaRecordatorios.innerHTML = "";
  lista.forEach((recordatorio, index) => {
    html += `<li class="list-group-item" id="${recordatorio.id}" >
    <div class="d-flex justify-content-between align-items-center">
    <div class="content">

    <div>
    <p class="fw-bold style="color:grey">Fecha de creación</p>
    </div>
 

    <span>
    <i class="fa-solid fa-calendar"></i>
    ${recordatorio.fecha}
    </span>
    <br>
    `

    if (recordatorio.fechaLimite !== "Sin fecha límite") {
      html += `
      <div>
      <span class="d-block fw-bold">
    Fecha límite
      </span>
      <i class="fa-solid fa-calendar text-danger"></i>
      ${recordatorio.fechaLimite}
      </div>`
    }
    html += `<div>
    <span class="d-block fw-bold">
Titulo
    </span>
    ${recordatorio.title}
    </div></div>
    
    <div class="d-flex flex-column justify-content-end">
  
    <button id="${index}" data-id2="${recordatorio.id}" style="max-height:60px;" class=" btn btn-danger btn-delete" type="button">
    X
            </button>
            <button id="${recordatorio.id}" style="max-height:60px;margin-top:20px" class="btn azul" type="button"><i class="fa-solid fa-circle-down" style="color:white;" id="${recordatorio.id}"></i></button>
            
            </div>
            </li>`

      ;
  });

  listaRecordatorios.innerHTML = html
  let htmlCollection = document.querySelectorAll("#recordatorios > li .btn.azul");


  const array = Array.from(htmlCollection);

  // Agregar funcionalidad a los botones para ver la descripción
  array.forEach(btn => {
    btn.addEventListener("click", async (e) => {
      let id = e.target.id;

      let li = document.querySelector(`#recordatorios > li[id="${id}"]`);

      if (!li) {
        console.error(`No se encontró un <li> con data-id="${id}"`);
        return;
      }
      console.log(id);
      const foundDb = await db.get(id);

      let existingDiv2 = li.querySelector(".recordatorio-details");
        if (existingDiv2) {
     
        existingDiv2.remove();
      } else {
        if (foundDb.body) {

          let div = document.createElement("div");
          div.setAttribute("class", "recordatorio-details");

          let p = document.createElement("p");
          let p2 = document.createElement("p");
          p.innerText = "Descripción";
          p.setAttribute("class", "fw-bold");
          p.style.margin = "0px";

          p2.innerText = foundDb.body;

          div.appendChild(p);
          div.appendChild(p2);

          let doc = li.querySelector(".content");

          doc.appendChild(div);
        }
      }
    });
  });
  // Botones para eliminar recordatorios
  btns = document.querySelectorAll(".btn-delete");
  btns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.id;
      let id2 = e.target.dataset.id2;
      deleteRecordatorio(id, id2);

    });
  });
 
};

// Funcion 3 - Lee las notas del indexedDB
const getRecordatorios = async () => {
  try {
    let data_fb = await getRecordatoriosFirebase();

    data_fb.forEach(recordatorio => {
      console.log(recordatorio)
      recordatorio._id = recordatorio.id;
      db.put(recordatorio)
        .then((resp) => {
          console.log(resp);
        })
        .catch((error) => {
          console.error(error);
        });
    });

    const result = await db.allDocs({ include_docs: true, descending: true });

    let datosPouch = result.rows.map((row) => row.doc);

    // Combina los datos de Firebase y PouchDB en el array recordatorios
    recordatorios = data_fb;


    renderizarRecordatorios(recordatorios);
  } catch (error) {
    console.error(error);
  }
};

getRecordatorios();

// Funcion 4 - Elimina un Nota
const deleteRecordatorio = async (index, id2) => {
  try {
    let id = recordatorios[index]._id;
    console.log(id)
    await deleteRecordatorioFirebase(id2)
    await deleteObject(id);
    recordatorios.splice(index, 1);
    renderizarRecordatorios(recordatorios);
  } catch (error) {
    console.error(error);
  }
};

const deleteObject = async (recordatorio) => {
  let doc = await db.get(recordatorio);

  await db.remove(doc);
}

eventoRadios(radioInput);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
} else {
  titulo.innerText = 'Lamentablemente tu navegador no soporta está tecnología'
}