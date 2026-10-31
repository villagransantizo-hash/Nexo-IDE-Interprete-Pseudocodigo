"""Generar informe con evidencias y resultados de Nexo IDE 5.0 (ReportLab)."""
from pathlib import Path
import json,html
from PIL import Image as PILImage
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Preformatted,PageBreak,Image,KeepTogether,Table,TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
BASE=Path(__file__).resolve().parent
REGULAR='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';MONO='/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf';BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
for name,path in [('Nexo',REGULAR),('NexoBold',BOLD),('NexoMono',MONO)]:pdfmetrics.registerFont(TTFont(name,path))
pdfmetrics.registerFontFamily('Nexo',normal='Nexo',bold='NexoBold')
navy=colors.HexColor('#12213b');primary=colors.HexColor('#5164c9');muted=colors.HexColor('#637389');pale=colors.HexColor('#eef1fc')
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='ReportCover',fontName='NexoBold',fontSize=23,leading=32,textColor=navy,spaceAfter=21))
styles.add(ParagraphStyle(name='ReportSubtitle',fontName='Nexo',fontSize=13,leading=20,textColor=primary,spaceAfter=12))
styles.add(ParagraphStyle(name='ReportBody',fontName='Nexo',fontSize=9,leading=14,spaceAfter=9,textColor=navy))
styles.add(ParagraphStyle(name='ReportHead',fontName='NexoBold',fontSize=14,leading=20,textColor=navy,spaceBefore=17,spaceAfter=10,keepWithNext=True))
styles.add(ParagraphStyle(name='ReportSubhead',fontName='NexoBold',fontSize=10,leading=15,textColor=primary,spaceBefore=11,spaceAfter=8,keepWithNext=True))
styles.add(ParagraphStyle(name='ReportCode',fontName='NexoMono',fontSize=7.1,leading=10.4,spaceAfter=10,backColor=colors.HexColor('#f5f7fc'),borderPadding=9))
styles.add(ParagraphStyle(name='ReportSmall',fontName='Nexo',fontSize=7.6,leading=11,spaceAfter=5,textColor=navy))
story=[]
def paragraph(t,small=False):story.append(Paragraph(t,styles['ReportSmall'] if small else styles['ReportBody']))
def heading(t):story.append(Paragraph(t,styles['ReportHead']))
def subhead(t):story.append(Paragraph(t,styles['ReportSubhead']))
def code(t):story.append(Preformatted(t,styles['ReportCode'],maxLineLength=90))
def img(fname,caption,max_height=10.5*cm):
    path=BASE/fname
    if not path.exists():return
    w,h=PILImage.open(path).size
    scale=min(16.5*cm/w,max_height/h)
    story.append(Paragraph(html.escape(caption),styles['ReportSubhead']))
    story.append(Image(str(path),width=w*scale,height=h*scale))
    story.append(Spacer(1,9))

def safe(s):return html.escape(str(s)).replace('\n','<br/>')

