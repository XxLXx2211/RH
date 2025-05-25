// Variables globales
let candidatos = [];
let editingId = null;

// Elementos del DOM
const candidatoForm = document.getElementById('candidatoForm');
const candidatosList = document.getElementById('candidatosList');
const loading = document.getElementById('loading');
const noResults = document.getElementById('noResults');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');

// Elementos de filtros simplificados
const filterSexo = document.getElementById('filterSexo');
const filterEdad = document.getElementById('filterEdad');
const filterEstatus = document.getElementById('filterEstatus');
const filterUbicacion = document.getElementById('filterUbicacion');
const filterZona = document.getElementById('filterZona');
const filterArea = document.getElementById('filterArea');
const searchInput = document.getElementById('searchInput');

// Botones
const applyFilters = document.getElementById('applyFilters');
const clearFilters = document.getElementById('clearFilters');
const refreshBtn = document.getElementById('refreshBtn');

// Modales
const viewModal = document.getElementById('viewModal');
const candidatoDetails = document.getElementById('candidatoDetails');
const closeViewModal = document.getElementById('closeViewModal');
const confirmModal = document.getElementById('confirmModal');
const confirmDelete = document.getElementById('confirmDelete');
const cancelDelete = document.getElementById('cancelDelete');
const notification = document.getElementById('notification');

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadCandidatos();
    setupEventListeners();
    setDefaultDate();
});

function setupEventListeners() {
    candidatoForm.addEventListener('submit', handleSubmit);
    applyFilters.addEventListener('click', applyFiltersHandler);
    clearFilters.addEventListener('click', clearFiltersHandler);
    refreshBtn.addEventListener('click', loadCandidatos);
    cancelBtn.addEventListener('click', cancelEdit);

    // Modal de vista
    closeViewModal.addEventListener('click', hideViewModal);
    viewModal.addEventListener('click', (e) => {
        if (e.target === viewModal) {
            hideViewModal();
        }
    });

    // Modal de confirmación
    confirmDelete.addEventListener('click', handleConfirmDelete);
    cancelDelete.addEventListener('click', hideConfirmModal);
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            hideConfirmModal();
        }
    });

    // Búsqueda en tiempo real
    searchInput.addEventListener('input', debounce(applyFiltersHandler, 500));

    // Filtros en tiempo real
    filterSexo.addEventListener('change', applyFiltersHandler);
    filterEdad.addEventListener('input', debounce(applyFiltersHandler, 500));
    filterEstatus.addEventListener('change', applyFiltersHandler);
    filterUbicacion.addEventListener('change', updateFilterZonas);
    filterZona.addEventListener('change', applyFiltersHandler);
    filterArea.addEventListener('change', applyFiltersHandler);

    // Event listeners para ubicación y zona
    document.getElementById('ubicacion').addEventListener('change', updateZonas);
    document.getElementById('zona_reside').addEventListener('change', handleZonaChange);
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fecha_contacto').value = today;
}

// Funciones de API
async function loadCandidatos(filters = {}) {
    try {
        showLoading(true);

        // Construir query string con filtros
        const queryParams = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
                queryParams.append(key, filters[key]);
            }
        });

        const url = `/api/candidatos${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            candidatos = data.candidatos;
            renderCandidatos(candidatos);
        } else {
            showNotification('Error al cargar candidatos: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function saveCandidato(candidatoData) {
    try {
        const url = editingId ? `/api/candidatos/${editingId}` : '/api/candidatos';
        const method = editingId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(candidatoData)
        });

        const data = await response.json();

        if (response.ok) {
            showNotification(data.message, 'success');
            resetForm();
            loadCandidatos();
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error.message, 'error');
    }
}

async function deleteCandidato(id) {
    try {
        const response = await fetch(`/api/candidatos/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            showNotification(data.message, 'success');
            loadCandidatos();
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error.message, 'error');
    }
}

