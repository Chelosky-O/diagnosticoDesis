<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Mi Página con PHP</title>
</head>
<body>
    <h1>¡Hola desde PHP!</h1>
    <?php
        echo "<p>La fecha y hora actual es: " . date("d/m/Y H:i:s") . "</p>";
    ?>

    <form method="POST" action="">
        <label>Nombre:</label>
        <input type="text" name="nombre" required>
        <button type="submit">Enviar</button>
    </form>

    <?php
    if ($_POST) {
        $nombre = htmlspecialchars($_POST['nombre']);
        echo "<h2>¡Hola, $nombre! Bienvenido.</h2>";
    }
    ?>
</body>
</html>