/** Nexo IDE 5.0 — intérprete educativo. Sin eval ni acceso al sistema operativo. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.Pseudo=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const TYPES=['Entero','Decimal','Texto','Logico','Caracter'];
const ALIASES={Real:'Decimal',Booleano:'Logico'};
const KEYWORDS=new Set(['Inicio','Fin','Definir','Como',...TYPES,...Object.keys(ALIASES),'Leer','Escribir','Si','Entonces','SiNo','FinSi','Verdadero','Falso','Y','O','No','Para','Hasta','Paso','Hacer','FinPara','Mientras','FinMientras','Repetir','Que']);
const IDENT=/^[A-Za-z_ÁÉÍÓÚÜÑáéíóúüñ][A-Za-z_0-9ÁÉÍÓÚÜÑáéíóúüñ]*/;
class LangError extends Error{
  constructor(kind,line,msg){super(`${kind} (línea ${line}): ${msg}`);this.name='LangError';this.kind=kind;this.line=line;}
}
function tokenize(src){
  const out=[];let i=0,line=1;
  const add=(type,value,l=line)=>out.push({type,value,line:l});
  while(i<src.length){
    const c=src[i],rest=src.slice(i);
    if(c==='\r'){i++;continue;}
    if(c==='\n'){add('NL','\\n');i++;line++;continue;}
    if(c===' '||c==='\t'){i++;continue;}
    if(c==='#'){while(i<src.length&&src[i]!=='\n')i++;continue;}
    if(c==='"'||c==="'"){
      const quote=c,start=line;let j=i+1,s='';
      while(j<src.length&&src[j]!==quote&&src[j]!=='\n'){
        if(src[j]==='\\'&&j+1<src.length){
          const ch=src[j+1];
          if(ch==='n'){s+='\n';j+=2;continue;}
          if(ch===quote||ch==='\\'){s+=ch;j+=2;continue;}
        }
        s+=src[j++];
      }
      if(src[j]!==quote)throw new LangError('Error léxico',start,'Cadena sin comilla de cierre');
      add(quote==='"'?'STRING':'CHAR',s);i=j+1;continue;
    }
    const num=/^\d+(?:\.\d+)?/.exec(rest);
    if(num){add('NUMBER',num[0]);i+=num[0].length;continue;}
    const word=IDENT.exec(rest);
    if(word){add(KEYWORDS.has(word[0])?'KW':'ID',word[0]);i+=word[0].length;continue;}
    const op=['>=','<=','==','!='].find(x=>rest.startsWith(x))||'+-*/()=<> ,'.replace(/ /g,'').split('').find(x=>x===c);
    if(op){add('SYM',op);i+=op.length;continue;}
    throw new LangError('Error léxico',line,`Símbolo no permitido: ${c}`);
  }
  add('EOF','',line);return out;
}
function parse(tokens){
  let i=0;const peek=()=>tokens[i],next=()=>tokens[i++];
  const fail=(t,msg)=>{throw new LangError('Error sintáctico',t.line,msg);};
  const expect=v=>{const t=peek();if(t.value!==v)fail(t,`Se esperaba '${v}' y se encontró '${t.value||'fin de archivo'}'`);return next();};
  function nl(){if(peek().type!=='NL'&&peek().type!=='EOF')fail(peek(),'Se esperaba un salto de línea');while(peek().type==='NL')next();}
  function skip(){while(peek().type==='NL')next();}
  function primary(){
    const t=next();
    if(t.type==='NUMBER')return {k:'lit',v:Number(t.value),line:t.line};
    if(t.type==='STRING')return {k:'lit',v:t.value,line:t.line};
    if(t.type==='CHAR'){
      if([...t.value].length!==1)fail(t,'Un Caracter debe contener exactamente un carácter, por ejemplo: \'A\'');
      return {k:'lit',v:t.value,line:t.line};
    }
    if(t.value==='Verdadero'||t.value==='Falso')return {k:'lit',v:t.value==='Verdadero',line:t.line};
    if(t.type==='ID')return {k:'var',name:t.value,line:t.line};
    if(t.value==='('){const e=expr();expect(')');return e;}
    if(t.value==='-'||t.value==='No')return {k:'unary',op:t.value,x:expr(6),line:t.line};
    fail(t,'Se esperaba número, texto, carácter, valor lógico, variable o expresión entre paréntesis');
  }
  const prec={O:1,Y:2,'==':3,'!=':3,'<':3,'>':3,'<=':3,'>=':3,'+':4,'-':4,'*':5,'/':5};
  function expr(min=1){
    let left=primary();
    while(prec[peek().value]!==undefined&&prec[peek().value]>=min){
      const t=next(),right=expr(prec[t.value]+1);
      left={k:'bin',op:t.value,a:left,b:right,line:t.line};
    }
    return left;
  }
  function block(stops){
    const body=[];skip();
    while(!stops.includes(peek().value)&&peek().type!=='EOF'){
      const t=peek();
      if(t.value==='Definir'){
        next();const names=[];let id=next();
        if(id.type!=='ID')fail(id,'Se esperaba nombre de variable');
        names.push(id.value);
        while(peek().value===','){
          next();id=next();if(id.type!=='ID')fail(id,'Se esperaba otro identificador después de la coma');
          names.push(id.value);
        }
        expect('Como');const ty=next();
        const resolved=ALIASES[ty.value]||ty.value;
        if(!TYPES.includes(resolved))fail(ty,'Tipo inválido: use Entero, Decimal, Texto, Logico o Caracter (también Real y Booleano)');
        names.forEach(name=>body.push({k:'declare',name,ty:resolved,line:t.line}));nl();
      }else if(t.type==='ID'){
        next();expect('=');body.push({k:'assign',name:t.value,x:expr(),line:t.line});nl();
      }else if(t.value==='Leer'){
        next();const id=next();if(id.type!=='ID')fail(id,'Leer requiere una variable');
        body.push({k:'read',name:id.value,line:t.line});nl();
      }else if(t.value==='Escribir'){
        next();const args=[expr()];while(peek().value===','){next();args.push(expr());}
        body.push({k:'print',args,line:t.line});nl();
      }else if(t.value==='Si'){
        next();const cond=expr();expect('Entonces');nl();
        const yes=block(['SiNo','FinSi']);let no=[];
        if(peek().value==='SiNo'){next();nl();no=block(['FinSi']);}
        expect('FinSi');nl();body.push({k:'if',cond,yes,no,line:t.line});
      }else if(t.value==='Para'){
        next();const id=next();
        if(id.type!=='ID')fail(id,'Para necesita una variable de control declarada');
        expect('=');const start=expr();expect('Hasta');const end=expr();
        let step={k:'lit',v:1,line:t.line};
        if(peek().value==='Paso'){next();step=expr();}
        expect('Hacer');nl();
        const inner=block(['FinPara']);expect('FinPara');nl();
        body.push({k:'for',name:id.value,start,end,step,body:inner,line:t.line});
      }else if(t.value==='Mientras'){
        next();const cond=expr();expect('Hacer');nl();
        const inner=block(['FinMientras']);expect('FinMientras');nl();
        body.push({k:'while',cond,body:inner,line:t.line});
      }else if(t.value==='Repetir'){
        next();nl();const inner=block(['Hasta']);expect('Hasta');expect('Que');
        const cond=expr();nl();
        body.push({k:'repeat',cond,body:inner,line:t.line});
      }else fail(t,`Instrucción no válida: '${t.value}'`);
      skip();
    }
    return body;
  }
  skip();expect('Inicio');nl();const body=block(['Fin']);expect('Fin');skip();
  if(peek().type!=='EOF')fail(peek(),'Hay contenido después de Fin');
  return body;
}
function execute(src,input=()=>{throw new Error('Entrada no disponible');}){
  const tokens=tokenize(src),ast=parse(tokens),vars=new Map(),output=[];
  function err(line,msg){throw new LangError('Error de ejecución',line,msg);}
  function evalExpr(n){
    if(n.k==='lit')return n.v;
    if(n.k==='var'){
      if(!vars.has(n.name))err(n.line,`Variable no declarada: ${n.name}`);
      const v=vars.get(n.name);
      if(v.value===null)err(n.line,`Variable sin inicializar: ${n.name}`);
      return v.value;
    }
    if(n.k==='unary'){
      const v=evalExpr(n.x);
      if(n.op==='No'){if(typeof v!=='boolean')err(n.line,'No requiere un valor Logico');return !v;}
      if(typeof v!=='number')err(n.line,'El signo negativo requiere un número');return -v;
    }
    // Cortocircuito para las operaciones lógicas.
    if(n.op==='Y'||n.op==='O'){
      const a=evalExpr(n.a);
      if(typeof a!=='boolean')err(n.line,`${n.op} requiere valores Logico`);
      if(n.op==='Y'&&!a)return false;
      if(n.op==='O'&&a)return true;
      const b=evalExpr(n.b);
      if(typeof b!=='boolean')err(n.line,`${n.op} requiere valores Logico`);
      return b;
    }
    const a=evalExpr(n.a),b=evalExpr(n.b);
    if(['+','-','*','/'].includes(n.op)){
      if(n.op==='+'&&typeof a==='string'&&typeof b==='string')return a+b;
      if(typeof a!=='number'||typeof b!=='number')err(n.line,'La operación aritmética requiere números (o dos textos para +)');
      if(n.op==='/'&&b===0)err(n.line,'División entre cero');
      const r={'+':()=>a+b,'-':()=>a-b,'*':()=>a*b,'/':()=>a/b}[n.op]();
      if(!Number.isFinite(r))err(n.line,'Resultado numérico fuera del rango permitido');
      return r;
    }
    if(typeof a!==typeof b)err(n.line,'No se pueden comparar tipos diferentes');
    if(['<','>','<=','>='].includes(n.op)&&typeof a!=='number'&&typeof a!=='string')err(n.line,'La comparación de orden requiere números o texto');
    return {'==':()=>a===b,'!=':()=>a!==b,'<':()=>a<b,'>':()=>a>b,'<=':()=>a<=b,'>=':()=>a>=b}[n.op]();
  }
  function cast(v,ty,line){
    if(ty==='Texto'){if(typeof v!=='string')err(line,'Se esperaba Texto');return v;}
    if(ty==='Caracter'){if(typeof v!=='string'||[...v].length!==1)err(line,'Se esperaba Caracter: un único carácter');return v;}
    if(ty==='Logico'){if(typeof v!=='boolean')err(line,'Se esperaba Logico (Verdadero o Falso)');return v;}
    if(typeof v!=='number'||!Number.isFinite(v))err(line,'Se esperaba un número válido');
    if(ty==='Entero'&&!Number.isInteger(v))err(line,'Se esperaba un número entero');
    return v;
  }
  function readValue(raw,ty,line){
    if(ty==='Texto'||ty==='Caracter')return cast(String(raw),ty,line);
    if(ty==='Logico'){
      const s=String(raw).trim().toLowerCase();
      if(s!=='verdadero'&&s!=='falso')err(line,'Escriba Verdadero o Falso para Logico');
      return s==='verdadero';
    }
    const v=String(raw).trim()===''?NaN:Number(raw);
    return cast(v,ty,line);
  }
  const format=v=>typeof v==='boolean'?(v?'Verdadero':'Falso'):String(v);
  let steps=0;
  function run(body){
    for(const n of body){
      if(++steps>10000)err(n.line,'Límite de instrucciones excedido');
      if(n.k==='declare'){
        if(vars.has(n.name))err(n.line,`Variable ya declarada: ${n.name}`);
        vars.set(n.name,{ty:n.ty,value:null});
      }else if(n.k==='assign'){
        if(!vars.has(n.name))err(n.line,`Variable no declarada: ${n.name}`);
        const v=vars.get(n.name);v.value=cast(evalExpr(n.x),v.ty,n.line);
      }else if(n.k==='read'){
        if(!vars.has(n.name))err(n.line,`Variable no declarada: ${n.name}`);
        const v=vars.get(n.name),raw=input(n.name,v.ty);
        if(raw===null||raw===undefined)err(n.line,'Entrada cancelada');
        v.value=readValue(raw,v.ty,n.line);
      }else if(n.k==='print'){
        output.push(n.args.map(x=>format(evalExpr(x))).join(' '));
      }else if(n.k==='if'){
        const b=evalExpr(n.cond);
        if(typeof b!=='boolean')err(n.line,'La condición de Si debe producir un valor Logico');
        run(b?n.yes:n.no);
      }else if(n.k==='for'){
        if(!vars.has(n.name))err(n.line,`Variable de control no declarada: ${n.name}`);
        const target=vars.get(n.name);
        if(target.ty!=='Entero'&&target.ty!=='Decimal')err(n.line,'Para necesita una variable Entero o Decimal');
        const start=evalExpr(n.start),end=evalExpr(n.end),step=evalExpr(n.step);
        if([start,end,step].some(x=>typeof x!=='number'||!Number.isFinite(x)))err(n.line,'Inicio, Hasta y Paso deben ser números');
        if(step===0)err(n.line,'Paso no puede ser cero');
        if(target.ty==='Entero'&&![start,step].every(Number.isInteger))err(n.line,'Una variable Entero requiere inicio y paso enteros');
        target.value=cast(start,target.ty,n.line);
        while(step>0?target.value<=end:target.value>=end){
          if(++steps>10000)err(n.line,'Límite de instrucciones excedido (posible ciclo infinito)');
          run(n.body);
          target.value=cast(target.value+step,target.ty,n.line);
        }
      }else if(n.k==='while'){
        while(true){
          if(++steps>10000)err(n.line,'Límite de instrucciones excedido (posible ciclo infinito)');
          const test=evalExpr(n.cond);
          if(typeof test!=='boolean')err(n.line,'La condición de Mientras debe producir Logico');
          if(!test)break;
          run(n.body);
        }
      }else if(n.k==='repeat'){
        do{
          if(++steps>10000)err(n.line,'Límite de instrucciones excedido (posible ciclo infinito)');
          run(n.body);
          const test=evalExpr(n.cond);
          if(typeof test!=='boolean')err(n.line,'Hasta Que requiere una condición Logico');
          if(test)break;
        }while(true);
      }
    }
  }
  run(ast);
  return {tokens,ast,output,variables:Object.fromEntries([...vars].map(([k,v])=>[k,v.value])),variableTypes:Object.fromEntries([...vars].map(([k,v])=>[k,v.ty]))};
}
return {tokenize,parse,execute,LangError,TYPES};
});
