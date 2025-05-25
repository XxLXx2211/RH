// Variables globales
let personas = [];
let editingId = null;

// Elementos del DOM
const personaForm = document.getElementById('personaForm');
const personasList = document.getElementById('personasList');
const searchInput = document.getElementById('searchInput');
const refreshBtn = document.getElementById('refreshBtn');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const loading = document.getElementById('loading');
const confirmModal = document.getElementById('confirmModal');
const confirmDelete = document.getElementById('confirmDelete');
const cancelDelete = document.getElementById('cancelDelete');
const notification = document.getElementById('notification');

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadPersonas();
    setupEventListeners();
});

function setupEventListeners() {
    personaForm.addEventListener('submit', handleSubmit);
    refreshBtn.addEventListener('click', loadPersonas);
    searchInput.addEventListener('input', filterPersonas);
    cancelBtn.addEventListener('click', cancelEdit);
    confirmDelete.addEventListener('click', handleConfirmDelete);
    cancelDelete.addEventListener('click', hideModal);
    
    // Cerrar modal al hacer clic fuera
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            hideModal();
        }
    });
}

// Funciones de API
async function loadPersonas() {
    try {
        showLoading(true);
        const response = await fetch('/api/personas');
        const data = await response.json();
        
        if (response.ok) {
            personas = data.personas;
            renderPersonas(personas);
        } else {
            showNotification('Error al cargar personas: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function savePersona(personaData) {
    try {
        const url = editingId ? `/api/personas/${editingId}` : '/api/personas';
        const method = editingId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(personaData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification(data.message, 'success');
            resetForm();
            loadPersonas();
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error.message, 'error');
    }
}

async function deletePersona(id) {
    try {
        const response = await fetch(`/api/personas/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification(data.message, 'success');
            loadPersonas();
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error.message, 'error');
    }
}

// Funciones de UI
function renderPersonas(personasToRender) {
    if (personasToRender.length === 0) {
        personasList.innerHTML = '<div class="loading">No se encontraron personas.</div>';
        return;
    }
    
    personasList.innerHTML = personasToRender.map(persona => `
        <div class="persona-card">
            <div class="persona-info">
                <h3>${escapeHtml(persona.nombre_completo)}</h3>
                <p><strong>Edad:</strong> ${persona.edad} años</p>
                <p><strong>Cédula:</strong> ${escapeHtml(persona.cedula)}</p>
                <p><strong>Teléfono:</strong> ${escapeHtml(persona.numero_telefono)}</p>
                <p><strong>Registrado:</strong> ${formatDate(persona.fecha_registro)}</p>
            </div>
            <div class="persona-actions">
                <button class="btn-edit" onclick="editPersona(${persona.id})">
                    ✏️ Editar
                </button>
                <button class="btn-delete" onclick="confirmDeletePersona(${persona.id})">
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(personaForm);
    const personaData = {
        nombre_completo: formData.get('nombre_completo').trim(),
        edad: parseInt(formData.get('edad')),
        cedula: formData.get('cedula').trim(),
        numero_telefono: formData.get('numero_telefono').trim()
    };
    
    // Validaciones del lado del cliente
    if (!personaData.nombre_completo || !personaData.cedula || !personaData.numero_telefono) {
        showNotification('Todos los campos son obligatorios', 'error');
        return;
    }
    
    if (personaData.edad < 0 || personaData.edad > 150) {
        showNotification('La edad debe estar entre 0 y 150 años', 'error');
        return;
    }
    
    savePersona(personaData);
}

function editPersona(id) {
    const persona = personas.find(p => p.id === id);
    if (!persona) return;
    
    // Llenar el formulario con los datos de la persona
    document.getElementById('nombre_completo').value = persona.nombre_completo;
    document.getElementById('edad').value = persona.edad;
    document.getElementById('cedula').value = persona.cedula;
    document.getElementById('numero_telefono').value = persona.numero_telefono;
    
    // Cambiar el estado del formulario
    editingId = id;
    submitBtn.textContent = 'Actualizar Persona';
    cancelBtn.style.display = 'inline-block';
    
    // Scroll al formulario
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
    resetForm();
}

function resetForm() {
    personaForm.reset();
    editingId = null;
    submitBtn.textContent = 'Agregar Persona';
    cancelBtn.style.display = 'none';
}

function confirmDeletePersona(id) {
    confirmDelete.dataset.personaId = id;
    showModal();
}

function handleConfirmDelete() {
    const id = parseInt(confirmDelete.dataset.personaId);
    deletePersona(id);
    hideModal();
}

function showModal() {
    confirmModal.style.display = 'block';
}

function hideModal() {
    confirmModal.style.display = 'none';
}

function filterPersonas() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderPersonas(personas);
        return;
    }
    
    const filteredPersonas = personas.filter(persona => 
        persona.nombre_completo.toLowerCase().includes(searchTerm) ||
        persona.cedula.toLowerCase().includes(searchTerm) ||
        persona.numero_telefono.toLowerCase().includes(searchTerm)
    );
    
    renderPersonas(filteredPersonas);
}

function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
    personasList.style.display = show ? 'none' : 'block';
}

function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Funciones utilitarias
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
