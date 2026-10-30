# Festival Lumen: Cartelera sin choques

Módulo en JavaScript que revisa una cartelera de cortometrajes antes de publicarla. Detecta códigos repetidos, compara dos estrategias de búsqueda por código (lineal y con `Map`) y lista las proyecciones de una misma sala que se solapan. Además imprime un análisis de complejidad basado en operaciones contadas.

## Requisitos

- Node.js (probado con v22). No requiere paquetes externos ni `npm install`.

## Ejecución

Desde la carpeta `festival-lumen`:

```bash
node src/cartelera.js
```

## Estructura

```
festival-lumen/
├── README.md
└── src/
    └── cartelera.js
```

## Formato de los datos

`proyecciones` es un arreglo de objetos con estos campos:

| Campo    | Tipo   | Significado y regla                                              |
|----------|--------|------------------------------------------------------------------|
| `codigo` | texto  | Identificador único en la entrada válida. Letras mayúsculas, guion y dos dígitos (p. ej. `AUR-01`). |
| `titulo` | texto  | Nombre del cortometraje. No participa en los cálculos.           |
| `sala`   | texto  | Identificador de la sala, por ejemplo `A` o `B`.                 |
| `inicio` | entero | Hora de inicio en minutos desde las 00:00.                       |
| `fin`    | entero | Hora de finalización en minutos desde las 00:00. Siempre mayor que `inicio`. |

La entrada válida tiene entre 1 y 12 proyecciones, sin códigos repetidos, con `inicio` y `fin` entre 0 y 1440. La entrada de demostración está en `src/cartelera.js`.

### Funciones

| Función | Qué devuelve |
|---------|--------------|
| `validarCodigos(proyecciones)` | `{ unicos, duplicados }`. `duplicados` lista cada código repetido una vez, en el orden de su segunda aparición. |
| `buscarProyeccionLineal(proyecciones, codigo)` | `{ indice, comparaciones }`. Recorre desde la primera posición. Si no existe, `indice` es `-1`. |
| `crearIndice(proyecciones)` | Un `Map` de código a índice original. |
| `buscarEnIndice(indice, codigo)` | El índice asociado, o `-1` si el código no existe. |
| `detectarChoques(proyecciones)` | Arreglo de `{ codigoA, codigoB, sala }` en orden de descubrimiento. Hay choque solo si la sala es la misma y `inicioA < finB` e `inicioB < finA`. |

Ninguna función ordena ni modifica el arreglo de entrada.

## Salida de la ejecución

Salida completa de `node src/cartelera.js` con la entrada de demostración:

```
=== Festival Lumen: Cartelera sin choques ===
n = 6 proyecciones (entrada de demostración)

C1 | Códigos únicos (entrada de demostración)
     obtenido: {"unicos":true,"duplicados":[]}
     esperado: {"unicos":true,"duplicados":[]}  -> OK
C2 | Código repetido [AUR-01, LUM-02, AUR-01]
     obtenido: {"unicos":false,"duplicados":["AUR-01"]}
     esperado: {"unicos":false,"duplicados":["AUR-01"]}  -> OK
C3 | Búsqueda lineal presente, código "LUM-02"
     obtenido: {"indice":1,"comparaciones":2}
     esperado: {"indice":1,"comparaciones":2}  -> OK
C4 | Búsqueda lineal ausente, código "ZZZ-99"
     obtenido: {"indice":-1,"comparaciones":6}
     esperado: {"indice":-1,"comparaciones":6}  -> OK
C5 | Búsqueda lineal de "AUR-01", "MAR-06", "ZZZ-99"
     obtenido: [0,5,-1]
     esperado: [0,5,-1]  -> OK
C5 | Búsqueda con Map de "AUR-01", "MAR-06", "ZZZ-99"
     obtenido: [0,5,-1]
     esperado: [0,5,-1]  -> OK
C6 | Choques de sala (entrada de demostración)
     obtenido: [{"codigoA":"AUR-01","codigoB":"LUM-02","sala":"A"},{"codigoA":"NUB-04","codigoB":"SOL-05","sala":"B"}]
     esperado: [{"codigoA":"AUR-01","codigoB":"LUM-02","sala":"A"},{"codigoA":"NUB-04","codigoB":"SOL-05","sala":"B"}]  -> OK
C7 | Límite de intervalos LUM-02 / RIV-03 (no debe aparecer)
     obtenido: false
     esperado: false  -> OK
C8 | Entrada sin proyecciones ([])
     obtenido: {"validacion":{"unicos":true,"duplicados":[]},"busquedaLineal":-1,"busquedaIndice":-1,"choques":[]}
     esperado: {"validacion":{"unicos":true,"duplicados":[]},"busquedaLineal":-1,"busquedaIndice":-1,"choques":[]}  -> OK

=== Índice Map ===
Array.from(indice.entries()):
[["AUR-01",0],["LUM-02",1],["RIV-03",2],["NUB-04",3],["SOL-05",4],["MAR-06",5]]

=== Comparación de estrategias (n y q) ===
n = 6, q = 3
Búsqueda lineal: 13 comparaciones para q consultas (modelo O(q × n)).
Índice Map: 6 inserciones para preparar (O(n)) + 3 consultas de costo promedio O(1) cada una (O(n + q)).

=== Análisis de detectarChoques ===
n = 6, pares evaluados = n * (n - 1) / 2 = 15
Choques encontrados: 2
Tiempo: O(n²). Espacio auxiliar: O(1), sin contar el arreglo de salida.

=== Pares evaluados para otros valores de n ===
n = 10 -> pares evaluados = 45
n = 100 -> pares evaluados = 4950
n = 1000 -> pares evaluados = 499500

Resultado: todos los casos C1 a C8 coinciden.
```

