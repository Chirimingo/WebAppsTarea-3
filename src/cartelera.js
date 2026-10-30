"use strict";

/**
 * Festival Lumen - Cartelera sin choques: análisis de algoritmos.
 *
 * Ejecución: node src/cartelera.js  (desde la carpeta festival-lumen)
 * Sin dependencias externas. No modifica el arreglo de entrada.
 *
 * n = cantidad de proyecciones del arreglo.
 * q = cantidad de consultas de código.
 */

// ---------------------------------------------------------------------------
// Datos de demostración
// ---------------------------------------------------------------------------

const proyecciones = [
  { codigo: "AUR-01", titulo: "Aurora de papel", sala: "A", inicio: 540, fin: 600 },
  { codigo: "LUM-02", titulo: "Luz de patio", sala: "A", inicio: 590, fin: 660 },
  { codigo: "RIV-03", titulo: "Río breve", sala: "A", inicio: 660, fin: 720 },
  { codigo: "NUB-04", titulo: "Nubes quietas", sala: "B", inicio: 570, fin: 615 },
  { codigo: "SOL-05", titulo: "Sol de invierno", sala: "B", inicio: 600, fin: 690 },
  { codigo: "MAR-06", titulo: "Mar interior", sala: "A", inicio: 780, fin: 840 },
];

// ---------------------------------------------------------------------------
// 1. Validación de códigos
// Espacio auxiliar O(n): Set de códigos vistos y Set de duplicados ya reportados.
// Tiempo O(n) esperado: una pasada, con operaciones Set en promedio O(1).
// ---------------------------------------------------------------------------

function validarCodigos(proyecciones) {
  const vistos = new Set();
  const yaReportados = new Set();
  const duplicados = [];

  for (const proyeccion of proyecciones) {
    const codigo = proyeccion.codigo;
    if (vistos.has(codigo)) {
      // Se reporta una vez, en el momento de su segunda aparición.
      if (!yaReportados.has(codigo)) {
        yaReportados.add(codigo);
        duplicados.push(codigo);
      }
    } else {
      vistos.add(codigo);
    }
  }

  return { unicos: duplicados.length === 0, duplicados };
}

// ---------------------------------------------------------------------------
// 2. Búsqueda lineal instrumentada
// Tiempo peor caso O(n); espacio auxiliar O(1).
// Cada comparación codigo === proyeccion.codigo incrementa el contador una vez.
// ---------------------------------------------------------------------------

function buscarProyeccionLineal(proyecciones, codigo) {
  let comparaciones = 0;

  for (let i = 0; i < proyecciones.length; i++) {
    comparaciones++;
    if (codigo === proyecciones[i].codigo) {
      return { indice: i, comparaciones };
    }
  }

  return { indice: -1, comparaciones };
}

// ---------------------------------------------------------------------------
// 3. Índice por código con Map
// crearIndice: preparación O(n) en tiempo y O(n) en espacio auxiliar.
// buscarEnIndice: consulta O(1) en promedio esperado para Map.
// ---------------------------------------------------------------------------

function crearIndice(proyecciones) {
  const indice = new Map();
  for (let i = 0; i < proyecciones.length; i++) {
    indice.set(proyecciones[i].codigo, i);
  }
  return indice;
}

function buscarEnIndice(indice, codigo) {
  return indice.has(codigo) ? indice.get(codigo) : -1;
}

// ---------------------------------------------------------------------------
// 4. Detección de choques por comparación de pares
// Pares evaluados: n * (n - 1) / 2 -> tiempo O(n²); espacio auxiliar O(1)
// sin contar el arreglo de salida.
// ---------------------------------------------------------------------------

function detectarChoques(proyecciones) {
  const choques = [];
  const n = proyecciones.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = proyecciones[i];
      const b = proyecciones[j];
      // Intervalos abiertos en los extremos: terminar justo al empezar no es choque.
      if (a.sala === b.sala && a.inicio < b.fin && b.inicio < a.fin) {
        choques.push({ codigoA: a.codigo, codigoB: b.codigo, sala: a.sala });
      }
    }
  }

  return choques;
}

// Pares evaluados por detectarChoques para un n dado.
function paresEvaluados(n) {
  return (n * (n - 1)) / 2;
}

// ---------------------------------------------------------------------------
// Ejecución principal: casos C1 a C8 y comparación de estrategias
// ---------------------------------------------------------------------------

let fallos = 0;

function verificar(id, descripcion, obtenido, esperado) {
  const obtenidoTxt = JSON.stringify(obtenido);
  const esperadoTxt = JSON.stringify(esperado);
  const ok = obtenidoTxt === esperadoTxt;
  if (!ok) fallos++;
  console.log(`${id} | ${descripcion}`);
  console.log(`     obtenido: ${obtenidoTxt}`);
  console.log(`     esperado: ${esperadoTxt}  -> ${ok ? "OK" : "FALLA"}`);
}

