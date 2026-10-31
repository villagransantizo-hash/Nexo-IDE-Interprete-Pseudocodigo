# Nexo IDE 5.0 — Intérprete educativo de pseudocódigo

Aplicación web educativa para aprender variables, expresiones, léxico, gramáticas independientes de contexto y análisis sintáctico. El proyecto usa **HTML, CSS y JavaScript puro**: no requiere servidor, internet ni librerías externas al usarlo. La interfaz está en español y admite tema claro y oscuro.

## Cómo abrirlo

1. Descomprimir el ZIP.
2. Abrir la carpeta `interprete_educativo`.
3. Abrir `index.html` en Chrome, Edge o Firefox.
4. Escoger un ejemplo del panel lateral o introducir un algoritmo. Usar **Ejecutar algoritmo** o **Ctrl+Enter**.
5. Abrir **Tipos de datos** desde el inspector o el botón bajo el editor. **Probar ejemplo** abre el algoritmo en una **pestaña nueva** sin sobrescribir tus archivos.
6. Abrir **Repetidores** o la pestaña **Ciclos** para consultar las tres estructuras repetitivas y probarlas.
7. Seleccionar **Nuevo algoritmo** (o el botón **+** junto a las pestañas) para crear otro archivo sin cerrar los anteriores.

Los comandos `Leer` solicitan la entrada mediante un cuadro de diálogo. Cada archivo abierto posee una pestaña independiente. La sesión y el código de las pestañas se conservan en el almacenamiento local cuando el navegador lo permite; **Exportar** o **Ctrl+S** descargan únicamente el archivo activo como `.pseudo`. La app permite importar varios archivos seleccionados a la vez.

## Tipos de datos disponibles

| Tipo canónico | Alias | Ejemplo de declaración | Valores admitidos |
|---|---|---|---|
| `Entero` | — | `Definir edad Como Entero` | `18`, `-4`, `25` |
| `Decimal` | `Real` | `Definir precio Como Decimal` | `12.75`, `0.5`, `3` |
| `Texto` | — | `Definir nombre Como Texto` | `"Ana"`, `"Hola mundo"` |
| `Logico` | `Booleano` | `Definir activo Como Logico` | `Verdadero`, `Falso` |
| `Caracter` | — | `Definir inicial Como Caracter` | `'A'`, `'Ñ'`, `'7'` |

**Alias:** `Real` y `Booleano` se normalizan internamente a `Decimal` y `Logico`. Las palabras reservadas distinguen mayúsculas/minúsculas; escribir `Logico`, sin tilde.

### Declaración de varias variables

```text
Inicio
Definir a, b, c Como Entero
a = 3
b = 4
c = a + b
Escribir "Total:", c
Fin
```

### Programa de ejemplo con los cinco tipos

```text
Inicio
Definir edad Como Entero
Definir promedio Como Decimal
Definir nombre Como Texto
Definir aprobado Como Logico
Definir grupo Como Caracter
edad = 19
promedio = 89.5
nombre = "Ana"
aprobado = Verdadero
grupo = 'A'
Escribir "Estudiante:", nombre
Escribir "Edad:", edad
Escribir "Promedio:", promedio
Escribir "Grupo:", grupo
Si aprobado Y promedio >= 60 Entonces
    Escribir "Estado: aprobado"
SiNo
    Escribir "Estado: pendiente"
FinSi
Fin
```

### Reglas de tipos y entrada

- Se requiere `Inicio` y `Fin`, una instrucción por línea y declarar las variables antes de usarlas. Las variables nuevas están sin inicializar; usarlas sin asignar produce error con número de línea.
- `Entero` acepta números enteros; `Decimal` acepta números enteros y decimales. El separador decimal es el **punto**.
- `Texto` es una cadena en comillas dobles (`"..."`), y `Caracter` es un símbolo en comillas simples (`'A'`). El contenido de un `Caracter` debe tener exactamente un carácter Unicode.
- `Logico` acepta las constantes `Verdadero`/`Falso`, comparaciones y operaciones `Y`, `O`, `No`.
- `Leer` convierte los datos al tipo declarado y valida que sean correctos. Para `Logico` se puede escribir `Verdadero` o `Falso` (sin importar mayúsculas en la entrada). Un `Caracter` de entrada debe contener exactamente un símbolo.
- En `Escribir` se admiten varias expresiones separadas por comas; la consola las muestra con un espacio entre ellas. El operador `+` concatena cadenas o suma números.
- La condición de `Si` debe producir un valor lógico. Se admiten condicionales anidados, incluido un `Si` sin `SiNo`.
- Operadores: `+ - * /`, `== != < > <= >=`, `Y O No`, paréntesis `(` `)`; `#` inicia un comentario.
- La precedencia, de mayor a menor, es: paréntesis, negativo unario y `No`, multiplicación/división, suma/resta, comparación, `Y`, `O`. Los operadores binarios son asociativos por la izquierda. `Y` y `O` usan cortocircuito.
- Los errores léxicos, sintácticos, uso de variables inexistentes, asignaciones incompatibles y división por cero se muestran con línea de origen.
- Los identificadores usan letras (incluidas letras españolas), guion bajo y números después del primer carácter. `Nombre` y `nombre` son variables diferentes.


