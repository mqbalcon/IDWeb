// app.js 
const form = document.querySelector('#todo-form');
const list = document.querySelector('#todo-list');
const alertas = document.querySelector('#alertas');
const contador = document.querySelector('#contador');
let tareas = [];
let filtro = 'todas';

const guardar = () => localStorage.setItem('tareas', JSON.stringify(tareas));

const cargar = () => {
    try {
        return JSON.parse(localStorage.getItem('tareas')) || [];
    } catch {
        return [];
    }
};

const renderTareas = () => {
    list.innerHTML = '';
    const visibles = tareas.filter(({ completada }) =>
        filtro === 'todas' ||
        (filtro === 'pendientes' && !completada) ||
        (filtro === 'completadas' && completada)
    );

    visibles.forEach(({ id, titulo, curso, fechaEntrega, completada }) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';

        const texto = document.createElement('span');
        texto.textContent = `${titulo} - ${curso} (Entrega: ${fechaEntrega})`;
        if (completada) texto.classList.add('completada');

        const botones = document.createElement('div');
        botones.innerHTML = `
            <button class="btn btn-success btn-sm" data-accion="toggle" data-id="${id}">✔</button>
            <button class="btn btn-danger btn-sm" data-accion="eliminar" data-id="${id}">Eliminar</button>
        `;

        li.append(texto, botones);
        list.appendChild(li);
    });

    const hechas = tareas.reduce((total, t) => (t.completada ? total + 1 : total), 0);
    contador.textContent = `Total: ${tareas.length} | Pendientes: ${tareas.length - hechas} | Completadas: ${hechas}`;
};
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const titulo = form.titulo.value.trim();
    const curso = form.curso.value.trim();
    const fechaEntrega = form.fechaEntrega.value;
    const errores = [];

    if (!titulo || !curso || !fechaEntrega) {
        errores.push('Todos los campos son obligatorios.');
    } else if (new Date(fechaEntrega + 'T00:00') <= new Date()) {
        errores.push('La fecha de entrega debe ser posterior a la fecha actual.');
    }

    alertas.innerHTML = errores
        .map((msg) => `<div class="alert alert-danger">${msg}</div>`)
        .join('');
    if (errores.length) return;

    tareas.push({ id: Date.now(), titulo, curso, fechaEntrega, completada: false });
    guardar();
    form.reset();
    renderTareas();
});

list.addEventListener('click', (e) => {
    const { accion, id } = e.target.dataset;
    if (!accion) return;

    if (accion === 'toggle') {
        const tarea = tareas.find((t) => t.id === Number(id));       
        tareas = tareas.map((t) =>                                  
            t === tarea ? { ...t, completada: !t.completada } : t
        );
    } else if (accion === 'eliminar') {
        tareas = tareas.filter((t) => t.id !== Number(id));           
    }

    guardar();
    renderTareas();
});
document.querySelectorAll('[data-filtro]').forEach((btn) => {
    btn.addEventListener('click', () => {
        filtro = btn.dataset.filtro;
        renderTareas();
    });
});
document.addEventListener('DOMContentLoaded', () => {
    tareas = cargar();
    renderTareas();
});