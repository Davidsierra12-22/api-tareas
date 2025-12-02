// index.js

// 1. IMPORTAR EXPRESS
// Inicializa la aplicación Express
const express = require('express');
const app = express();
const port = 3000;

// 2. MIDDLEWARE Y DATOS (Paso 3)

// Middleware para parsear (analizar) el cuerpo de las peticiones entrantes
// en formato JSON. Es CRUCIAL para manejar datos de POST y PUT/PATCH.
app.use(express.json()); 

// Arreglo en memoria para almacenar las tareas (simula una base de datos)
let tareas = [
    { id: 1, titulo: "Configurar Servidor", descripcion: "Instalar y levantar Express", estado: "completada", pasos: ["npm init", "npm install express"] },
    { id: 2, titulo: "Implementar GET", descripcion: "Crear la ruta para obtener tareas", estado: "pendiente", pasos: ["app.get('/tareas', ...)"] },
    { id: 3, titulo: "Probar API", descripcion: "Usar Postman para todas las rutas", estado: "pendiente", pasos: [] }
];
// Contador para asignar un ID único incremental a las nuevas tareas
let nextId = 4;


// 3. IMPLEMENTACIÓN DE RUTAS (ENDPOINTS) (Paso 4)

// I. RUTAS GET (LECTURA)
// -----------------------------------------------------------

// 1. Obtener una lista de tareas (READ All)
app.get('/tareas', (req, res) => {
    // res.json() automáticamente establece el Content-Type a application/json
    res.json(tareas);
});

// 2. Obtener una tarea por nombre (READ by Title)
// Se usa un parámetro de ruta (:titulo)
app.get('/tareas/titulo/:titulo', (req, res) => {
    // Captura el valor del parámetro de ruta
    const tituloBuscado = req.params.titulo.toLowerCase();
    const tarea = tareas.find(t => t.titulo.toLowerCase() === tituloBuscado);

    if (tarea) {
        res.json(tarea);
    } else {
        // Código 404 Not Found
        res.status(404).json({ mensaje: 'Tarea no encontrada' });
    }
});

// 3 & 4. Obtener listado tareas pendientes / completadas (READ by Status)
// Se usa un parámetro de ruta (:estado)
app.get('/tareas/estado/:estado', (req, res) => {
    const estadoBuscado = req.params.estado.toLowerCase();
    
    // Validación de estados
    if (estadoBuscado !== 'pendiente' && estadoBuscado !== 'completada') {
        // Código 400 Bad Request
        return res.status(400).json({ mensaje: "Estado no válido. Use 'pendiente' o 'completada'." });
    }

    // Filtra las tareas que coinciden con el estado
    const tareasFiltradas = tareas.filter(t => t.estado.toLowerCase() === estadoBuscado);
    res.json(tareasFiltradas);
});


// II. RUTA POST (CREACIÓN)
// -----------------------------------------------------------

// 5. Agregar una nueva tarea (CREATE)
app.post('/tareas', (req, res) => {
    // req.body contiene los datos JSON enviados por el cliente
    const nuevaTareaData = req.body;
    
    // Validación de datos
    if (!nuevaTareaData.titulo || !nuevaTareaData.descripcion) {
        return res.status(400).json({ mensaje: 'El título y la descripción son obligatorios.' });
    }

    const nuevaTarea = {
        id: nextId++, // Asigna el ID y lo incrementa para la siguiente vez
        titulo: nuevaTareaData.titulo,
        descripcion: nuevaTareaData.descripcion,
        estado: nuevaTareaData.estado || "pendiente", // Valor por defecto
        pasos: nuevaTareaData.pasos || [] // Valor por defecto
    };

    tareas.push(nuevaTarea);
    
    // Código 201 Created: Respuesta estándar para creación exitosa.
    res.status(201).json(nuevaTarea);
});


// III. RUTAS PUT/PATCH (ACTUALIZACIÓN)
// -----------------------------------------------------------

// 6. Actualizar una tarea existente (UPDATE Full)
// Se usa un parámetro de ruta (:id) para buscar la tarea
app.put('/tareas/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = tareas.findIndex(t => t.id === id); // Busca el índice en el arreglo

    if (index !== -1) {
        const datosActualizados = req.body;
        
        // Reemplaza la tarea completa, manteniendo el ID
        tareas[index] = {
            id: id,
            titulo: datosActualizados.titulo || tareas[index].titulo,
            descripcion: datosActualizados.descripcion || tareas[index].descripcion,
            estado: datosActualizados.estado || tareas[index].estado,
            pasos: datosActualizados.pasos || tareas[index].pasos
        };
        
        res.json(tareas[index]);
    } else {
        res.status(404).json({ mensaje: 'Tarea no encontrada' });
    }
});

// 7. Actualizar el estado de una tarea (UPDATE Partial - Status)
// Se usa PATCH para una actualización parcial y el ID para buscar.
app.patch('/tareas/estado/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = tareas.findIndex(t => t.id === id);

    if (index !== -1) {
        const nuevoEstado = req.body.estado;
        
        if (!nuevoEstado || (nuevoEstado.toLowerCase() !== 'pendiente' && nuevoEstado.toLowerCase() !== 'completada')) {
            return res.status(400).json({ mensaje: "El estado debe ser 'pendiente' o 'completada'." });
        }

        // Actualización PARCIAL: Solo se modifica el estado
        tareas[index].estado = nuevoEstado.toLowerCase();
        res.json(tareas[index]);
    } else {
        res.status(404).json({ mensaje: 'Tarea no encontrada' });
    }
});


// IV. RUTA DELETE (ELIMINACIÓN)
// -----------------------------------------------------------

// 8. Eliminar una tarea especifica (DELETE)
app.delete('/tareas/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = tareas.length;
    
    // Crea un nuevo arreglo SIN la tarea con el ID especificado
    tareas = tareas.filter(t => t.id !== id);

    if (tareas.length < initialLength) {
        // Código 204 No Content: Éxito sin devolver cuerpo de respuesta
        res.status(204).send();
    } else {
        res.status(404).json({ mensaje: 'Tarea no encontrada' });
    }
});


// 4. INICIO DEL SERVIDOR (Paso 3)
// -----------------------------------------------------------
app.listen(port, () => {
  console.log(`API de Tareas escuchando en http://localhost:${port}`);
});