## Repetidores / estructuras repetitivas (NUEVO)

Los tres ciclos pueden combinarse con `Si`, variables y expresiones; también se admiten **ciclos anidados**. Todas las palabras reservadas son sensibles a mayúsculas. El cuerpo empieza en la línea siguiente.

### 1. Para / FinPara

```text
Inicio
Definir i Como Entero
Para i = 1 Hasta 5 Hacer
    Escribir "Paso", i
FinPara
Fin
```

`Para` requiere una variable `Entero` o `Decimal` previamente declarada. Al comenzar asigna el valor inicial; el valor final y el paso se evalúan una vez antes de iterar. La comparación es inclusiva. Si se omite `Paso`, se utiliza `1`; se admiten pasos negativos para contar hacia atrás.

```text
Inicio
Definir i Como Entero
Para i = 5 Hasta 1 Paso -2 Hacer
    Escribir i
FinPara
Fin
```

**Salida:** `5`, `3`, `1`. El paso cero se rechaza, y si el contador es `Entero`, tanto el inicio como el paso deben ser enteros. El contador se incrementa después de ejecutar el cuerpo y conserva su último valor, incluso al salir del intervalo. Evita modificar manualmente la variable de control dentro del ciclo.

### 2. Mientras / FinMientras

```text
Inicio
Definir contador Como Entero
contador = 1
Mientras contador <= 3 Hacer
    Escribir contador
    contador = contador + 1
FinMientras
Fin
```

La condición debe dar `Verdadero` o `Falso`; se comprueba **antes** de cada repetición. Si es falsa inicialmente, el cuerpo no se ejecuta.

### 3. Repetir / Hasta Que

```text
Inicio
Definir intentos Como Entero
intentos = 0
Repetir
    intentos = intentos + 1
    Escribir "Intento", intentos
Hasta Que intentos == 3
Fin
```

El cuerpo se ejecuta **al menos una vez**. La condición se comprueba **al final** y el ciclo termina cuando se vuelve verdadera. Si la condición es falsa, continúa.

**Protección:** la ejecución se interrumpe tras un máximo de **10 000 instrucciones**. Este límite evita bloquear el navegador con ciclos infinitos; las ejecuciones largas pueden terminar con error, incluso si el algoritmo eventualmente finalizaría después de ese límite. No se incluye `Romper` ni `Continuar`.

## Pestañas y espacio de trabajo (NUEVO)

- **Nuevo algoritmo / + / Ctrl+N:** crea otra pestaña sin sustituir el código anterior.
- **Abrir archivo / Ctrl+O:** importa uno o varios archivos `.pseudo`, `.psc` o `.txt`, cada uno en una pestaña nueva (máximo 1 MB por archivo).
- **Cambiar de pestaña:** selección con clic, listado «Archivos abiertos» o **Ctrl+Tab**. Con **Ctrl+Shift+Tab** se vuelve a la pestaña anterior.
- **Renombrar:** doble clic sobre el nombre de una pestaña.
- **Cerrar:** botón **×** en la pestaña o **Ctrl+W**. Se solicita confirmación si el archivo tiene cambios que aún no se han exportado.
- **Guardar sesión:** los archivos abiertos y sus contenidos se guardan automáticamente en `localStorage`, sujeto a los permisos y límites del navegador; cerrar una pestaña la retira de esa sesión.
- **Exportar / Ctrl+S:** descarga el archivo *activo*. Es recomendable exportar los trabajos importantes para tener una copia independiente del navegador.
- **Biblioteca:** abrir un ejemplo crea una pestaña nueva. Es posible mantener hasta **30 pestañas** abiertas en una sesión.