story.extend([Spacer(1,3.1*cm),Paragraph('NEXO IDE 5.0',styles['ReportCover']),Paragraph('Intérprete educativo de pseudocódigo',styles['ReportSubtitle']),Spacer(1,0.8*cm)])
paragraph('<b>Proyecto:</b> Desarrollo de un intérprete educativo de pseudocódigo')
paragraph('<b>Curso:</b> Autómatas y Lenguajes Formales')
paragraph('<b>Carrera:</b> Ingeniería en Sistemas de Información')
paragraph('<b>Institución:</b> ______________________________________________')
paragraph('<b>Equipo:</b> __________________________________________________')
paragraph('<b>Docente:</b> _________________________________________________')
paragraph('<b>Fecha:</b> octubre de 2026')
story.append(Spacer(1,2*cm))
paragraph('<b>Entrega:</b> Aplicación web local, código fuente, 44 casos de prueba y evidencias visuales.')
story.append(PageBreak())
heading('1. Introducción')
paragraph('Nexo IDE es una aplicación educativa que permite redactar, analizar y ejecutar algoritmos de pseudocódigo. Su propósito es facilitar la comprensión de variables, tipos de datos, expresiones, estructuras condicionales, clasificación de tokens y reglas gramaticales. La versión 5 añade tres ciclos (Para, Mientras y Repetir) y un espacio de trabajo multiarchivo con pestañas acumulativas, además del diccionario de tipos anterior.')
paragraph('El proyecto aplica expresiones regulares, reconocimiento léxico, gramática independiente de contexto, análisis sintáctico descendente recursivo y evaluación controlada de un árbol sintáctico abstracto. El pseudocódigo no se ejecuta como JavaScript y no se emplea eval().')
heading('2. Tecnologías y guía de ejecución')
paragraph('La interfaz utiliza HTML5, CSS3 y JavaScript puro; no necesita conexión a internet ni instalación. Para iniciar, abra index.html en un navegador. La biblioteca lateral ofrece diez programas y el inspector incorpora pestañas para Resumen, Tokens, Variables, Tipos, Ciclos y Sintaxis. Los archivos abiertos se conservan como pestañas independientes, con nuevo archivo, importación múltiple, renombrado, cierre y exportación del archivo activo. Node.js es opcional y solo se necesita para repetir las pruebas automatizadas.')
code('node tests/run-tests.js\nnode tests/run-types-tests.js\nnode tests/run-loops-tests.js')
heading('3. Nuevos tipos de datos disponibles')
types=[('Entero','18, -4','Números enteros'),('Decimal (Real)','12.75, 5','Números con o sin decimales'),('Texto','"Ana"','Cadenas entre comillas dobles'),('Logico (Booleano)','Verdadero, Falso','Valores booleanos'),('Caracter',"'A', 'Ñ'",'Un solo símbolo')]
rows=[[Paragraph('<b>Tipo</b>',styles['ReportSmall']),Paragraph('<b>Ejemplo</b>',styles['ReportSmall']),Paragraph('<b>Uso</b>',styles['ReportSmall'])]]
for ty,example,usage in types:rows.append([Paragraph(safe(ty),styles['ReportSmall']),Paragraph(safe(example),styles['ReportSmall']),Paragraph(safe(usage),styles['ReportSmall'])])
tbl=Table(rows,colWidths=[135,112,229],repeatRows=1,hAlign='LEFT')
tbl.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),pale),('LINEBELOW',(0,0),(-1,0),0.6,primary),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f8faff')]),('VALIGN',(0,0),(-1,-1),'TOP'),('BOTTOMPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),7)]))
story.append(tbl)
paragraph('También se aceptan declaraciones múltiples como Definir a, b Como Entero. Para condiciones se incluyen Y, O, No, Verdadero y Falso; Leer convierte los datos al tipo declarado y Escribir puede presentar varias expresiones separadas por comas.')
heading('4. Evidencias visuales del panel de tipos')
img('vista_tipos_datos.png','4.1. Panel de tipos de datos con ejemplos cargables',10.0*cm)
img('vista_ejecucion_tipos.png','4.2. Ejecución real de un programa con cinco tipos',10.0*cm)
img('vista_tipos_movil.png','4.3. Adaptación de la interfaz a pantalla móvil',9.0*cm)
img('vista_pestanas_v5.png','4.4. Espacio de trabajo con varias pestañas de algoritmos',9.0*cm)
img('vista_ciclos_v5.png','4.5. Inspector integrado de estructuras repetitivas',9.0*cm)
img('vista_movil_v5.png','4.6. Pestañas y ciclos en vista móvil',9.0*cm)
heading('5. Análisis léxico, gramática y sintaxis')
paragraph('Tokens admitidos: KW (palabras reservadas), ID (identificadores), NUMBER (números), STRING (texto), CHAR (carácter), SYM (símbolos), NL (salto de línea) y EOF (final del archivo). El lexer emplea expresiones regulares. El parser verifica declaraciones, asignaciones, entrada, salida, condicionales, ciclos Para/Mientras/Repetir, literales, paréntesis y precedencia.')
code('Programa  -> Inicio NL Bloque Fin\nBloque    -> (Sentencia NL)*\nSentencia -> Definir Ids Como Tipo | ID = Expr | Leer ID\n          | Escribir Args | Si Expr Entonces NL Bloque SinoOpt FinSi\n          | Para ID = Expr Hasta Expr PasoOpt Hacer NL Bloque FinPara\n          | Mientras Expr Hacer NL Bloque FinMientras\n          | Repetir NL Bloque Hasta Que Expr\nPasoOpt   -> Paso Expr | epsilon\nIds       -> ID (, ID)*\nTipo      -> Entero | Decimal | Real | Texto | Logico | Booleano | Caracter\nSinoOpt   -> SiNo NL Bloque | epsilon\nArgs      -> Expr (, Expr)*\nExpr      -> Expr O Expr | Expr Y Expr | Expr Comp Expr\n          | Expr + Expr | Expr - Expr | Expr * Expr | Expr / Expr\n          | - Expr | No Expr | (Expr) | NUMBER | STRING | CHAR\n          | ID | Verdadero | Falso')
paragraph('Símbolo inicial: Programa. Los no terminales son las categorías a la izquierda de las producciones, incluyendo Expr, Sentencia y Tipo. Los terminales son palabras reservadas, constantes, identificadores, signos y saltos de línea. La producción anterior es una notación abreviada legible; la desambiguación de expresiones se hace por precedencia, con gramática detallada en README.md. Las restricciones de valor y de declaración se verifican semánticamente.')
heading('6. Programa demostrativo')
code('Inicio\nDefinir edad Como Entero\nDefinir promedio Como Decimal\nDefinir nombre Como Texto\nDefinir aprobado Como Logico\nDefinir grupo Como Caracter\nedad = 19\npromedio = 89.5\nnombre = "Ana"\naprobado = Verdadero\ngrupo = \'A\'\nEscribir "Estudiante:", nombre\nSi aprobado Y promedio >= 60 Entonces\n    Escribir "Aprobada"\nSiNo\n    Escribir "Pendiente"\nFinSi\nFin')
heading('7. Las tres estructuras repetitivas')
paragraph('Para utiliza un contador numérico declarado previamente y admite un Paso opcional, que puede ser negativo. Mientras comprueba una condición antes de cada iteración. Repetir comprueba Hasta Que al final, de modo que el cuerpo se ejecuta al menos una vez. Todos los ciclos pueden anidarse y tienen un límite global de 10 000 instrucciones como medida preventiva.')
code('Inicio\nDefinir i Como Entero\nPara i = 1 Hasta 3 Hacer\n    Escribir i\nFinPara\nFin')
code('Mientras contador < 3 Hacer\n    contador = contador + 1\nFinMientras')
code('Repetir\n    intentos = intentos + 1\nHasta Que intentos == 3')
heading('8. Evidencia de las diez pruebas obligatorias')
paragraph('Los resultados siguientes provienen de ejecuciones reales del motor con Node.js. En cada caso se presenta código, entrada, resultado esperado, resultado obtenido y estado. Las evidencias en formato JSON/Markdown están incluidas en la carpeta tests/.')
original=json.loads((BASE/'tests/results.json').read_text())
extra=json.loads((BASE/'tests/types-results.json').read_text())
for r in original:
    content=[Paragraph(f"{r['id']} - {safe(r['category'])} - {r['status']}",styles['ReportSubhead']),Preformatted(r['code'],styles['ReportCode']),Paragraph('<b>Entrada:</b> '+(safe(', '.join(map(str,r['input']))) if r['input'] else 'Ninguna'),styles['ReportSmall']),Paragraph('<b>Esperado:</b> '+safe(r['expected']),styles['ReportSmall']),Paragraph('<b>Obtenido:</b> '+safe(r['obtained']),styles['ReportSmall'])]
    story.append(KeepTogether(content))
