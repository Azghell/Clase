// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const runButton = document.getElementById('run-code');
    const saveButton = document.getElementById('save-file');
    const openFileInput = document.getElementById('open-file-input');
    const clearEditorsButton = document.getElementById('clear-editors');
    const exampleSelector = document.getElementById('example-selector');
    const livePreviewIframe = document.getElementById('live-preview');
    const consoleOutput = document.getElementById('console-output');
    const suggestionsWarningsPanel = document.getElementById('suggestions-warnings');

    // --- Inicialización de CodeMirror para cada editor ---
    const editorConfig = {
        lineNumbers: true, // Mostrar números de línea
        theme: 'dracula', // Tema oscuro
        autoCloseBrackets: true, // Cierre automático de paréntesis, corchetes, etc.
        matchBrackets: true, // Resaltar paréntesis coincidentes
        indentUnit: 4, // 4 espacios para la indentación
        tabSize: 4, // 4 espacios por tabulación
        indentWithTabs: false, // Usar espacios en lugar de tabulaciones
        lint: true, // Habilitar linting (requiere addons específicos, para JS lo haremos custom)
        extraKeys: { "Ctrl-Space": "autocomplete" } // Atajo para autocompletado
    };

    // Editores CodeMirror
    const htmlEditor = CodeMirror(document.getElementById('editor-html'), {
        ...editorConfig,
        mode: 'htmlmixed', // Modo para HTML con JS y CSS incrustados
        value: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Página Interactiva</title>
    <style>
        /* Aquí irá tu CSS */
    </style>
</head>
<body>
    <h1>¡Hola desde HTML!</h1>
    <p>Este es un párrafo de ejemplo.</p>
    <button id="myButton">Haz clic</button>

    <script>
        // Aquí irá tu JavaScript
    </script>
</body>
</html>`
    });

    const cssEditor = CodeMirror(document.getElementById('editor-css'), {
        ...editorConfig,
        mode: 'css',
        value: `body {
    font-family: 'Arial', sans-serif;
    background-color: #f0f0f0;
    color: #333;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    margin: 0;
}

h1 {
    color: #007bff;
    text-align: center;
}

button {
    background-color: #28a745;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #218838;
}`
    });

    const jsEditor = CodeMirror(document.getElementById('editor-js'), {
        ...editorConfig,
        mode: 'javascript',
        value: `// ¡Bienvenido a la consola de JavaScript!
// Puedes usar console.log() para ver mensajes aquí.

console.log("¡El script se está ejecutando!");

document.addEventListener('DOMContentLoaded', () => {
    const myButton = document.getElementById('myButton');
    if (myButton) {
        myButton.addEventListener('click', () => {
            console.log("¡Botón clicado!");
            // alert("¡Has hecho clic en el botón!"); // Usar alert() para demostración, pero preferir modales en apps reales.
        });
    }
});

// Ejemplo de función
function sumar(a, b) {
    return a + b;
}

console.log("5 + 3 =", sumar(5, 3));`
    });

    // Mapeo de editores por nombre de pestaña
    const editors = {
        html: htmlEditor,
        css: cssEditor,
        js: jsEditor
    };

    let activeTab = 'html'; // Pestaña activa por defecto

    // --- Funcionalidad de Pestañas ---
    function switchTab(tabName) {
        // Actualizar botones de pestaña
        tabButtons.forEach(button => {
            if (button.dataset.tab === tabName) {
                button.classList.add('active-tab');
            } else {
                button.classList.remove('active-tab');
            }
        });

        // Mostrar/ocultar contenido del editor
        tabContents.forEach(content => {
            if (content.id === `editor-${tabName}`) {
                content.classList.add('active-tab-content');
                editors[tabName].refresh(); // Importante para CodeMirror después de cambiar la visibilidad
            } else {
                content.classList.remove('active-tab-content');
            }
        });
        activeTab = tabName;
        updateSuggestionsWarnings(); // Actualizar sugerencias al cambiar de pestaña
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.tab);
        });
    });

    // Asegurarse de que el editor HTML se refresque al inicio
    switchTab(activeTab);
    htmlEditor.refresh(); // Refrescar el editor HTML después de la inicialización y activación de la pestaña

    // --- Funcionalidad de Ejecutar Código (Previsualización en Vivo) ---
    function runCode() {
        const htmlCode = htmlEditor.getValue();
        const cssCode = cssEditor.getValue();
        const jsCode = jsEditor.getValue();

        // Crear el contenido del iframe
        const iframeContent = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Previsualización</title>
                <style>${cssCode}</style>
            </head>
            <body>
                ${htmlCode}
                <script>
                    // Capturar console.log del iframe y enviarlo al padre
                    const originalConsoleLog = console.log;
                    const originalConsoleError = console.error;
                    const originalConsoleWarn = console.warn;

                    console.log = function(...args) {
                        parent.postMessage({ type: 'log', message: args.map(arg => {
                            if (typeof arg === 'object' && arg !== null) {
                                try { return JSON.stringify(arg, null, 2); }
                                catch (e) { return String(arg); }
                            }
                            return String(arg);
                        }).join(' ') }, '*');
                        originalConsoleLog.apply(console, args);
                    };

                    console.error = function(...args) {
                        parent.postMessage({ type: 'error', message: 'ERROR: ' + args.map(String).join(' ') }, '*');
                        originalConsoleError.apply(console, args);
                    };

                    console.warn = function(...args) {
                        parent.postMessage({ type: 'warn', message: 'ADVERTENCIA: ' + args.map(String).join(' ') }, '*');
                        originalConsoleWarn.apply(console, args);
                    };

                    // Ejecutar el código JavaScript del usuario
                    try {
                        // Usamos una IIFE (Immediately Invoked Function Expression) para aislar el scope
                        (function() {
                            ${jsCode}
                        })();
                    } catch (e) {
                        console.error("Error de ejecución en JS:", e.message);
                    }
                </script>
            </body>
            </html>
        `;

        // Cargar el contenido en el iframe
        livePreviewIframe.srcdoc = iframeContent;
        consoleOutput.textContent = ''; // Limpiar consola al ejecutar
    }

    runButton.addEventListener('click', runCode);

    // Escuchar mensajes del iframe para la consola
    window.addEventListener('message', (event) => {
        // Asegurarse de que el mensaje viene del iframe de previsualización
        if (event.source === livePreviewIframe.contentWindow && event.data && (event.data.type === 'log' || event.data.type === 'error' || event.data.type === 'warn')) {
            consoleOutput.textContent += event.data.message + '\n';
            consoleOutput.scrollTop = consoleOutput.scrollHeight; // Desplazar al final
        }
    });

    // --- Funcionalidad de Sugerencias/Advertencias (Linting Básico) ---
    function updateSuggestionsWarnings() {
        let messages = [];
        const currentEditor = editors[activeTab];
        const code = currentEditor.getValue();

        // Limpiar mensajes anteriores
        suggestionsWarningsPanel.textContent = '';

        // Sugerencias y advertencias básicas por lenguaje
        if (activeTab === 'html') {
            if (!code.includes('<!DOCTYPE html>')) {
                messages.push("Sugerencia: ¡No olvides el DOCTYPE al inicio de tu HTML!");
            }
            if (!code.includes('<meta name="viewport"')) {
                messages.push("Advertencia: Considera añadir <meta name='viewport'> para responsividad móvil.");
            }
            if (code.match(/<img[^>]*src=["']\s*["']/g)) {
                messages.push("Advertencia: Algunas etiquetas <img> tienen el atributo src vacío.");
            }
            if (!code.includes('<title>')) {
                messages.push("Sugerencia: Es buena práctica incluir una etiqueta <title> en el <head>.");
            }
        } else if (activeTab === 'css') {
            // Un chequeo muy básico para llaves sin cerrar o puntos y coma faltantes
            const openBraces = (code.match(/{/g) || []).length;
            const closeBraces = (code.match(/}/g) || []).length;
            if (openBraces !== closeBraces) {
                messages.push("Advertencia: Parece que hay llaves sin cerrar o extras en tu CSS.");
            }
            if (code.includes('width:') && !code.includes('%') && !code.includes('vw') && !code.includes('auto')) {
                messages.push("Sugerencia: Para diseño responsivo, considera usar unidades relativas (%, vw) o 'auto' para anchos.");
            }
            if (code.includes('float:')) {
                messages.push("Sugerencia: Para diseños modernos, prefiere Flexbox o Grid en lugar de 'float'.");
            }
        } else if (activeTab === 'js') {
            // Linting básico para JS (sin JSHint)
            if (code.includes('var ')) {
                messages.push("Sugerencia: Para código moderno, prefiere 'let' o 'const' en lugar de 'var'.");
            }
            if (code.includes('function(') && !code.includes('=>') && code.includes(') {') && !code.includes('async')) {
                messages.push("Sugerencia: Considera usar funciones flecha (=>) para una sintaxis más concisa si no necesitas 'this' contextual.");
            }
            if (code.includes('alert(') || code.includes('confirm(') || code.includes('prompt(')) {
                messages.push("Advertencia: Evita 'alert()', 'confirm()' o 'prompt()' en aplicaciones reales; usa modales personalizados para una mejor UX.");
            }
            if (code.includes('==') && !code.includes('===')) {
                messages.push("Sugerencia: Usa el operador de igualdad estricta (===) en lugar de (==) para evitar conversiones de tipo inesperadas.");
            }
            // Intento de detectar errores de sintaxis básicos con try-catch en eval (solo para fines de sugerencia)
            try {
                // Esto es solo para validar sintaxis, no para ejecutar el código completo aquí
                new Function(code);
            } catch (e) {
                messages.push(`Error de sintaxis JS: ${e.message}`);
            }
        }

        if (messages.length > 0) {
            suggestionsWarningsPanel.textContent = messages.join('\n');
        } else {
            suggestionsWarningsPanel.textContent = "¡Todo parece bien aquí! Sigue practicando.";
        }
    }

    // Actualizar sugerencias/advertencias cada vez que se escribe
    htmlEditor.on('change', updateSuggestionsWarnings);
    cssEditor.on('change', updateSuggestionsWarnings);
    jsEditor.on('change', updateSuggestionsWarnings);

    // --- Funcionalidad de Cargar Ejemplos ---
    const examples = {
        'html-basic': {
            html: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ejemplo HTML Básico</title>
</head>
<body>
    <h1>Mi Título Principal</h1>
    <p>Este es un párrafo de texto simple.</p>
    <a href="https://www.google.com" target="_blank">Ir a Google</a>
</body>
</html>`,
            css: `body {
    font-family: 'Verdana', sans-serif;
    background-color: #e0f7fa;
    color: #004d40;
    padding: 20px;
}
h1 {
    color: #00796b;
    text-align: center;
}
p {
    line-height: 1.8;
}
a {
    color: #0277bd;
    text-decoration: none;
    font-weight: bold;
}`,
            js: `console.log("Ejemplo HTML Básico cargado.");`
        },
        'html-list': {
            html: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lista de Compras</title>
</head>
<body>
    <h1>Lista de Compras</h1>
    <ul>
        <li>Manzanas</li>
        <li>Leche</li>
        <li>Pan</li>
        <li>Huevos</li>
    </ul>
    <ol>
        <li>Paso 1: Preparar ingredientes</li>
        <li>Paso 2: Mezclar</li>
        <li>Paso 3: Hornear</li>
    </ol>
</body>
</html>`,
            css: `body {
    font-family: 'Georgia', serif;
    background-color: #fffde7;
    color: #5d4037;
    padding: 20px;
}
h1 {
    color: #8d6e63;
    text-align: center;
}
ul, ol {
    background-color: #ffe0b2;
    padding: 20px;
    border-radius: 8px;
    margin: 20px auto;
    max-width: 400px;
}
li {
    margin-bottom: 8px;
}`,
            js: `console.log("Ejemplo de Lista HTML cargado.");`
        },
        'css-styles': {
            html: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estilos CSS Básicos</title>
</head>
<body>
    <div class="box red-box">Caja Roja</div>
    <div class="box blue-box">Caja Azul</div>
    <p class="styled-text">Este texto tiene un estilo especial.</p>
</body>
</html>`,
            css: `body {
    font-family: 'Roboto', sans-serif;
    background-color: #fce4ec;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 20px;
}
.box {
    width: 150px;
    height: 150px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    color: white;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.red-box {
    background-color: #e57373;
}
.blue-box {
    background-color: #64b5f6;
}
.styled-text {
    font-size: 20px;
    color: #424242;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
    border-bottom: 2px solid #ff8a65;
    padding-bottom: 5px;
}`,
            js: `console.log("Ejemplo de Estilos CSS Básicos cargado.");`
        },
        'css-layout': {
            html: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diseño Simple con Flexbox</title>
</head>
<body>
    <header>Header</header>
    <main>
        <nav>Navigation</nav>
        <section>Content Area</section>
    </main>
    <footer>Footer</footer>
</body>
</html>`,
            css: `body {
    font-family: 'Open Sans', sans-serif;
    margin: 0;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #e8f5e9;
}
header, footer {
    background-color: #4caf50;
    color: white;
    padding: 15px;
    text-align: center;
    font-weight: bold;
}
main {
    display: flex;
    flex-grow: 1;
    flex-direction: column; /* Por defecto para móvil */
}
nav {
    background-color: #a5d6a7;
    padding: 15px;
    text-align: center;
    min-width: 150px;
}
section {
    background-color: #c8e6c9;
    padding: 20px;
    flex-grow: 1;
}
@media (min-width: 768px) { /* Diseño para tablet y escritorio */
    main {
        flex-direction: row;
    }
    nav {
        flex-shrink: 0;
    }
}`,
            js: `console.log("Ejemplo de Diseño Simple con Flexbox cargado.");`
        },
        'js-hello': {
            html: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hola Mundo JS</title>
</head>
<body>
    <h1 id="greeting">Cargando...</h1>
    <button id="changeTextBtn">Cambiar Saludo</button>
</body>
</html>`,
            css: `body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #e3f2fd;
    color: #2196f3;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    margin: 0;
}
h1 {
    font-size: 2.5em;
    margin-bottom: 20px;
}
button {
    background-color: #1976d2;
    color: white;
    padding: 12px 25px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.1em;
    transition: background-color 0.3s ease, transform 0.2s ease;
}
button:hover {
    background-color: #1565c0;
    transform: translateY(-2px);
}`,
            js: `document.addEventListener('DOMContentLoaded', () => {
    const greetingElement = document.getElementById('greeting');
    const changeTextBtn = document.getElementById('changeTextBtn');
    let isSpanish = true;

    function updateGreeting() {
        if (isSpanish) {
            greetingElement.textContent = "¡Hola, Mundo!";
            console.log("Saludo en español.");
        } else {
            greetingElement.textContent = "Hello, World!";
            console.log("Greeting in English.");
        }
        isSpanish = !isSpanish; // Alternar idioma
    }

    // Establecer el saludo inicial
    updateGreeting();

    // Añadir evento al botón
    changeTextBtn.addEventListener('click', updateGreeting);
});

console.log("Script 'Hola Mundo JS' cargado.");`
        },
        'js-counter': {
            html: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contador JS</title>
</head>
<body>
    <h1>Contador Simple</h1>
    <p>Conteo: <span id="count">0</span></p>
    <button id="increaseBtn">Incrementar</button>
    <button id="decreaseBtn">Decrementar</button>
</body>
</html>`,
            css: `body {
    font-family: 'Consolas', monospace;
    background-color: #f3e5f5;
    color: #4a148c;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    margin: 0;
}
h1 {
    color: #6a1b9a;
    font-size: 2.2em;
}
p {
    font-size: 1.5em;
    margin-bottom: 25px;
}
span#count {
    font-weight: bold;
    color: #ab47bc;
}
button {
    background-color: #8e24aa;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    margin: 0 10px;
    transition: background-color 0.3s ease;
}
button:hover {
    background-color: #7b1fa2;
}`,
            js: `document.addEventListener('DOMContentLoaded', () => {
    let count = 0;
    const countSpan = document.getElementById('count');
    const increaseBtn = document.getElementById('increaseBtn');
    const decreaseBtn = document.getElementById('decreaseBtn');

    function updateCount() {
        countSpan.textContent = count;
        console.log("Conteo actual:", count);
    }

    increaseBtn.addEventListener('click', () => {
        count++;
        updateCount();
    });

    decreaseBtn.addEventListener('click', 