Al ejecutar, analizar o exportar, la acción se aplica **solo a la pestaña activa**. No se ejecutan todos los archivos a la vez, ni se admiten importaciones o llamadas entre archivos.

## Características visuales

- Editor con resaltado de sintaxis, líneas numeradas, estado del cursor y sangría con Tab.
- Inspector con seis pestañas: Resumen, Tokens, Variables, **Tipos**, **Ciclos** y Sintaxis.
- Nuevo diccionario de tipos con fichas explicativas y botones para cargar ejemplos listos para ejecutar.
- Explorador lateral con **diez** algoritmos de práctica, incluidos los nuevos ciclos *Para*, *Mientras* y *Repetir*.
- Consola de resultados, informe de errores, tabla de variables y tabla de tokens.
- Ventanas de entrada interactiva, pestañas múltiples con apertura/importación/renombrado, exportación por archivo, guardado local, tema claro y oscuro, diseño responsive.

## Analizador léxico

Tokens reconocidos:

| Token | Patrón o regla |
|---|---|
| `KW` | Coincidencia exacta con palabras reservadas y constantes lógicas |
| `ID` | `[A-Za-z_ÁÉÍÓÚÜÑáéíóúüñ][A-Za-z_0-9ÁÉÍÓÚÜÑáéíóúüñ]*` |
| `NUMBER` | `\d+(?:\.\d+)?` |
| `STRING` | Texto entre comillas dobles y escapes permitidos |
| `CHAR` | Texto entre comillas simples (validación de longitud en el parser) |
| `SYM` | `+ - * / ( ) , = < > == != <= >=` |
| `NL` | Salto de línea |
| `EOF` | Fin de archivo |

El analizador usa expresiones regulares, reconoce operadores de dos caracteres antes que los de uno y registra la línea de cada token. Las cadenas permiten `\n`, escapar comillas y escapar barra invertida.

## Gramática independiente de contexto (GIC)

Símbolo inicial: `Programa`.

No terminales: `Programa`, `Bloque`, `Sentencia`, `SinoOpt`, `Ids`, `Tipo`, `PasoOpt`, `Expr`, `Disy`, `Conj`, `Comp`, `Suma`, `Prod`, `Unario`, `Prim`, `Args`, `ArgsTail`.

Terminales: `Inicio Fin Definir Como Entero Decimal Real Texto Logico Booleano Caracter Leer Escribir Si Entonces SiNo FinSi Para Hasta Paso Hacer FinPara Mientras FinMientras Repetir Que Verdadero Falso Y O No ID NUMBER STRING CHAR NL = , + - * / == != < > <= >= ( )`.

```bnf
Programa  -> NL* Inicio NL Bloque Fin NL*
Bloque    -> NL* (Sentencia NL NL*)*
Sentencia -> Definir Ids Como Tipo
           | ID = Expr
           | Leer ID
           | Escribir Args
           | Si Expr Entonces NL Bloque SinoOpt FinSi
           | Para ID '=' Expr Hasta Expr PasoOpt Hacer NL Bloque FinPara
           | Mientras Expr Hacer NL Bloque FinMientras
           | Repetir NL Bloque Hasta Que Expr
PasoOpt   -> Paso Expr | epsilon
Ids       -> ID (',' ID)*
Tipo      -> Entero | Decimal | Real | Texto | Logico | Booleano | Caracter
Args      -> Expr ArgsTail
ArgsTail  -> ',' Expr ArgsTail | epsilon
SinoOpt   -> SiNo NL Bloque | epsilon
Expr      -> Disy
Disy      -> Conj ('O' Conj)*
Conj      -> Comp ('Y' Comp)*
Comp      -> Suma (('==' | '!=' | '<' | '>' | '<=' | '>=') Suma)*
Suma      -> Prod (('+' | '-') Prod)*
Prod      -> Unario (('*' | '/') Unario)*
Unario    -> '-' Unario | 'No' Unario | Prim
Prim      -> NUMBER | STRING | CHAR | Verdadero | Falso | ID | '(' Expr ')'
```

La notación `*`, `|` y los paréntesis en estas producciones son una abreviatura EBNF para repeticiones y alternativas; cada repetición se puede expandir a producciones GIC puras. `NL*` permite líneas vacías. El parser implementado es descendente recursivo con precedencia de operadores, equivalente a estas producciones. Las reglas de declaraciones, tipos y longitudes se validan semánticamente.

