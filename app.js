'use strict';
/** Nexo IDE: capa de interfaz, independiente del analizador e intérprete. */
const $=id=>document.getElementById(id);
const examples={
  welcome:'Inicio\nEscribir "¡Hola, mundo!"\nFin',
  math:'Inicio\nDefinir a Como Decimal\nDefinir b Como Decimal\na = 12\nb = (a + 8) / 4\nEscribir "El resultado es:"\nEscribir b\nFin',
  input:'Inicio\nDefinir nombre Como Texto\nDefinir edad Como Entero\nLeer nombre\nLeer edad\nEscribir "Hola, " + nombre\nSi edad >= 18 Entonces\n    Escribir "Mayor de edad"\nSiNo\n    Escribir "Menor de edad"\nFinSi\nFin',
  condition:'Inicio\nDefinir nota Como Decimal\nnota = 85\nSi nota >= 60 Entonces\n    Escribir "¡Has aprobado!"\nSiNo\n    Escribir "Debes seguir practicando"\nFinSi\nFin',
  alltypes:'Inicio\n# Todos los tipos admitidos\nDefinir edad Como Entero\nDefinir promedio Como Decimal\nDefinir nombre Como Texto\nDefinir aprobado Como Logico\nDefinir grupo Como Caracter\nedad = 19\npromedio = 89.5\nnombre = "Ana"\naprobado = Verdadero\ngrupo = \'A\'\nEscribir "Estudiante:", nombre\nEscribir "Edad:", edad\nEscribir "Promedio:", promedio\nEscribir "Grupo:", grupo\nSi aprobado Y promedio >= 60 Entonces\n    Escribir "Estado: aprobado"\nSiNo\n    Escribir "Estado: pendiente"\nFinSi\nFin',
  logic:'Inicio\nDefinir tieneBeca Como Booleano\nDefinir promedio Como Real\ntieneBeca = Verdadero\npromedio = 92.5\nSi tieneBeca Y No (promedio < 80) Entonces\n    Escribir "Mantiene la beca"\nSiNo\n    Escribir "No cumple requisitos"\nFinSi\nFin',
  character:'Inicio\nDefinir inicial Como Caracter\nDefinir nombre Como Texto\ninicial = \'M\'\nnombre = "María"\nEscribir "Inicial:", inicial\nEscribir "Nombre:", nombre\nFin',
  for:'Inicio\nDefinir i Como Entero\nEscribir "Tabla del 3"\nPara i = 1 Hasta 5 Hacer\n    Escribir "3 x", i, "=", 3 * i\nFinPara\nFin',
  while:'Inicio\nDefinir contador Como Entero\ncontador = 1\nMientras contador <= 5 Hacer\n    Escribir "Vuelta:", contador\n    contador = contador + 1\nFinMientras\nFin',
  repeat:'Inicio\nDefinir intentos Como Entero\nintentos = 0\nRepetir\n    intentos = intentos + 1\n    Escribir "Intento", intentos\nHasta Que intentos == 3\nFin'
};
const typePrograms={
  entero:'Inicio\nDefinir alumnos Como Entero\nalumnos = 25\nEscribir "Alumnos:", alumnos\nFin',
  decimal:'Inicio\nDefinir nota Como Decimal\nnota = 82.5\nEscribir "Calificación:", nota\nFin',
  texto:'Inicio\nDefinir nombre Como Texto\nnombre = "Ana"\nEscribir "Hola, " + nombre\nFin',
  logico:'Inicio\nDefinir activo Como Logico\nactivo = Verdadero\nSi activo Entonces\n    Escribir "El sistema está activo"\nSiNo\n    Escribir "Desactivado"\nFinSi\nFin',
  caracter:'Inicio\nDefinir letra Como Caracter\nletra = \'A\'\nEscribir "La letra es:", letra\nFin'
};
const defaultCode=$('source').value;
const editor=$('source');
let currentExample=null,activeInspect='overview',errorLine=null,isRunning=false,modified=false;
const LEGACY_STORAGE_KEY='nexo-ide-pseudocodigo-v4';
const WORKSPACE_KEY='nexo-ide-workspace-v5';
let documents=[],activeDocId=null,nextDocId=0;
const THEME_KEY='nexo-ide-theme-v3';
const WORDS='Inicio|Fin|Definir|Como|Entero|Decimal|Texto|Logico|Caracter|Booleano|Real|Verdadero|Falso|Y|O|No|Leer|Escribir|Si|Entonces|SiNo|FinSi|Para|Hasta|Paso|Hacer|FinPara|Mientras|FinMientras|Repetir|Que';
const pattern=new RegExp(`(#[^\\n]*|"(?:\\\\.|[^"\\\\\\n])*"?|\\'(?:\\\\.|[^\\'\\\\\\n])*\\'?|\\b(?:${WORDS})\\b|\\b\\d+(?:\\.\\d+)?\\b|(?:>=|<=|==|!=|[+*/=<>,-]))`,'g');
function escapeHtml(s){return s.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function markToken(token){let cls=token[0]==='#'?'syntax-comment':(token[0]==='"'||token[0]==="'")?'syntax-string':/^\d/.test(token)?'syntax-number':new RegExp(`^(?:${WORDS})$`).test(token)?'syntax-key':'syntax-operator';return `<span class="${cls}">${escapeHtml(token)}</span>`;}
function highlight(){const src=editor.value;let html='',last=0;pattern.lastIndex=0;for(const m of src.matchAll(pattern)){const i=m.index;html+=escapeHtml(src.slice(last,i))+markToken(m[0]);last=i+m[0].length;}html+=escapeHtml(src.slice(last));$('highlight-code').innerHTML=html+'\n';syncScroll();}
function activePosition(){const p=editor.selectionStart,text=editor.value.slice(0,p),line=text.split('\n').length,column=text.length-text.lastIndexOf('\n');return {line,column};}
function updateGutter(){const n=editor.value.split('\n').length;const loc=activePosition();$('lines').innerHTML=Array.from({length:n},(_,i)=>`<span class="${i+1===loc.line?'active-line-number ':''}${i+1===errorLine?'number-error':''}">${i+1}</span>`).join('\n');$('line-count').textContent=n+' '+(n===1?'línea':'líneas');$('stat-lines').textContent=n;$('cursor-position').textContent=`Ln ${loc.line}, Col ${loc.column}`;}
function syncScroll(){const y=editor.scrollTop,x=editor.scrollLeft;$('highlight-code').style.transform=`translate(${-x}px,${-y}px)`;$('lines').style.transform=`translateY(${-y}px)`;let line=activePosition().line;const row= $('highlight-lines');const position=18+(line-1)*25-y;const err=errorLine==null?-1000:18+(errorLine-1)*25-y;row.innerHTML=`<span class="active-row" style="top:${position}px"></span>${errorLine==null?'':`<span class="active-row error-row" style="top:${err}px"></span>`}`;}
function activeDoc(){return documents.find(d=>d.id===activeDocId)||null;}
function persistWorkspace(){try{localStorage.setItem(WORKSPACE_KEY,JSON.stringify({documents,activeDocId,nextDocId}));$('save-label').textContent='Sesión guardada localmente';}catch{$('save-label').textContent='Espacio lleno: exporta tus archivos';}}
function saveCurrentDoc(){const d=activeDoc();if(!d)return;d.code=editor.value;d.cursor=editor.selectionStart;d.scroll=editor.scrollTop;d.exampleId=currentExample;}
function renderTabs(){
  const tabs=$('file-tabs'),side=$('opened-files');tabs.replaceChildren();side.replaceChildren();
  $('open-file-count').textContent=String(documents.length).padStart(2,'0');
  for(const doc of documents){
    const wrap=document.createElement('div');wrap.className='file-tab'+(doc.id===activeDocId?' active':'');wrap.dataset.docId=doc.id;
    const main=document.createElement('button');main.type='button';main.className='file-tab-main';main.title='Abrir '+doc.name+' · Doble clic para renombrar';main.setAttribute('role','tab');main.setAttribute('aria-selected',String(doc.id===activeDocId));
    const fileIcon=document.createElementNS('http://www.w3.org/2000/svg','svg');fileIcon.setAttribute('class','icon');const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#i-file');fileIcon.append(use);
    const label=document.createElement('span');label.className='file-tab-label';label.textContent=doc.name;
    main.append(fileIcon,label);
    if(doc.dirty){const dot=document.createElement('span');dot.className='file-minidot';dot.title='Cambios no exportados';main.append(dot);}
    main.addEventListener('click',()=>activateDoc(doc.id));main.addEventListener('dblclick',()=>renameDoc(doc.id));
    const close=document.createElement('button');close.type='button';close.className='file-tab-close';close.title='Cerrar '+doc.name;close.setAttribute('aria-label','Cerrar '+doc.name);close.textContent='×';close.addEventListener('click',()=>closeDoc(doc.id));wrap.append(main,close);tabs.append(wrap);
    const sideBtn=document.createElement('button');sideBtn.type='button';sideBtn.className='open-file-entry'+(doc.id===activeDocId?' selected':'');sideBtn.title=doc.name;
    const sideIcon=document.createElementNS('http://www.w3.org/2000/svg','svg');sideIcon.setAttribute('class','icon');const sideUse=document.createElementNS('http://www.w3.org/2000/svg','use');sideUse.setAttribute('href','#i-file');sideIcon.append(sideUse);
    const sideName=document.createElement('span');sideName.textContent=doc.name;sideBtn.append(sideIcon,sideName);
    if(doc.dirty){const dot=document.createElement('span');dot.className='file-minidot';sideBtn.append(dot);}sideBtn.addEventListener('click',()=>activateDoc(doc.id));side.append(sideBtn);
  }
}
function activateDoc(id){
  if(isRunning){updateStatus('Termina o cancela la ejecución antes de cambiar de pestaña');return;}
  saveCurrentDoc();const next=documents.find(d=>d.id===id);if(!next)return;
  activeDocId=next.id;editor.value=next.code;currentExample=next.exampleId||null;modified=!!next.dirty;errorLine=null;
  $('active-file-name').textContent=next.name;$('editor-file-label').textContent=next.name;$('file-dirty').hidden=!modified;
  document.querySelectorAll('[data-example]').forEach(b=>b.classList.toggle('active-example',b.dataset.example===currentExample));
  refreshEditor(false);resetAnalysis();renderTabs();const tab=document.querySelector('.file-tab.active');if(tab)tab.scrollIntoView({block:'nearest',inline:'nearest'});editor.focus();
  const pos=Math.min(next.cursor||0,editor.value.length);editor.setSelectionRange(pos,pos);editor.scrollTop=next.scroll||0;updateGutter();syncScroll();persistWorkspace();
}
function makeName(prefix='sin-titulo'){let n=1;while(documents.some(d=>d.name===`${prefix}-${n}.pseudo`))n++;return `${prefix}-${n}.pseudo`;}
function createDoc(name,code,exampleId=null,dirty=false){
  if(isRunning){updateStatus('Termina o cancela la ejecución antes de abrir otra pestaña');return null;}
  if(documents.length>=30){alert('Se pueden abrir hasta 30 pestañas. Cierra alguna para continuar.');return null;}
  saveCurrentDoc();const doc={id:'file-'+(++nextDocId),name,code,exampleId,dirty,cursor:0,scroll:0};documents.push(doc);activateDoc(doc.id);return doc;
}
function newDoc(){createDoc(makeName(),'Inicio\n    Escribir "Nuevo algoritmo"\nFin');}
function renameDoc(id){const doc=documents.find(d=>d.id===id);if(!doc||isRunning)return;const raw=prompt('Nombre del archivo:',doc.name);if(raw===null)return;let name=raw.trim().replace(/[\\/:*?"<>|]/g,'-');if(!name)return;if(name.length>65){alert('Utiliza un nombre de hasta 65 caracteres.');return;}if(!/\.(pseudo|psc|txt)$/i.test(name))name+='.pseudo';doc.name=name;if(doc.id===activeDocId){$('active-file-name').textContent=name;$('editor-file-label').textContent=name;}renderTabs();persistWorkspace();}
function closeDoc(id){
  if(isRunning){updateStatus('Termina o cancela la ejecución antes de cerrar una pestaña');return;}
  const i=documents.findIndex(d=>d.id===id);if(i<0)return;const doc=documents[i];
  if(doc.dirty&&!confirm(`«${doc.name}» tiene cambios no exportados. ¿Cerrar esta pestaña?`))return;
  if(id===activeDocId)saveCurrentDoc();documents.splice(i,1);
  if(!documents.length){activeDocId=null;createDoc('principal.pseudo',defaultCode);return;}
  if(id===activeDocId){activeDocId=null;activateDoc(documents[Math.min(i,documents.length-1)].id);}else{renderTabs();persistWorkspace();}
}
function switchNext(reverse=false){if(documents.length<2)return;const i=documents.findIndex(d=>d.id===activeDocId);activateDoc(documents[(i+(reverse?-1:1)+documents.length)%documents.length].id);}
function restoreWorkspace(){
  try{
    const state=JSON.parse(localStorage.getItem(WORKSPACE_KEY)||'null');
    if(state&&Array.isArray(state.documents)&&state.documents.length){
      documents=state.documents.filter(d=>d&&typeof d.id==='string'&&typeof d.name==='string'&&typeof d.code==='string'&&d.code.length<=1024*1024).slice(0,30);
      nextDocId=Number.isSafeInteger(state.nextDocId)?state.nextDocId:documents.length;
      activeDocId=documents.some(d=>d.id===state.activeDocId)?state.activeDocId:documents[0].id;
    }
  }catch{}
  if(!documents.length){let legacy=null;try{legacy=localStorage.getItem(LEGACY_STORAGE_KEY);}catch{}
    documents=[{id:'file-1',name:'principal.pseudo',code:legacy===null?defaultCode:legacy,exampleId:null,dirty:false,cursor:0,scroll:0}];nextDocId=1;activeDocId='file-1';
  }
  const current=activeDoc();editor.value=current.code;currentExample=current.exampleId||null;modified=!!current.dirty;errorLine=null;
  $('active-file-name').textContent=current.name;$('editor-file-label').textContent=current.name;$('file-dirty').hidden=!modified;
  refreshEditor(false);renderTabs();persistWorkspace();
}
function refreshEditor(persist=true){highlight();updateGutter();syncScroll();if(persist){modified=true;const d=activeDoc();if(d){d.code=editor.value;d.cursor=editor.selectionStart;d.dirty=true;d.exampleId=currentExample;}$('file-dirty').hidden=false;renderTabs();persistWorkspace();}}
function setEditor(text,exampleId=null){const titles={welcome:'hola-mundo',math:'calculadora',input:'entrada-datos',condition:'condicionales',alltypes:'tipos-datos',logic:'logica',character:'caracteres',for:'ciclo-para',while:'ciclo-mientras',repeat:'ciclo-repetir'};createDoc(makeName(titles[exampleId]||'ejemplo'),text,exampleId,false);}
function replaceCurrent(text,exampleId=null){const doc=activeDoc();if(!doc)return;doc.code=text;doc.exampleId=exampleId;doc.dirty=true;currentExample=exampleId;editor.value=text;errorLine=null;refreshEditor();resetAnalysis();}
function setInspect(view){activeInspect=view;document.querySelectorAll('[data-inspect]').forEach(b=>{const on=b.dataset.inspect===view;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));});document.querySelectorAll('.inspect-view').forEach(v=>v.classList.toggle('active',v.id===`inspect-${view}`));document.querySelectorAll('.side-link').forEach(b=>b.classList.toggle('selected',(b.dataset.view===view)||(view==='overview'&&b.dataset.focus==='editor')));}
function setPipeline(step,state){const block=$('pipeline-'+step);block.classList.remove('passed','failed');if(state)block.classList.add(state);block.querySelector('.pipeline-state').textContent=state==='passed'?'Correcto':state==='failed'?'Error':'Pendiente';}
function resetAnalysis(){['lexer','parser','runtime'].forEach(key=>setPipeline(key,null));$('analysis-tag').textContent='En espera';$('analysis-tag').className='inspector-indicator';$('overview-status').textContent='Listo para empezar';$('overview-description').textContent='Tu código está preparado para analizarse o ejecutarse.';$('stat-tokens').textContent='—';$('stat-vars').textContent='—';$('token-count').textContent='0 elementos';$('variable-count').textContent='0 variables';setInspect('overview');}
function setAnalysisStatus(title,message,kind){$('overview-status').textContent=title;$('overview-description').textContent=message;$('analysis-tag').textContent=kind==='error'?'Con errores':kind==='ok'?'Correcto':'En espera';$('analysis-tag').className='inspector-indicator'+(kind==='error'?' bad':kind==='ok'?' good':'');let block=document.querySelector('.health-block');block.classList.toggle('has-error',kind==='error');}
function setExecutionBadge(text,kind){let b=$('execution-badge');b.className='execution-badge '+(kind||'');b.innerHTML='<span class="badge-dot"></span> '+escapeHtml(text);}
function updateStatus(text){$('status-message').textContent=text;}
function consolePrint(lines,kind='output'){const c=$('console');c.replaceChildren();for(const s of lines){const el=document.createElement('div');el.className='console-line '+kind;const prompt=document.createElement('span');prompt.className='prompt';prompt.textContent=kind==='error'?'!':kind==='success'?'✓':'›';const value=document.createElement('span');value.textContent=String(s);el.append(prompt,value);c.append(el);}c.scrollTop=c.scrollHeight;}
function tokenTable(tokens){const filtered=tokens.filter(t=>!['NL','EOF'].includes(t.type));$('token-count').textContent=filtered.length+' elementos';$('stat-tokens').textContent=filtered.length;const body=$('tokens');body.replaceChildren();filtered.forEach((t,i)=>{const row=document.createElement('tr');[i+1,t.line,t.type,t.value].forEach((v,j)=>{const cell=document.createElement('td');if(j===2){const pill=document.createElement('span');pill.className='token-pill';pill.textContent=v;cell.append(pill);}else cell.textContent=String(v);row.append(cell);});body.append(row);});if(!filtered.length){body.innerHTML='<tr><td colspan="4" class="empty-cell">No se encontraron tokens.</td></tr>';}}
function variableTable(vars,ast){const types=new Map();function walk(nodes){for(const n of nodes){if(n.k==='declare')types.set(n.name,n.ty);if(n.k==='if'){walk(n.yes);walk(n.no);}if(n.body)walk(n.body);}}walk(ast);const entries=Object.entries(vars);$('stat-vars').textContent=entries.length;$('variable-count').textContent=entries.length+' variables';const body=$('variables');body.replaceChildren();if(!entries.length){body.innerHTML='<tr><td colspan="3" class="empty-cell">El programa no contiene variables declaradas.</td></tr>';return;}for(const [name,v] of entries){const row=document.createElement('tr');[name,types.get(name)||'—',v===null?'No inicializada':typeof v==='boolean'?(v?'Verdadero':'Falso'):String(v)].forEach(s=>{const cell=document.createElement('td');cell.textContent=s;row.append(cell);});body.append(row);}}
function captureError(e,phase){errorLine=Number.isInteger(e.line)?e.line:null;updateGutter();syncScroll();const message=e.message||String(e);setAnalysisStatus('Se detectó un problema',message,'error');if(phase==='lexer'){setPipeline('lexer','failed');}if(phase==='parser'){setPipeline('lexer','passed');setPipeline('parser','failed');}if(phase==='runtime'){setPipeline('lexer','passed');setPipeline('parser','passed');setPipeline('runtime','failed');}consolePrint([message],'error');setExecutionBadge('Error detectado','failure');updateStatus(message);setInspect('overview');$('console-section').scrollIntoView({block:'nearest',behavior:'smooth'});}
function prepare(what='parse'){errorLine=null;try{const tokens=Pseudo.tokenize(editor.value);tokenTable(tokens);setPipeline('lexer','passed');if(what==='lexer')return {tokens};const ast=Pseudo.parse(tokens);setPipeline('parser','passed');return {tokens,ast};}catch(e){captureError(e,e.kind==='Error léxico'?'lexer':'parser');return null;}}
function analyze(what){let result=prepare(what);if(!result)return;if(what==='lexer'){setAnalysisStatus('Análisis léxico completado',`Se identificaron ${$('stat-tokens').textContent} tokens válidos.`,'ok');consolePrint(['Análisis léxico finalizado correctamente.'],'success');updateStatus('Análisis léxico correcto');setExecutionBadge('Análisis correcto','success');setInspect('tokens');}else{setAnalysisStatus('Sintaxis correcta',`Se verificaron ${result.ast.length} instrucciones principales. El código puede ejecutarse.`,'ok');consolePrint(['El programa cumple las reglas gramaticales.','La ejecución puede comenzar.'],'success');updateStatus('Sintaxis validada');setExecutionBadge('Sintaxis correcta','success');setInspect('overview');}}
function askInput(name,type){return new Promise(resolve=>{const d=$('input-dialog'),form=$('input-form'),field=$('input-value'),cancel=$('input-cancel');$('input-label').textContent=`La instrucción Leer necesita un valor para «${name}» (${type}).`;$('input-error').textContent='';field.value='';d.returnValue='cancel';let finished=false;function finish(value){if(finished)return;finished=true;form.removeEventListener('submit',submit);cancel.removeEventListener('click',onCancel);d.removeEventListener('cancel',onCancel);d.close();resolve(value);}function submit(e){e.preventDefault();const value=field.value;if(type!=='Texto'&&value.trim()===''){$('input-error').textContent='Ingresa un valor válido.';return;}if(type==='Logico'&&!['verdadero','falso'].includes(value.trim().toLowerCase())){$('input-error').textContent='Escribe Verdadero o Falso.';return;}if(type==='Caracter'&&[...value].length!==1){$('input-error').textContent='Ingresa exactamente un carácter.';return;}finish(value);}function onCancel(e){e.preventDefault();finish(null);}form.addEventListener('submit',submit);cancel.addEventListener('click',onCancel);d.addEventListener('cancel',onCancel);d.showModal();field.focus();});}
async function run(){if(isRunning)return;isRunning=true;$('run').disabled=true;setExecutionBadge('Ejecutando');updateStatus('Analizando programa...');const start=performance.now(),program=editor.value;try{const analyzed=prepare();if(!analyzed)return;const entries=[];let answer;for(let attempts=0;attempts<=100;attempts++){let idx=0;try{answer=Pseudo.execute(program,(name,type)=>{if(idx<entries.length)return entries[idx++];const ask=new Error('NEED_INPUT');ask.variableName=name;ask.variableType=type;throw ask;});break;}catch(e){if(e.message!=='NEED_INPUT')throw e;if(attempts===100)throw new Error('Se superó el límite de solicitudes de entrada.');let value=await askInput(e.variableName,e.variableType);if(value===null){consolePrint(['Ejecución cancelada.'],'info');setExecutionBadge('Cancelado');setAnalysisStatus('Ejecución cancelada','La entrada fue cancelada por el usuario.','neutral');updateStatus('Ejecución cancelada');return;}entries.push(value);}}if(!answer)throw new Error('No fue posible finalizar la ejecución.');variableTable(answer.variables,answer.ast);setPipeline('runtime','passed');setAnalysisStatus('Ejecución exitosa','El programa terminó sin errores y sus resultados están disponibles.','ok');const shown=answer.output.length?answer.output:['(El programa finalizó sin mostrar datos)'];consolePrint(shown,answer.output.length?'output':'info');setExecutionBadge('Finalizado','success');updateStatus('Programa ejecutado correctamente');$('execution-time').textContent=`Tiempo: ${(performance.now()-start).toFixed(1)} ms · ${answer.output.length} salidas`;setInspect('overview');}catch(e){captureError(e,'runtime');}finally{isRunning=false;$('run').disabled=false;}}
function saveFile(){const doc=activeDoc();if(!doc)return;const blob=new Blob([editor.value],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=doc.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('save-label').textContent='Archivo exportado';$('file-dirty').hidden=true;modified=false;doc.dirty=false;renderTabs();persistWorkspace();}
async function openFile(file){if(!file)return;if(file.size>1024*1024){alert('El tamaño máximo permitido es 1 MB.');return;}const code=await file.text();const name=file.name.slice(0,65)||makeName('importado');createDoc(name,code,null,false);$('save-label').textContent=`Abierto: ${file.name}`;}
function init(){try{const theme=localStorage.getItem(THEME_KEY);if(theme==='light')document.body.classList.add('light');}catch{}restoreWorkspace();updateStatus('Sistema listo');
 editor.addEventListener('input',()=>{errorLine=null;refreshEditor();resetAnalysis();});editor.addEventListener('scroll',syncScroll);editor.addEventListener('click',()=>{updateGutter();syncScroll();});editor.addEventListener('keyup',()=>{updateGutter();syncScroll();});editor.addEventListener('keydown',e=>{if(e.key==='Tab'&&!e.ctrlKey&&!e.metaKey){e.preventDefault();const a=editor.selectionStart,b=editor.selectionEnd;editor.setRangeText('    ',a,b,'end');refreshEditor();resetAnalysis();}});
 document.querySelectorAll('[data-example]').forEach(b=>b.addEventListener('click',()=>setEditor(examples[b.dataset.example],b.dataset.example)));
 document.querySelectorAll('[data-type-example]').forEach(b=>b.addEventListener('click',()=>setEditor(typePrograms[b.dataset.typeExample])));
 $('show-types').addEventListener('click',()=>{setInspect('types');document.querySelector('.inspect-card').scrollIntoView({behavior:'smooth',block:'nearest'});});
 $('show-loops').addEventListener('click',()=>{setInspect('loops');document.querySelector('.inspect-card').scrollIntoView({behavior:'smooth',block:'nearest'});});
 for(const id of ['new-file','new-file-side','tab-new'])$(id).addEventListener('click',newDoc);
 $('try-all-types').addEventListener('click',()=>{setEditor(examples.alltypes,'alltypes');run();});
 document.querySelectorAll('[data-inspect]').forEach(b=>b.addEventListener('click',()=>setInspect(b.dataset.inspect)));
 document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.view==='console'){$('console-section').scrollIntoView({behavior:'smooth',block:'nearest'});}else{setInspect(b.dataset.view);document.querySelector('.inspect-card').scrollIntoView({behavior:'smooth',block:'nearest'});}}));
 document.querySelectorAll('[data-focus]').forEach(b=>b.addEventListener('click',()=>{editor.focus();setInspect('overview');}));
 $('run').addEventListener('click',run);$('check').addEventListener('click',()=>analyze('parse'));$('lex').addEventListener('click',()=>analyze('lexer'));
 $('clear').addEventListener('click',()=>{consolePrint(['Consola limpia.'],'info');setExecutionBadge('Sin ejecutar');updateStatus('Consola reiniciada');});
 $('reset').addEventListener('click',()=>{if(modified&&!confirm('¿Restaurar el código del ejemplo? Se reemplazará el contenido actual.'))return;replaceCurrent(currentExample?examples[currentExample]:defaultCode,currentExample);});
 $('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(editor.value);updateStatus('Código copiado al portapapeles');}catch{editor.focus();editor.select();updateStatus('Código seleccionado: usa Ctrl+C para copiar');}});
 $('open-file').addEventListener('click',()=>$('file-input').click());$('file-input').addEventListener('change',async e=>{for(const file of Array.from(e.target.files))await openFile(file);e.target.value='';});$('export').addEventListener('click',saveFile);
 $('theme').addEventListener('click',()=>{document.body.classList.toggle('light');try{localStorage.setItem(THEME_KEY,document.body.classList.contains('light')?'light':'dark');}catch{}});
 $('shortcuts').addEventListener('click',()=>$('help-dialog').showModal());$('help-close').addEventListener('click',()=>$('help-dialog').close());$('menu-toggle').addEventListener('click',()=>$('sidebar').classList.toggle('menu-open'));
 document.addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey))return;if(e.key==='Tab'){e.preventDefault();switchNext(e.shiftKey);return;}if(e.key==='Enter'){e.preventDefault();run();}if(e.key.toLowerCase()==='n'){e.preventDefault();newDoc();}if(e.key.toLowerCase()==='w'){e.preventDefault();closeDoc(activeDocId);}if(e.key.toLowerCase()==='s'){e.preventDefault();saveFile();}if(e.key.toLowerCase()==='o'){e.preventDefault();$('file-input').click();}if(e.key==='1'){e.preventDefault();editor.focus();}});
}
init();
