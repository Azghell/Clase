// -------------------------------
// 1. Declaración de variables
// -------------------------------

// Variable numérica usando var
var numero = 10;

// Variable de cadena usando let
let texto = "Hola mundo";

// Variable booleana usando const
const esVerdadero = true;

console.log("Variables iniciales:");
console.log("numero =", numero);
console.log("texto =", texto);
console.log("esVerdadero =", esVerdadero);

// -------------------------------
// 2. Operaciones aritméticas
// -------------------------------
let suma = numero + 5;          // Suma
let resta = numero - 3;         // Resta
let multiplicacion = numero * 2; // Multiplicación
let division = numero / 2;      // División
let modulo = numero % 3;        // Módulo (resto de la división)

console.log("\nOperaciones aritméticas:");
console.log("Suma:", suma);
console.log("Resta:", resta);
console.log("Multiplicación:", multiplicacion);
console.log("División:", division);
console.log("Módulo:", modulo);

// -------------------------------
// 3. Operadores de asignación
// -------------------------------
let asignacion = 10;
asignacion += 5;  // Suma y asigna
console.log("\nAsignación con '+=':", asignacion);

asignacion -= 3;  // Resta y asigna
console.log("Asignación con '-=':", asignacion);

// -------------------------------
// 4. Comparaciones
// -------------------------------
let esMayor = numero > 5;      // Compara si numero es mayor que 5
let esIgual = numero === 10;   // Compara si numero es estrictamente igual a 10

console.log("\nComparaciones:");
console.log("¿numero > 5?", esMayor);
console.log("¿numero === 10?", esIgual);

// -------------------------------
// 5. Operador lógico
// -------------------------------
let logico = (numero > 5) && esVerdadero; // true si ambas condiciones son verdaderas
console.log("\nOperador lógico '&&':", logico);