function main() {
  const n = proyecciones.length;
  const codigosContrato = ["AUR-01", "MAR-06", "ZZZ-99"];
  const esperadoIndicesContrato = [0, 5, -1];

  console.log("=== Festival Lumen: Cartelera sin choques ===");
  console.log(`n = ${n} proyecciones (entrada de demostración)`);
  console.log("");

  // C1 - Códigos únicos
  verificar(
    "C1",
    "Códigos únicos (entrada de demostración)",
    validarCodigos(proyecciones),
    { unicos: true, duplicados: [] }
  );

  // C2 - Código repetido
  const entradaRepetida = ["AUR-01", "LUM-02", "AUR-01"].map((codigo) => ({ codigo }));
  verificar(
    "C2",
    "Código repetido [AUR-01, LUM-02, AUR-01]",
    validarCodigos(entradaRepetida),
    { unicos: false, duplicados: ["AUR-01"] }
  );

  // C3 - Búsqueda presente (lineal)
  verificar(
    "C3",
    'Búsqueda lineal presente, código "LUM-02"',
    buscarProyeccionLineal(proyecciones, "LUM-02"),
    { indice: 1, comparaciones: 2 }
  );

  // C4 - Búsqueda ausente (lineal)
  verificar(
    "C4",
    'Búsqueda lineal ausente, código "ZZZ-99"',
    buscarProyeccionLineal(proyecciones, "ZZZ-99"),
    { indice: -1, comparaciones: 6 }
  );

  // C5 - Consulta con índice: las tres consultas del contrato en ambas estrategias
  const indice = crearIndice(proyecciones);
  const indicesLineal = codigosContrato.map(
    (codigo) => buscarProyeccionLineal(proyecciones, codigo).indice
  );
  const indicesMap = codigosContrato.map((codigo) => buscarEnIndice(indice, codigo));
  verificar(
    "C5",
    'Búsqueda lineal de "AUR-01", "MAR-06", "ZZZ-99"',
    indicesLineal,
    esperadoIndicesContrato
  );
  verificar(
    "C5",
    'Búsqueda con Map de "AUR-01", "MAR-06", "ZZZ-99"',
    indicesMap,
    esperadoIndicesContrato
  );

  // C6 - Choques de sala
  const choques = detectarChoques(proyecciones);
  verificar(
    "C6",
    "Choques de sala (entrada de demostración)",
    choques,
    [
      { codigoA: "AUR-01", codigoB: "LUM-02", sala: "A" },
      { codigoA: "NUB-04", codigoB: "SOL-05", sala: "B" },
    ]
  );

  // C7 - Límite de intervalos: LUM-02 termina en 660 y RIV-03 empieza en 660
  const limiteEnChoques = choques.some(
    (c) => c.codigoA === "LUM-02" && c.codigoB === "RIV-03"
  );
  verificar("C7", "Límite de intervalos LUM-02 / RIV-03 (no debe aparecer)", limiteEnChoques, false);

  // C8 - Entrada sin proyecciones
  const vacio = [];
  verificar(
    "C8",
    "Entrada sin proyecciones ([])",
    {
      validacion: validarCodigos(vacio),
      busquedaLineal: buscarProyeccionLineal(vacio, "ZZZ-99").indice,
      busquedaIndice: buscarEnIndice(crearIndice(vacio), "ZZZ-99"),
      choques: detectarChoques(vacio),
    },
    {
      validacion: { unicos: true, duplicados: [] },
      busquedaLineal: -1,
      busquedaIndice: -1,
      choques: [],
    }
  );

  console.log("");
  console.log("=== Índice Map ===");
  console.log("Array.from(indice.entries()):");
  console.log(JSON.stringify(Array.from(indice.entries())));
  console.log("");

  // Comparación de estrategias: trabajo contable
  const q = codigosContrato.length;
  const comparacionesLineal = codigosContrato.reduce(
    (total, codigo) => total + buscarProyeccionLineal(proyecciones, codigo).comparaciones,
    0
  );
  console.log("=== Comparación de estrategias (n y q) ===");
  console.log(`n = ${n}, q = ${q}`);
  console.log(`Búsqueda lineal: ${comparacionesLineal} comparaciones para q consultas (modelo O(q × n)).`);
  console.log(`Índice Map: ${n} inserciones para preparar (O(n)) + ${q} consultas de costo promedio O(1) cada una (O(n + q)).`);
  console.log("");

  // Análisis de detección de choques
  console.log("=== Análisis de detectarChoques ===");
  console.log(`n = ${n}, pares evaluados = n * (n - 1) / 2 = ${paresEvaluados(n)}`);
  console.log(`Choques encontrados: ${choques.length}`);
  console.log("Tiempo: O(n²). Espacio auxiliar: O(1), sin contar el arreglo de salida.");
  console.log("");

  console.log("=== Pares evaluados para otros valores de n ===");
  for (const valor of [10, 100, 1000]) {
    console.log(`n = ${valor} -> pares evaluados = ${paresEvaluados(valor)}`);
  }
  console.log("");

  console.log(fallos === 0 ? "Resultado: todos los casos C1 a C8 coinciden." : `Resultado: ${fallos} caso(s) no coinciden.`);
}

if (require.main === module) {
  main();
}

module.exports = {
  proyecciones,
  validarCodigos,
  buscarProyeccionLineal,
  crearIndice,
  buscarEnIndice,
  detectarChoques,
};
