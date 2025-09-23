// Variables globales
let bodegas = [];
let sucursales = [];
let monedas = [];
let materiales = [];

document.addEventListener('DOMContentLoaded', function() {
    cargarDatosIniciales();
    configurarEventos();
});

function cargarDatosIniciales() {
    cargarBodegas();
    cargarMonedas();
    cargarMateriales();
}

function configurarEventos() {
    const form = document.getElementById('productForm');
    const bodegaSelect = document.getElementById('bodega');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validarFormulario()) {
            guardarProducto();
        }
    });
    
    //cambiar sucursales
    bodegaSelect.addEventListener('change', function() {
        const bodegaId = this.value;
        if (bodegaId) {
            cargarSucursales(bodegaId);
        } else {
            limpiarSucursales();
        }
    });
}

// Funciones cargar datos
function cargarBodegas() {
    fetch('api.php?action=get_bodegas')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                bodegas = data.data;
                llenarSelect('bodega', bodegas);
            }
        })
        .catch(error => console.error('Error cargando bodegas:', error));
}

function cargarSucursales(bodegaId) {
    fetch(`api.php?action=get_sucursales&bodega_id=${bodegaId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                sucursales = data.data;
                llenarSelect('sucursal', sucursales);
                document.getElementById('sucursal').disabled = false;
            }
        })
        .catch(error => console.error('Error cargando sucursales:', error));
}

function cargarMonedas() {
    fetch('api.php?action=get_monedas')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                monedas = data.data;
                llenarSelect('moneda', monedas);
            }
        })
        .catch(error => console.error('Error cargando monedas:', error));
}

function cargarMateriales() {
    fetch('api.php?action=get_materiales')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                materiales = data.data;
                crearCheckboxesMateriales(materiales);
            }
        })
        .catch(error => console.error('Error cargando materiales:', error));
}

// Funciones Auxiliares
function llenarSelect(selectId, datos) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Seleccione una opción</option>';
    
    datos.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.nombre || item.codigo + ' - ' + item.nombre;
        select.appendChild(option);
    });
}

function limpiarSucursales() {
    const sucursalSelect = document.getElementById('sucursal');
    sucursalSelect.innerHTML = '<option value="">Seleccione una sucursal</option>';
    sucursalSelect.disabled = true;
}

function crearCheckboxesMateriales(materiales) {
    const container = document.getElementById('materiales');
    container.innerHTML = '';
    
    materiales.forEach(material => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `material_${material.id}`;
        input.name = 'materiales[]';
        input.value = material.id;
        
        const label = document.createElement('label');
        label.setAttribute('for', `material_${material.id}`);
        label.textContent = material.nombre;
        
        div.appendChild(input);
        div.appendChild(label);
        container.appendChild(div);
    });
}

// Funciones de validación
function validarFormulario() {
    let esValido = true;
    
    if (!validarCodigo()) esValido = false;
    if (!validarNombre()) esValido = false;
    if (!validarBodega()) esValido = false;
    if (!validarSucursal()) esValido = false;
    if (!validarMoneda()) esValido = false;
    if (!validarPrecio()) esValido = false;
    if (!validarMateriales()) esValido = false;
    if (!validarDescripcion()) esValido = false;
    
    return esValido;
}

function validarCodigo() {
    const codigo = document.getElementById('codigo').value.trim();
    
    if (codigo === '') {
        alert('El código del producto no puede estar en blanco.');
        return false;
    }
    
    if (codigo.length < 5 || codigo.length > 15) {
        alert('El código del producto debe tener entre 5 y 15 caracteres.');
        return false;
    }
    
    // Regex: al menos una letra y un número, solo letras y números
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/;
    if (!regex.test(codigo)) {
        alert('El código del producto debe contener letras y números');
        return false;
    }
    
    return true;
}

function validarNombre() {
    const nombre = document.getElementById('nombre').value.trim();
    
    if (nombre === '') {
        alert('El nombre del producto no puede estar en blanco.');
        return false;
    }
    
    if (nombre.length < 2 || nombre.length > 50) {
        alert('El nombre del producto debe tener entre 2 y 50 caracteres.');
        return false;
    }
    
    return true;
}

function validarBodega() {
    const bodega = document.getElementById('bodega').value;
    
    if (bodega === '') {
        alert('Debe seleccionar una bodega.');
        return false;
    }
    
    return true;
}

function validarSucursal() {
    const sucursal = document.getElementById('sucursal').value;
    const bodega = document.getElementById('bodega').value;
    
    if (bodega && sucursal === '') {
        alert('Debe seleccionar una sucursal para la bodega seleccionada.');
        return false;
    }
    
    return true;
}

function validarMoneda() {
    const moneda = document.getElementById('moneda').value;
    
    if (moneda === '') {
        alert('Debe seleccionar una moneda para el producto.');
        return false;
    }
    
    return true;
}

function validarPrecio() {
    const precio = document.getElementById('precio').value.trim();
    
    if (precio === '') {
        alert('El precio del producto no puede estar en blanco.');
        return false;
    }
    
    // Regex para número positivo con hasta dos decimales
    const regex = /^\d+(\.\d{1,2})?$/;
    if (!regex.test(precio) || parseFloat(precio) <= 0) {
        alert('El precio del producto debe ser un número positivo con hasta dos decimales.');
        return false;
    }
    
    return true;
}

function validarMateriales() {
    const checkboxes = document.querySelectorAll('input[name="materiales[]"]:checked');
    
    if (checkboxes.length < 2) {
        alert('Debe seleccionar al menos dos materiales para el producto.');
        return false;
    }
    
    return true;
}

function validarDescripcion() {
    const descripcion = document.getElementById('descripcion').value.trim();
    
    if (descripcion === '') {
        alert('La descripción del producto no puede estar en blanco.');
        return false;
    }
    
    if (descripcion.length < 10 || descripcion.length > 1000) {
        alert('La descripción del producto debe tener entre 10 y 1000 caracteres.');
        return false;
    }
    
    return true;
}

// Función para guardar producto
function guardarProducto() {
    const formData = new FormData();
    
    formData.append('codigo', document.getElementById('codigo').value.trim());
    formData.append('nombre', document.getElementById('nombre').value.trim());
    formData.append('bodega_id', document.getElementById('bodega').value);
    formData.append('sucursal_id', document.getElementById('sucursal').value);
    formData.append('moneda_id', document.getElementById('moneda').value);
    formData.append('precio', document.getElementById('precio').value.trim());
    formData.append('descripcion', document.getElementById('descripcion').value.trim());
    
    // Obtener materiales seleccionados
    const materialesSeleccionados = [];
    const checkboxes = document.querySelectorAll('input[name="materiales[]"]:checked');
    checkboxes.forEach(checkbox => {
        materialesSeleccionados.push(checkbox.value);
    });
    formData.append('materiales', JSON.stringify(materialesSeleccionados));
    
    // Verificar unicidad del código antes de enviar
    verificarCodigoUnico(formData.get('codigo'), function(esUnico) {
        if (!esUnico) {
            alert('El código del producto ya está registrado.');
            return;
        }
        
        // Enviar datos por AJAX
        fetch('api.php?action=save_product', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Producto guardado exitosamente.');
                limpiarFormulario();
            } else {
                alert('Error al guardar el producto: ' + (data.message || 'Error desconocido'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error de conexión al guardar el producto.');
        });
    });
}

// Verificar unicidad del código
function verificarCodigoUnico(codigo, callback) {
    fetch(`api.php?action=check_codigo&codigo=${encodeURIComponent(codigo)}`)
        .then(response => response.json())
        .then(data => {
            callback(data.available);
        })
        .catch(error => {
            console.error('Error verificando código:', error);
            callback(false);
        });
}

// Limpiar formulario
function limpiarFormulario() {
    document.getElementById('productForm').reset();
    limpiarSucursales();
}