## Casos de prueba

| ID | Qué se prueba | Entrada o condición | Resultado esperado | Resultado obtenido |
|----|---------------|---------------------|--------------------|--------------------|
| C1 | Códigos únicos | Entrada de demostración | `unicos` es `true`; `duplicados` es `[]` | OK |
| C2 | Código repetido | `[AUR-01, LUM-02, AUR-01]` | `unicos` es `false`; `duplicados` es `["AUR-01"]` | OK |
| C3 | Búsqueda presente | Código `"LUM-02"` | `indice = 1`; `comparaciones = 2` | OK |
| C4 | Búsqueda ausente | Código `"ZZZ-99"` | `indice = -1`; `comparaciones = 6` | OK |
| C5 | Consulta con índice | Las tres consultas del contrato | Ambas estrategias devuelven `[0, 5, -1]` | OK |
| C6 | Choques de sala | Entrada de demostración | Exactamente `AUR-01/LUM-02` y `NUB-04/SOL-05` | OK |
| C7 | Límite de intervalos | `LUM-02` termina en 660 y `RIV-03` empieza en 660 | La pareja no aparece | OK |
| C8 | Entrada sin proyecciones | `[]` | `unicos = true`; búsquedas `-1`; choques `[]` | OK |

## Análisis

**Definiciones.** `n` es la cantidad de proyecciones del arreglo. `q` es la cantidad de consultas de código.

**Búsqueda lineal.** Tiempo en el peor caso O(n) y espacio auxiliar O(1). El mejor caso es `AUR-01`, que requiere 1 comparación. El peor caso es un código inexistente, como `ZZZ-99`, que requiere `n` comparaciones (6 en la demostración). Repetir la búsqueda lineal `q` veces cuesta O(q × n).

**Índice con `Map`.** La preparación recorre el arreglo una vez: tiempo O(n) y espacio auxiliar O(n). Cada consulta cuesta O(1) en promedio esperado. Las `q` consultas cuestan O(n + q) en el modelo promedio esperado. En la demostración, la preparación hizo 6 inserciones y las 3 consultas fueron 3 accesos al `Map`. Las dos fases se reportan por separado porque tienen costos distintos.

**Validación de códigos.** Usa un `Set` para reconocer valores ya vistos. Tiempo O(n) en promedio y espacio auxiliar O(n).

**Detección de choques.** Compara cada par de posiciones distintas una vez: `n * (n - 1) / 2` pares, con tiempo O(n²) y espacio auxiliar O(1) sin contar la salida. Para `n = 6` son 15 pares.

### Tabla de crecimiento de `detectarChoques`

| n | Pares evaluados |
|---|-----------------|
| 10 | 45 |
| 100 | 4 950 |
| 1 000 | 499 500 |

### Comparación entre búsqueda lineal repetida e índice

Para `q` consultas sobre `n` proyecciones:

- Búsqueda lineal repetida: O(q × n) comparaciones. No necesita memoria adicional.
- Índice con `Map`: O(n) para preparar, más O(1) promedio por consulta, es decir O(n + q). Necesita O(n) de memoria auxiliar para guardar el `Map`.

### Intercambio entre tiempo y memoria

El índice gasta memoria extra (O(n)) a cambio de consultas más rápidas cuando `q` es grande. Podría ser preferible conservar una estrategia sin índice cuando:

- La memoria es muy limitada o el arreglo es grande y se consulta poco.
- La cartelera cambia con frecuencia, porque el índice habría que reconstruirlo en cada cambio (O(n)).
- `q` es pequeño, de modo que el costo de preparar el índice no se recupera.

La búsqueda lineal es más simple y no necesita estructuras adicionales. Con pocas consultas sobre listas pequeñas, esa simplicidad suele compensar la diferencia de costo.