heading('9. Pruebas adicionales de tipos de datos')
paragraph('Se registraron catorce casos adicionales para comprobar los nuevos tipos, alias, declaración múltiple, entrada interactiva, lógica, cortocircuito y diagnósticos de errores.')
for r in extra:
    content=[Paragraph(f"{r['id']} - {safe(r['category'])} - {r['status']}",styles['ReportSubhead']),Preformatted(r['code'],styles['ReportCode']),Paragraph('<b>Entrada:</b> '+(safe(', '.join(map(str,r['input']))) if r['input'] else 'Ninguna'),styles['ReportSmall']),Paragraph('<b>Esperado:</b> '+safe(r['expected']),styles['ReportSmall']),Paragraph('<b>Obtenido:</b> '+safe(r['obtained']),styles['ReportSmall'])]
    story.append(KeepTogether(content))
heading('10. Pruebas de repetidores')
paragraph('Veinte casos de prueba adicionales ejecutados con el motor real comprueban Para, Mientras, Repetir, anidamiento, validaciones y límites. Cada registro incluye código, entradas y resultado esperado y obtenido.')
loops=json.loads((BASE/'tests/loops-results.json').read_text())
for r in loops:
    content=[Paragraph(f"{r['id']} - {safe(r['category'])} - {r['status']}",styles['ReportSubhead']),Preformatted(r['code'],styles['ReportCode']),Paragraph('<b>Entrada:</b> '+(safe(', '.join(map(str,r['input']))) if r['input'] else 'Ninguna'),styles['ReportSmall']),Paragraph('<b>Esperado:</b> '+safe(r['expected']),styles['ReportSmall']),Paragraph('<b>Obtenido:</b> '+safe(r['obtained']),styles['ReportSmall'])]
    story.append(KeepTogether(content))
