<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Configuración de la base de datos
$host = 'localhost';
$port = '5432';
$dbname = 'sistema_productos';
$username = 'user';
$password = '1234';

// Conectar a PostgreSQL
try {
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_bodegas':
        getBodegas($pdo);
        break;
    case 'get_sucursales':
        getSucursales($pdo);
        break;
    case 'get_monedas':
        getMonedas($pdo);
        break;
    case 'get_materiales':
        getMateriales($pdo);
        break;
    case 'check_codigo':
        checkCodigo($pdo);
        break;
    case 'save_product':
        saveProduct($pdo);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
        break;
}

function getBodegas($pdo) {
    try {
        $stmt = $pdo->query("SELECT id, nombre FROM bodegas ORDER BY nombre");
        $bodegas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $bodegas]);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function getSucursales($pdo) {
    $bodega_id = $_GET['bodega_id'] ?? '';
    
    if (empty($bodega_id)) {
        echo json_encode(['success' => false, 'message' => 'ID de bodega requerido']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT id, nombre FROM sucursales WHERE bodega_id = ? ORDER BY nombre");
        $stmt->execute([$bodega_id]);
        $sucursales = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $sucursales]);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function getMonedas($pdo) {
    try {
        $stmt = $pdo->query("SELECT id, codigo, nombre FROM monedas ORDER BY codigo");
        $monedas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $monedas]);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function getMateriales($pdo) {
    try {
        $stmt = $pdo->query("SELECT id, nombre FROM materiales ORDER BY nombre");
        $materiales = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode([
            'success' => true, 
            'data' => $materiales
        ]);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function checkCodigo($pdo) {
    $codigo = $_GET['codigo'] ?? '';
    
    if (empty($codigo)) {
        echo json_encode(['available' => false, 'message' => 'Código requerido']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM productos WHERE codigo = ?");
        $stmt->execute([$codigo]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $available = $result['count'] == 0;
        echo json_encode(['available' => $available]);
    } catch(PDOException $e) {
        echo json_encode(['available' => false, 'message' => $e->getMessage()]);
    }
}

function saveProduct($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        return;
    }

    $codigo = $_POST['codigo'] ?? '';
    $nombre = $_POST['nombre'] ?? '';
    $bodega_id = $_POST['bodega_id'] ?? '';
    $sucursal_id = $_POST['sucursal_id'] ?? '';
    $moneda_id = $_POST['moneda_id'] ?? '';
    $precio = $_POST['precio'] ?? '';
    $descripcion = $_POST['descripcion'] ?? '';
    $materiales = json_decode($_POST['materiales'] ?? '[]', true);
    
    if (empty($codigo) || empty($nombre) || empty($bodega_id) || empty($sucursal_id) || 
        empty($moneda_id) || empty($precio) || empty($descripcion) || count($materiales) < 2) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
        return;
    }
    
    if (!preg_match('/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{5,15}$/', $codigo)) {
        echo json_encode(['success' => false, 'message' => 'Formato de código inválido']);
        return;
    }
    
    if (!preg_match('/^\d+(\.\d{1,2})?$/', $precio) || floatval($precio) <= 0) {
        echo json_encode(['success' => false, 'message' => 'Formato de precio inválido']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM productos WHERE codigo = ?");
        $stmt->execute([$codigo]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result['count'] > 0) {
            echo json_encode(['success' => false, 'message' => 'El código del producto ya existe']);
            return;
        }
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error verificando código: ' . $e->getMessage()]);
        return;
    }
    
    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("
            INSERT INTO productos (codigo, nombre, bodega_id, sucursal_id, moneda_id, precio, descripcion) 
            VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id
        ");
        
        $stmt->execute([
            $codigo,
            $nombre,
            $bodega_id,
            $sucursal_id,
            $moneda_id,
            $precio,
            $descripcion
        ]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $producto_id = $result['id'];
        
        $stmt = $pdo->prepare("INSERT INTO producto_materiales (producto_id, material_id) VALUES (?, ?)");
        
        foreach ($materiales as $material_id) {
            $stmt->execute([$producto_id, $material_id]);
        }
        
        $pdo->commit();
        
        echo json_encode(['success' => true, 'message' => 'Producto guardado exitosamente', 'id' => $producto_id]);
        
    } catch(PDOException $e) {
        // Rollback (Por si pasa algun error)
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Error guardando producto: ' . $e->getMessage()]);
    }
}

?>