### Cinco ejemplos válidos

1. `Inicio\nEscribir "Hola"\nFin`
2. `Inicio\nDefinir edad Como Entero\nedad = 19\nEscribir edad\nFin`
3. `Inicio\nDefinir nota Como Real\nnota = 80.5\nEscribir nota\nFin`
4. `Inicio\nDefinir listo Como Booleano\nlisto = Verdadero\nSi listo Entonces\nEscribir "Sí"\nFinSi\nFin`
5. `Inicio\nDefinir letra Como Caracter\nletra = 'Z'\nEscribir letra\nFin`

En estas líneas, `\n` representa un salto de línea real.

### Cinco ejemplos inválidos

1. `Inicio\nEscribir @\nFin` — símbolo desconocido.
2. `Inicio\nSi Verdadero\nEscribir "hola"\nFinSi\nFin` — falta `Entonces`.
3. `Inicio\nDefinir x Como Fecha\nFin` — `Fecha` no es un tipo admitido.
4. `Inicio\nDefinir letra Como Caracter\nletra = 'AB'\nFin` — literal `Caracter` con más de un símbolo.
5. `Inicio\nEscribir (1 + 2\nFin` — falta `)`.

## Pruebas

Para repetir las pruebas, con Node.js instalado (solo para tests):

```bash
node tests/run-tests.js
node tests/run-types-tests.js
node tests/run-loops-tests.js
```

- **10 pruebas originales obligatorias:** dos de aritmética, dos con entrada/salida, dos con condicionales, dos con errores léxicos/sintácticos y dos de errores de ejecución.
- **14 pruebas adicionales de tipos:** cinco tipos, alias, declaración múltiple, lógica, entrada de caracteres/booleanos, cortocircuito y errores de tipo.
- **20 pruebas nuevas de ciclos:** `Para`, `Mientras`, `Repetir`, anidamiento, condiciones verdaderas/falsas, pasos, entrada y errores.
- **10 verificaciones de navegador:** apertura, renombrado, ejecución, alternancia, persistencia simulada de sesión y atajos. Los resultados están en `tests/ui-results.md`.

Total del motor: **44/44 pruebas**. Cada conjunto tiene código, entradas, resultado esperado, obtenido y estado en `tests/results.*`, `tests/types-results.*` y `tests/loops-results.*`. Las verificaciones de interfaz se documentan por separado y fueron ejecutadas en un navegador Chromium de prueba.

## Archivos del proyecto

| Archivo | Uso |
|---|---|
| `index.html` | IDE, editor multiarchivo, pestañas de archivos y seis secciones del inspector |
| `style.css` | Apariencia profesional, panel de tipos, ciclos, pestañas y temas |
| `app.js` | Interacciones con editor, pestañas, persistencia, ejemplos, consola y paneles |
| `engine.js` | Tokenizador, parser y evaluador seguro con ciclos |
| `tests/` | Casos de prueba y resultados reproducibles |
| `ejemplos/` | Seis algoritmos `.pseudo` para importar en pestañas distintas |
| `Informe_Proyecto.pdf` | Informe actualizado con evidencia de 44 pruebas y nuevas capturas |
| `vista_tipos_datos.png` | Captura del inspector de tipos |
| `vista_ejecucion_tipos.png` | Captura de un programa con cinco tipos |
| `vista_tipos_movil.png` | Vista adaptada a celular |
| `vista_pestanas_v5.png` | Captura del espacio de trabajo con pestañas |
| `vista_ciclos_v5.png` | Captura del inspector de repetidores |
| `vista_movil_v5.png` | Nueva vista móvil |

## Seguridad y límites

Los programas son interpretados con tokens y un AST; no se usa `eval()`, `Function()`, ejecución de órdenes del sistema ni acceso al disco por el código introducido. Solo se admiten las instrucciones declaradas en la gramática. Existe un límite de 10 000 instrucciones para evitar ejecuciones descontroladas. No se incluyen funciones, fechas, arreglos, módulos compartidos entre pestañas ni estructuras complejas. Los únicos bucles implementados son `Para`, `Mientras` y `Repetir`.

## Repositorio GitHub

Publicar los archivos del proyecto en un repositorio de GitHub del equipo y colocar la URL real en el informe; se deja el campo **pendiente de publicación**.