heading('11. Resumen de resultados y pruebas de interfaz')

paragraph(f"Pruebas obligatorias aprobadas: <b>{sum(x['status']=='APROBADA' for x in original)}/{len(original)}</b>. Tipos de datos: <b>{sum(x['status']=='APROBADA' for x in extra)}/{len(extra)}</b>. Ciclos: <b>{sum(x['status']=='APROBADA' for x in loops)}/{len(loops)}</b>. Total del intérprete: <b>{sum(x['status']=='APROBADA' for x in original+extra+loops)}/{len(original+extra+loops)}</b>. Además, 10/10 comprobaciones de interfaz aprobaron en Chromium, incluyendo apertura de pestañas, renombrado, ejecución, atajos y restauración de una sesión de prueba.")
heading('12. Repositorio GitHub')
paragraph('<b>URL del repositorio:</b> PENDIENTE DE PUBLICACIÓN. El equipo debe crear el repositorio en su propia cuenta e insertar aquí el enlace verdadero. No se afirma que el código ya esté publicado.')
heading('13. Conclusiones')
paragraph('El analizador léxico y el parser formalizan las reglas del lenguaje, mientras que el AST permite ejecutar solamente instrucciones reconocidas. El sistema comprueba declaraciones, tipos y expresiones, y ofrece diagnósticos por línea que facilitan el aprendizaje. El nuevo panel de tipos permite consultar y practicar Entero, Decimal, Texto, Logico y Caracter. Los ciclos Para, Mientras y Repetir amplían el aprendizaje de control de flujo y el editor multiarchivo favorece la comparación de algoritmos sin perder contenido. Las cuarenta y cuatro pruebas automatizadas y diez comprobaciones de interfaz, junto con las capturas, documentan las funciones entregadas.')
output=BASE/'Informe_Proyecto.pdf'
doc=SimpleDocTemplate(str(output),pagesize=A4,topMargin=43,bottomMargin=46,leftMargin=45,rightMargin=45,title='Nexo IDE 5.0 - Informe del proyecto')
def footer(canvas,doc):
    canvas.setStrokeColor(colors.HexColor('#dee4ed'));canvas.line(45,34,550,34)
    canvas.setFont('Nexo',7.5);canvas.setFillColor(muted)
    canvas.drawString(45,23,'Nexo IDE 5.0   |   Intérprete educativo')
    canvas.drawRightString(548,23,f'Página {doc.page}')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
print(output)