// Funciones de UI
function renderCandidatos(candidatosToRender) {
    if (candidatosToRender.length === 0) {
        candidatosList.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    candidatosList.style.display = 'flex';
    noResults.style.display = 'none';

    candidatosList.innerHTML = candidatosToRender.map(candidato => `
        <div class="candidato-row">
            <div class="candidato-name">
                ${escapeHtml(candidato.nombres_apellidos)}
            </div>
            <div class="candidato-actions">
                <button class="btn-view" onclick="viewCandidato(${candidato.id})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    Ver
                </button>
                <button class="btn-edit" onclick="editCandidato(${candidato.id})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Editar
                </button>
                <button class="btn-delete" onclick="confirmDeleteCandidato(${candidato.id})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(candidatoForm);
    const candidatoData = {};

    // Recopilar todos los datos del formulario
    for (let [key, value] of formData.entries()) {
        candidatoData[key] = value.trim();
    }

    // Manejar el campo "zona_otro" - si se seleccionó "Otro", usar el valor del campo de texto
    if (candidatoData.zona_reside === 'Otro' && candidatoData.zona_otro) {
        candidatoData.zona_reside = candidatoData.zona_otro;
    }
    // Eliminar el campo zona_otro del objeto final
    delete candidatoData.zona_otro;

    // Convertir campos numéricos
    if (candidatoData.edad) candidatoData.edad = parseInt(candidatoData.edad);
    if (candidatoData.num_hijos) candidatoData.num_hijos = parseInt(candidatoData.num_hijos);
    if (candidatoData.expectativa_salarial) candidatoData.expectativa_salarial = parseFloat(candidatoData.expectativa_salarial);

    // Validaciones del lado del cliente
    if (!candidatoData.nombres_apellidos || !candidatoData.cedula || !candidatoData.sexo ||
        !candidatoData.edad || !candidatoData.canal_recepcion || !candidatoData.tipo_contacto ||
        !candidatoData.fecha_contacto || !candidatoData.estatus) {
        showNotification('Por favor completa todos los campos obligatorios (*)', 'error');
        return;
    }

    if (candidatoData.edad < 16 || candidatoData.edad > 80) {
        showNotification('La edad debe estar entre 16 y 80 años', 'error');
        return;
    }

    saveCandidato(candidatoData);
}

function editCandidato(id) {
    const candidato = candidatos.find(c => c.id === id);
    if (!candidato) return;

    // Llenar el formulario con los datos del candidato
    Object.keys(candidato).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.value = candidato[key] || '';
        }
    });

    // Actualizar las zonas basadas en la ubicación seleccionada
    if (candidato.ubicacion) {
        updateZonas();
        // Esperar un momento para que se actualicen las zonas y luego seleccionar la zona
        setTimeout(() => {
            const zonaSelect = document.getElementById('zona_reside');
            if (zonaSelect && candidato.zona_reside) {
                // Verificar si la zona existe en las opciones
                const zonaOption = Array.from(zonaSelect.options).find(option => option.value === candidato.zona_reside);
                if (zonaOption) {
                    zonaSelect.value = candidato.zona_reside;
                } else {
                    // Si no existe, seleccionar "Otro" y poner el valor en el campo de texto
                    zonaSelect.value = 'Otro';
                    handleZonaChange();
                    document.getElementById('zona_otro').value = candidato.zona_reside;
                }
            }
        }, 100);
    }

    // Cambiar el estado del formulario
    editingId = id;
    formTitle.textContent = '✏️ Editar Candidato';
    submitBtn.textContent = '💾 Actualizar Candidato';
    cancelBtn.style.display = 'inline-flex';

    // Scroll al formulario
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
    resetForm();
}

function resetForm() {
    candidatoForm.reset();
    editingId = null;
    formTitle.textContent = '📝 Agregar Nuevo Candidato';
    submitBtn.textContent = '💾 Guardar Candidato';
    cancelBtn.style.display = 'none';
    setDefaultDate();
}

// Función para ver candidato
function viewCandidato(id) {
    const candidato = candidatos.find(c => c.id === id);
    if (!candidato) return;

    candidatoDetails.innerHTML = `
        <div class="detail-section">
            <h4>👤 Información Personal</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Nombres y Apellidos</div>
                    <div class="detail-value">${escapeHtml(candidato.nombres_apellidos)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Cédula</div>
                    <div class="detail-value">${escapeHtml(candidato.cedula)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Sexo</div>
                    <div class="detail-value">${candidato.sexo}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Edad</div>
                    <div class="detail-value">${candidato.edad} años</div>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h4>📞 Información de Contacto</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Canal de Recepción</div>
                    <div class="detail-value">${escapeHtml(candidato.canal_recepcion)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Fuente</div>
                    <div class="detail-value">${candidato.fuente || 'No especificada'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Referido por</div>
                    <div class="detail-value">${candidato.referido || 'No especificado'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Tipo de Contacto</div>
                    <div class="detail-value">${escapeHtml(candidato.tipo_contacto)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Fecha de Contacto</div>
                    <div class="detail-value">${formatDate(candidato.fecha_contacto)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Teléfonos</div>
                    <div class="detail-value">${candidato.telefonos || 'No especificado'}</div>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h4>🎯 Proceso de Entrevista</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Citado a Entrevista</div>
                    <div class="detail-value">${candidato.citado_entrevista || 'No especificado'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Fecha de Entrevista</div>
                    <div class="detail-value">${candidato.fecha_entrevista ? formatDate(candidato.fecha_entrevista) : 'No especificada'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Entrevistador Telefónico</div>
                    <div class="detail-value">${candidato.entrevistador_telefonico || 'No especificado'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Entrevistador Presencial</div>
                    <div class="detail-value">${candidato.entrevistador_presencial || 'No especificado'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Solicitud de Empleo</div>
                    <div class="detail-value">${candidato.solicitud_empleo || 'No especificado'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Guía de Entrevista</div>
                    <div class="detail-value">${candidato.guia_entrevista || 'No especificado'}</div>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h4>📍 Información de Ubicación</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Ubicación</div>
                    <div class="detail-value">${candidato.ubicacion || 'No especificada'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Zona que Reside</div>
                    <div class="detail-value">${candidato.zona_reside || 'No especificada'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Dirección</div>
                    <div class="detail-value">${candidato.direccion || 'No especificada'}</div>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h4>💼 Información Profesional</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Área de Interés</div>
                    <div class="detail-value">${candidato.area_interes || 'No especificada'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Expectativa Salarial</div>
                    <div class="detail-value">${candidato.expectativa_salarial ? formatCurrency(candidato.expectativa_salarial) : 'No especificada'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Experiencia</div>
                    <div class="detail-value">${candidato.experiencia || 'No especificada'}</div>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h4>👨‍👩‍👧‍👦 Información Personal Adicional</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Número de Hijos</div>
                    <div class="detail-value">${candidato.num_hijos || 0}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Cuenta Bancaria</div>
                    <div class="detail-value">${candidato.cuenta_bancaria || 'No especificado'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Seguridad Bancaria</div>
                    <div class="detail-value">${candidato.seguridad_bancaria || 'No especificado'}</div>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h4>📊 Seguimiento y Estatus</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Estatus</div>
                    <div class="detail-value">
                        <span class="candidato-status status-${candidato.estatus.toLowerCase().replace(' ', '-').replace('ñ', 'n')}">${candidato.estatus}</span>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">PDS Asignado</div>
                    <div class="detail-value">${candidato.pds_asignado || 'No asignado'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Fecha de Registro</div>
                    <div class="detail-value">${formatDate(candidato.fecha_registro)}</div>
                </div>
            </div>
            ${candidato.comentarios ? `
                <div style="margin-top: 15px;">
                    <div class="detail-label">Comentarios</div>
                    <div class="detail-value">${escapeHtml(candidato.comentarios)}</div>
                </div>
            ` : ''}
        </div>
    `;

    showViewModal();
}

function confirmDeleteCandidato(id) {
    confirmDelete.dataset.candidatoId = id;
    showConfirmModal();
}

function handleConfirmDelete() {
    const id = parseInt(confirmDelete.dataset.candidatoId);
    deleteCandidato(id);
    hideConfirmModal();
}

function showViewModal() {
    viewModal.style.display = 'block';
}

function hideViewModal() {
    viewModal.style.display = 'none';
}

function showConfirmModal() {
    confirmModal.style.display = 'block';
}

function hideConfirmModal() {
    confirmModal.style.display = 'none';
}

// Funciones de filtros
function applyFiltersHandler() {
    const filters = {
        sexo: filterSexo.value,
        edad: filterEdad.value,
        estatus: filterEstatus.value,
        ubicacion: filterUbicacion.value,
        zona_reside: filterZona.value,
        area_interes: filterArea.value,
        search: searchInput.value
    };

    loadCandidatos(filters);
}

function clearFiltersHandler() {
    // Limpiar todos los filtros
    filterSexo.value = '';
    filterEdad.value = '';
    filterEstatus.value = '';
    filterUbicacion.value = '';
    filterZona.value = '';
    filterArea.value = '';
    searchInput.value = '';

    // Resetear zonas de filtro
    filterZona.innerHTML = '<option value="">Todas</option>';
    filterZona.disabled = false;

    // Cargar todos los candidatos
    loadCandidatos();
}

// Función para actualizar las zonas de filtro según la ubicación seleccionada
function updateFilterZonas() {
    const ubicacionSeleccionada = filterUbicacion.value;

    // Limpiar opciones actuales
    filterZona.innerHTML = '<option value="">Todas</option>';

    if (ubicacionSeleccionada) {
        if (ubicacionZonas[ubicacionSeleccionada]) {
            // Ubicación tiene zonas predefinidas
            ubicacionZonas[ubicacionSeleccionada].forEach(zona => {
                const option = document.createElement('option');
                option.value = zona;
                option.textContent = zona;
                filterZona.appendChild(option);
            });
        } else {
            // Ubicación sin zonas predefinidas - deshabilitar filtro de zona
            filterZona.innerHTML = '<option value="">No aplica (zona libre)</option>';
            filterZona.disabled = true;
        }
    } else {
        filterZona.disabled = false;
    }

    // Aplicar filtros después de actualizar las zonas
    applyFiltersHandler();
}

function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
    candidatosList.style.display = show ? 'none' : 'flex';
    noResults.style.display = 'none';
}

function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Funciones utilitarias
function escapeHtml(text) {
    if (!text) return '';
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

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Mapeo de ubicaciones y sus zonas
const ubicacionZonas = {
    "Caracas": ["Petare", "El Paraíso", "Propatria", "Junquito", "El Hatillo", "Caricuao", "Altagracia", "El Junquito", "Libertador", "Santa Rosalía", "Catia"],
    "Los Teques (Altos Mirandinos)": ["Los Teques Centro", "Carrizal", "San Antonio de los Altos", "El Jarillo"],
    "Valles del Tuy": ["Charallave", "Ocumare del Tuy", "Santa Teresa del Tuy", "Cúa"],
    "Barlovento": ["Higuerote", "Río Chico", "Caucagua", "Tacarigua"],
    "Guarenas-Guatire": ["Guarenas", "Guatire", "Araira"],
    "La Guaira (Litoral Central)": ["Catia La Mar", "Caraballeda", "Macuto", "Naiguatá", "Maiquetía"]
};

// Función para actualizar las zonas según la ubicación seleccionada
function updateZonas() {
    const ubicacionSelect = document.getElementById('ubicacion');
    const zonaSelect = document.getElementById('zona_reside');
    const zonaOtro = document.getElementById('zona_otro');

    const ubicacionSeleccionada = ubicacionSelect.value;

    if (!ubicacionSeleccionada) {
        // No hay ubicación seleccionada
        zonaSelect.innerHTML = '<option value="">Primero selecciona ubicación</option>';
        zonaSelect.disabled = true;
        zonaOtro.style.display = 'none';
        zonaOtro.required = false;
        return;
    }

    if (ubicacionZonas[ubicacionSeleccionada]) {
        // Ubicación tiene zonas predefinidas
        zonaSelect.innerHTML = '<option value="">Seleccionar zona</option>';

        // Agregar zonas específicas de la ubicación
        ubicacionZonas[ubicacionSeleccionada].forEach(zona => {
            const option = document.createElement('option');
            option.value = zona;
            option.textContent = zona;
            zonaSelect.appendChild(option);
        });

        // Agregar opción "Otro"
        const otroOption = document.createElement('option');
        otroOption.value = 'Otro';
        otroOption.textContent = 'Otro';
        zonaSelect.appendChild(otroOption);

        zonaSelect.disabled = false;
        zonaOtro.style.display = 'none';
        zonaOtro.required = false;
    } else {
        // Ubicación NO tiene zonas predefinidas - mostrar campo de texto directamente
        zonaSelect.innerHTML = '<option value="Otro">Escribir zona</option>';
        zonaSelect.value = 'Otro';
        zonaSelect.disabled = true;
        zonaOtro.style.display = 'block';
        zonaOtro.required = true;
        zonaOtro.placeholder = `Especificar zona de ${ubicacionSeleccionada}`;
    }
}

// Función para mostrar/ocultar campo de texto cuando se selecciona "Otro"
function handleZonaChange() {
    const zonaSelect = document.getElementById('zona_reside');
    const zonaOtro = document.getElementById('zona_otro');

    if (zonaSelect.value === 'Otro') {
        zonaOtro.style.display = 'block';
        zonaOtro.required = true;
    } else {
        zonaOtro.style.display = 'none';
        zonaOtro.required = false;
        zonaOtro.value = '';
    }
}
