import{i as e,n as t}from"./jsx-runtime-BnxRlLMJ.js";var n=e=>{let t,n=new Set,r=(e,r)=>{let i=typeof e==`function`?e(t):e;if(!Object.is(i,t)){let e=t;t=r??(typeof i!=`object`||!i)?i:Object.assign({},t,i),n.forEach(n=>n(t,e))}},i=()=>t,a={setState:r,getState:i,getInitialState:()=>o,subscribe:e=>(n.add(e),()=>n.delete(e))},o=t=e(r,i,a);return a},r=(e=>e?n(e):n),i=e(t(),1),a=e=>e;function o(e,t=a){let n=i.useSyncExternalStore(e.subscribe,i.useCallback(()=>t(e.getState()),[e,t]),i.useCallback(()=>t(e.getInitialState()),[e,t]));return i.useDebugValue(n),n}var s=e=>{let t=r(e),n=e=>o(t,e);return Object.assign(n,t),n},c=(e=>e?s(e):s);function l(e,t){let n;try{n=e()}catch{return}return{getItem:e=>{let r=e=>e===null?null:JSON.parse(e,t?.reviver),i=n.getItem(e)??null;return i instanceof Promise?i.then(r):r(i)},setItem:(e,r)=>n.setItem(e,JSON.stringify(r,t?.replacer)),removeItem:e=>n.removeItem(e)}}var u=e=>t=>{try{let n=e(t);return n instanceof Promise?n:{then(e){return u(e)(n)},catch(e){return this}}}catch(e){return{then(e){return this},catch(t){return u(t)(e)}}}},d=(e,t)=>(n,r,i)=>{let a={storage:l(()=>window.localStorage),partialize:e=>e,version:0,merge:(e,t)=>({...t,...e}),...t},o=!1,s=0,c=new Set,d=new Set,f=a.storage;if(!f)return e((...e)=>{console.warn(`[zustand persist middleware] Unable to update item '${a.name}', the given storage is currently unavailable.`),n(...e)},r,i);let p=()=>{let e=a.partialize({...r()});return f.setItem(a.name,{state:e,version:a.version})},m=i.setState;i.setState=(e,t)=>(m(e,t),p());let h=e((...e)=>(n(...e),p()),r,i);i.getInitialState=()=>h;let g,_=()=>{if(!f)return;let e=++s;o=!1,c.forEach(e=>e(r()??h));let t=a.onRehydrateStorage?.call(a,r()??h)||void 0;return u(f.getItem.bind(f))(a.name).then(e=>{if(e)if(typeof e.version==`number`&&e.version!==a.version){if(a.migrate){let t=a.migrate(e.state,e.version);return t instanceof Promise?t.then(e=>[!0,e]):[!0,t]}console.error(`State loaded from storage couldn't be migrated since no migrate function was provided`)}else return[!1,e.state];return[!1,void 0]}).then(t=>{if(e!==s)return;let[i,o]=t;if(g=a.merge(o,r()??h),n(g,!0),i)return p()}).then(()=>{e===s&&(t?.(r(),void 0),g=r(),o=!0,d.forEach(e=>e(g)))}).catch(n=>{e===s&&t?.(void 0,n)})};return i.persist={setOptions:e=>{a={...a,...e},e.storage&&(f=e.storage)},clearStorage:()=>{f?.removeItem(a.name)},getOptions:()=>a,rehydrate:()=>_(),hasHydrated:()=>o,onHydrate:e=>(c.add(e),()=>{c.delete(e)}),onFinishHydration:e=>(d.add(e),()=>{d.delete(e)})},a.skipHydration||_(),g||h},f=typeof window<`u`?window.location.hostname.includes(`github.io`)||window.location.pathname.includes(`/demo`)||window.location.search.includes(`demo`):!1,p=c()(e=>({isDemoMode:f,toggleDemoMode:()=>e(e=>({isDemoMode:!e.isDemoMode})),setDemoMode:t=>e({isDemoMode:t})}));function m(e,t){if(p.getState().isDemoMode)return`${window.location.origin}/Rework-Tracker/docs/${t}`;let n=typeof window<`u`?`http://${window.location.hostname}:5002/api`:``;return e.startsWith(`http`)?e:`${n.replace(`/api`,``)}/api${e}`}function h(e,t=7){if(typeof window>`u`)return;let n=new Date;n.setTime(n.getTime()+t*24*60*60*1e3);let r=`; expires=${n.toUTCString()}`;document.cookie=`session_token=${e}${r}; path=/; SameSite=Lax`}function g(){if(typeof window>`u`)return null;let e=document.cookie.split(`;`);for(let t=0;t<e.length;t++){let n=e[t];for(;n.charAt(0)===` `;)n=n.substring(1,n.length);if(n.indexOf(`session_token=`)===0)return n.substring(14,n.length)}return null}function _(){typeof window>`u`||(document.cookie=`session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`)}var v={demoProjects:[{id:4,name:`Dione`,description:`Saturn Moon Project`,pcb_count:30,pcbs:`DIO-0001U.DIO-0002D.DIO-0003N.DIO-0004W.DIO-0005F.DIO-0006Q.DIO-0007Y.DIO-0008H.DIO-0009S.DIO-0010T.DIO-0011C.DIO-0012M.DIO-0013V.DIO-0014E.DIO-0015P.DIO-0016X.DIO-0017G.DIO-0018R.DIO-0019A.DIO-0020B.DIO-0021K.DIO-0022U.DIO-0023D.DIO-0024N.DIO-0025W.DIO-0026F.DIO-0027Q.DIO-0028Y.DIO-0029H.DIO-0030J`.split(`.`),revisions:[`A0`],project_key:`DIO`,silicon_corners:`TT`,flavors:[{name:`Validation`,revisions:[`1.0`,`1.1`,`2.0`]},{name:`Demo`,revisions:[`1.0`,`1.1`,`2.0`]},{name:`Chamber`,revisions:[`1.0`,`1.1`,`2.0`]}]},{id:1,name:`Titan`,description:`Saturn Moon Project`,pcb_count:12,pcbs:[`TIT-0001E`,`TIT-0002P`,`TIT-0003X`,`TIT-0004G`,`TIT-0005R`,`TIT-0006A`,`TIT-0007J`,`TIT-0008T`,`TIT-0009C`,`TIT-0010D`,`TIT-0011N`,`TIT-0012W`],revisions:[`A0`,`B0`,`A1`,`C0`],project_key:`TIT`,silicon_corners:`TT, SS, FF`,flavors:[{name:`Validation`,revisions:[`1.0`,`1.1`,`2.0`]},{name:`Demo`,revisions:[`1.0`,`1.1`,`2.0`]},{name:`Chamber`,revisions:[`1.0`,`1.1`,`2.0`]}]},{id:2,name:`Atlas`,description:`Saturn Moon Project`,pcb_count:26,pcbs:`ATL-0001F.ATL-0002Q.ATL-0003Y.ATL-0004H.ATL-0005S.ATL-0006B.ATL-0007K.ATL-0008U.ATL-0009D.ATL-0010E.ATL-0011P.ATL-0012X.ATL-0013G.ATL-0014R.ATL-0015A.ATL-0016J.ATL-0017T.ATL-0018C.ATL-0019M.ATL-0020N.ATL-0021W.ATL-0022F.ATL-0023Q.ATL-0024Y.ATL-0025H.ATL-0026S`.split(`.`),revisions:[`A0`,`B0`,`B1`],project_key:`ATL`,silicon_corners:`TT, SS, FF`,flavors:[{name:`Validation`,revisions:[`1.0`,`1.1`,`2.0`]},{name:`Demo`,revisions:[`1.0`,`1.1`,`2.0`]},{name:`Chamber`,revisions:[`1.0`,`1.1`,`2.0`]}]}],demoPcbs:[{id:1,board_number:`DIO-0001U`,status:`Working`,project:`Dione`,project_id:4,owner:`Ethan Hunt`,owner_id:5,product_name_and_rev:`Dione A0 TT Demo - Rev 2.0`,product:`Dione A0 TT Demo - Rev 2.0`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Demo`,board_rev:`2.0`,short_code:`MQ9`},{id:2,board_number:`DIO-0002D`,status:`Testing`,project:`Dione`,project_id:4,owner:`Alice Smith`,owner_id:1,product_name_and_rev:`Dione A0 TT Demo - Rev 1.0`,product:`Dione A0 TT Demo - Rev 1.0`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Demo`,board_rev:`1.0`,short_code:`uh3`},{id:3,board_number:`DIO-0003N`,status:`Testing`,project:`Dione`,project_id:4,owner:`Fiona Gallagher`,owner_id:6,product_name_and_rev:`Dione A0 TT Validation - Rev 1.0`,product:`Dione A0 TT Validation - Rev 1.0`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Validation`,board_rev:`1.0`,short_code:`Egg`},{id:4,board_number:`DIO-0004W`,status:`In Rework`,project:`Dione`,project_id:4,owner:`Elena Miller`,owner_id:4,product_name_and_rev:`Dione A0 TT Validation - Rev 1.1`,product:`Dione A0 TT Validation - Rev 1.1`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Validation`,board_rev:`1.1`,short_code:`rKp`},{id:5,board_number:`DIO-0005F`,status:`Working`,project:`Dione`,project_id:4,owner:`Bob Jones`,owner_id:2,product_name_and_rev:`Dione A0 TT Chamber - Rev 1.0`,product:`Dione A0 TT Chamber - Rev 1.0`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Chamber`,board_rev:`1.0`,short_code:`3XA`},{id:6,board_number:`DIO-0006Q`,status:`Working`,project:`Dione`,project_id:4,owner:`Fiona Gallagher`,owner_id:6,product_name_and_rev:`Dione A0 TT Demo - Rev 1.1`,product:`Dione A0 TT Demo - Rev 1.1`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Demo`,board_rev:`1.1`,short_code:`qBn`},{id:7,board_number:`DIO-0007Y`,status:`Testing`,project:`Dione`,project_id:4,owner:`Charlie Brown`,owner_id:3,product_name_and_rev:`Dione A0 TT Demo - Rev 2.0`,product:`Dione A0 TT Demo - Rev 2.0`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Demo`,board_rev:`2.0`,short_code:`Kff`},{id:8,board_number:`DIO-0008H`,status:`In Rework`,project:`Dione`,project_id:4,owner:`Alice Smith`,owner_id:1,product_name_and_rev:`Dione A0 TT Validation - Rev 1.1`,product:`Dione A0 TT Validation - Rev 1.1`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Validation`,board_rev:`1.1`,short_code:`X5X`},{id:9,board_number:`DIO-0009S`,status:`Working`,project:`Dione`,project_id:4,owner:`George Costanza`,owner_id:7,product_name_and_rev:`Dione A0 TT Chamber - Rev 1.0`,product:`Dione A0 TT Chamber - Rev 1.0`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Chamber`,board_rev:`1.0`,short_code:`Myj`},{id:10,board_number:`DIO-0010T`,status:`In Rework`,project:`Dione`,project_id:4,owner:`Charlie Brown`,owner_id:3,product_name_and_rev:`Dione A0 TT Validation - Rev 1.1`,product:`Dione A0 TT Validation - Rev 1.1`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Validation`,board_rev:`1.1`,short_code:`q7T`},{id:11,board_number:`DIO-0011C`,status:`In Rework`,project:`Dione`,project_id:4,owner:`George Costanza`,owner_id:7,product_name_and_rev:`Dione A0 TT Validation - Rev 1.1`,product:`Dione A0 TT Validation - Rev 1.1`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Validation`,board_rev:`1.1`,short_code:`uPt`},{id:12,board_number:`DIO-0012M`,status:`In Rework`,project:`Dione`,project_id:4,owner:`Ethan Hunt`,owner_id:5,product_name_and_rev:`Dione A0 TT Demo - Rev 1.0`,product:`Dione A0 TT Demo - Rev 1.0`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Demo`,board_rev:`1.0`,short_code:`rmw`},{id:13,board_number:`DIO-0013V`,status:`Testing`,project:`Dione`,project_id:4,owner:`Ethan Hunt`,owner_id:5,product_name_and_rev:`Dione A0 TT Demo - Rev 1.1`,product:`Dione A0 TT Demo - Rev 1.1`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Demo`,board_rev:`1.1`,short_code:`VaP`},{id:14,board_number:`DIO-0014E`,status:`In Rework`,project:`Dione`,project_id:4,owner:`Bob Jones`,owner_id:2,product_name_and_rev:`Dione A0 TT Demo - Rev 1.1`,product:`Dione A0 TT Demo - Rev 1.1`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Demo`,board_rev:`1.1`,short_code:`dPW`},{id:15,board_number:`DIO-0015P`,status:`Working`,project:`Dione`,project_id:4,owner:`Elena Miller`,owner_id:4,product_name_and_rev:`Dione A0 TT Validation - Rev 1.0`,product:`Dione A0 TT Validation - Rev 1.0`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Validation`,board_rev:`1.0`,short_code:`GFS`},{id:16,board_number:`DIO-0016X`,status:`Testing`,project:`Dione`,project_id:4,owner:`Ethan Hunt`,owner_id:5,product_name_and_rev:`Dione A0 TT Demo - Rev 1.1`,product:`Dione A0 TT Demo - Rev 1.1`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Demo`,board_rev:`1.1`,short_code:`TNP`},{id:17,board_number:`DIO-0017G`,status:`Testing`,project:`Dione`,project_id:4,owner:`Ethan Hunt`,owner_id:5,product_name_and_rev:`Dione A0 TT Demo - Rev 1.1`,product:`Dione A0 TT Demo - Rev 1.1`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Demo`,board_rev:`1.1`,short_code:`SVQ`},{id:18,board_number:`DIO-0018R`,status:`In Rework`,project:`Dione`,project_id:4,owner:`George Costanza`,owner_id:7,product_name_and_rev:`Dione A0 TT Validation - Rev 1.1`,product:`Dione A0 TT Validation - Rev 1.1`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Validation`,board_rev:`1.1`,short_code:`bvJ`},{id:19,board_number:`DIO-0019A`,status:`In Rework`,project:`Dione`,project_id:4,owner:`Alice Smith`,owner_id:1,product_name_and_rev:`Dione A0 TT Validation - Rev 2.0`,product:`Dione A0 TT Validation - Rev 2.0`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Validation`,board_rev:`2.0`,short_code:`aSx`},{id:20,board_number:`DIO-0020B`,status:`Working`,project:`Dione`,project_id:4,owner:`Fiona Gallagher`,owner_id:6,product_name_and_rev:`Dione A0 TT Demo - Rev 1.1`,product:`Dione A0 TT Demo - Rev 1.1`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Demo`,board_rev:`1.1`,short_code:`PvG`},{id:21,board_number:`DIO-0021K`,status:`Testing`,project:`Dione`,project_id:4,owner:`Alice Smith`,owner_id:1,product_name_and_rev:`Dione A0 TT Chamber - Rev 1.1`,product:`Dione A0 TT Chamber - Rev 1.1`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Chamber`,board_rev:`1.1`,short_code:`mPN`},{id:22,board_number:`DIO-0022U`,status:`Testing`,project:`Dione`,project_id:4,owner:`Fiona Gallagher`,owner_id:6,product_name_and_rev:`Dione A0 TT Demo - Rev 1.1`,product:`Dione A0 TT Demo - Rev 1.1`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Demo`,board_rev:`1.1`,short_code:`bpC`},{id:23,board_number:`DIO-0023D`,status:`In Rework`,project:`Dione`,project_id:4,owner:`George Costanza`,owner_id:7,product_name_and_rev:`Dione A0 TT Demo - Rev 2.0`,product:`Dione A0 TT Demo - Rev 2.0`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Demo`,board_rev:`2.0`,short_code:`YFf`},{id:24,board_number:`DIO-0024N`,status:`Working`,project:`Dione`,project_id:4,owner:`Bob Jones`,owner_id:2,product_name_and_rev:`Dione A0 TT Demo - Rev 1.0`,product:`Dione A0 TT Demo - Rev 1.0`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Demo`,board_rev:`1.0`,short_code:`Vfe`},{id:25,board_number:`DIO-0025W`,status:`In Rework`,project:`Dione`,project_id:4,owner:`George Costanza`,owner_id:7,product_name_and_rev:`Dione A0 TT Demo - Rev 1.1`,product:`Dione A0 TT Demo - Rev 1.1`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Demo`,board_rev:`1.1`,short_code:`Ree`},{id:26,board_number:`DIO-0026F`,status:`Working`,project:`Dione`,project_id:4,owner:`Alice Smith`,owner_id:1,product_name_and_rev:`Dione A0 TT Validation - Rev 2.0`,product:`Dione A0 TT Validation - Rev 2.0`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Validation`,board_rev:`2.0`,short_code:`esX`},{id:27,board_number:`DIO-0027Q`,status:`Working`,project:`Dione`,project_id:4,owner:`Alice Smith`,owner_id:1,product_name_and_rev:`Dione A0 TT Chamber - Rev 1.0`,product:`Dione A0 TT Chamber - Rev 1.0`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Chamber`,board_rev:`1.0`,short_code:`PJY`},{id:28,board_number:`DIO-0028Y`,status:`Working`,project:`Dione`,project_id:4,owner:`Ethan Hunt`,owner_id:5,product_name_and_rev:`Dione A0 TT Demo - Rev 1.0`,product:`Dione A0 TT Demo - Rev 1.0`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Demo`,board_rev:`1.0`,short_code:`W8P`},{id:29,board_number:`DIO-0029H`,status:`In Rework`,project:`Dione`,project_id:4,owner:`Bob Jones`,owner_id:2,product_name_and_rev:`Dione A0 TT Demo - Rev 1.1`,product:`Dione A0 TT Demo - Rev 1.1`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Demo`,board_rev:`1.1`,short_code:`fsT`},{id:30,board_number:`DIO-0030J`,status:`Working`,project:`Dione`,project_id:4,owner:`George Costanza`,owner_id:7,product_name_and_rev:`Dione A0 TT Chamber - Rev 2.0`,product:`Dione A0 TT Chamber - Rev 2.0`,project_key:`DIO`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Chamber`,board_rev:`2.0`,short_code:`mdA`},{id:31,board_number:`TIT-0001E`,status:`Working`,project:`Titan`,project_id:1,owner:`George Costanza`,owner_id:7,product_name_and_rev:`Titan C0 TT Validation - Rev 2.0`,product:`Titan C0 TT Validation - Rev 2.0`,project_key:`TIT`,bom:`BOM1`,silicon_rev:`C0`,silicon_corner:`TT`,board_flavor:`Validation`,board_rev:`2.0`,short_code:`WW6`},{id:32,board_number:`TIT-0002P`,status:`Testing`,project:`Titan`,project_id:1,owner:`Alice Smith`,owner_id:1,product_name_and_rev:`Titan B0 SS Chamber - Rev 1.0`,product:`Titan B0 SS Chamber - Rev 1.0`,project_key:`TIT`,bom:`BOM1`,silicon_rev:`B0`,silicon_corner:`SS`,board_flavor:`Chamber`,board_rev:`1.0`,short_code:`vpM`},{id:33,board_number:`TIT-0003X`,status:`Testing`,project:`Titan`,project_id:1,owner:`Ethan Hunt`,owner_id:5,product_name_and_rev:`Titan B0 FF Demo - Rev 1.0`,product:`Titan B0 FF Demo - Rev 1.0`,project_key:`TIT`,bom:`BOM1`,silicon_rev:`B0`,silicon_corner:`FF`,board_flavor:`Demo`,board_rev:`1.0`,short_code:`9Ud`},{id:34,board_number:`TIT-0004G`,status:`Testing`,project:`Titan`,project_id:1,owner:`Elena Miller`,owner_id:4,product_name_and_rev:`Titan C0 TT Validation - Rev 1.0`,product:`Titan C0 TT Validation - Rev 1.0`,project_key:`TIT`,bom:`BOM1`,silicon_rev:`C0`,silicon_corner:`TT`,board_flavor:`Validation`,board_rev:`1.0`,short_code:`uSs`},{id:35,board_number:`TIT-0005R`,status:`Testing`,project:`Titan`,project_id:1,owner:`George Costanza`,owner_id:7,product_name_and_rev:`Titan A0 SS Validation - Rev 1.1`,product:`Titan A0 SS Validation - Rev 1.1`,project_key:`TIT`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`SS`,board_flavor:`Validation`,board_rev:`1.1`,short_code:`nBQ`},{id:36,board_number:`TIT-0006A`,status:`Testing`,project:`Titan`,project_id:1,owner:`Bob Jones`,owner_id:2,product_name_and_rev:`Titan C0 FF Demo - Rev 2.0`,product:`Titan C0 FF Demo - Rev 2.0`,project_key:`TIT`,bom:`BOM1`,silicon_rev:`C0`,silicon_corner:`FF`,board_flavor:`Demo`,board_rev:`2.0`,short_code:`CjX`},{id:37,board_number:`TIT-0007J`,status:`In Rework`,project:`Titan`,project_id:1,owner:`Charlie Brown`,owner_id:3,product_name_and_rev:`Titan B0 TT Demo - Rev 1.0`,product:`Titan B0 TT Demo - Rev 1.0`,project_key:`TIT`,bom:`BOM1`,silicon_rev:`B0`,silicon_corner:`TT`,board_flavor:`Demo`,board_rev:`1.0`,short_code:`7vS`},{id:38,board_number:`TIT-0008T`,status:`Testing`,project:`Titan`,project_id:1,owner:`Ethan Hunt`,owner_id:5,product_name_and_rev:`Titan B0 SS Demo - Rev 1.0`,product:`Titan B0 SS Demo - Rev 1.0`,project_key:`TIT`,bom:`BOM1`,silicon_rev:`B0`,silicon_corner:`SS`,board_flavor:`Demo`,board_rev:`1.0`,short_code:`W3t`},{id:39,board_number:`TIT-0009C`,status:`Testing`,project:`Titan`,project_id:1,owner:`Elena Miller`,owner_id:4,product_name_and_rev:`Titan B0 FF Demo - Rev 1.0`,product:`Titan B0 FF Demo - Rev 1.0`,project_key:`TIT`,bom:`BOM1`,silicon_rev:`B0`,silicon_corner:`FF`,board_flavor:`Demo`,board_rev:`1.0`,short_code:`yAA`},{id:40,board_number:`TIT-0010D`,status:`Testing`,project:`Titan`,project_id:1,owner:`Charlie Brown`,owner_id:3,product_name_and_rev:`Titan B0 TT Validation - Rev 1.0`,product:`Titan B0 TT Validation - Rev 1.0`,project_key:`TIT`,bom:`BOM1`,silicon_rev:`B0`,silicon_corner:`TT`,board_flavor:`Validation`,board_rev:`1.0`,short_code:`9TQ`},{id:41,board_number:`TIT-0011N`,status:`Working`,project:`Titan`,project_id:1,owner:`Bob Jones`,owner_id:2,product_name_and_rev:`Titan C0 SS Demo - Rev 1.0`,product:`Titan C0 SS Demo - Rev 1.0`,project_key:`TIT`,bom:`BOM1`,silicon_rev:`C0`,silicon_corner:`SS`,board_flavor:`Demo`,board_rev:`1.0`,short_code:`APm`},{id:42,board_number:`TIT-0012W`,status:`Testing`,project:`Titan`,project_id:1,owner:`Bob Jones`,owner_id:2,product_name_and_rev:`Titan C0 FF Chamber - Rev 2.0`,product:`Titan C0 FF Chamber - Rev 2.0`,project_key:`TIT`,bom:`BOM1`,silicon_rev:`C0`,silicon_corner:`FF`,board_flavor:`Chamber`,board_rev:`2.0`,short_code:`ccv`},{id:43,board_number:`ATL-0001F`,status:`Testing`,project:`Atlas`,project_id:2,owner:`Ethan Hunt`,owner_id:5,product_name_and_rev:`Atlas B1 TT Validation - Rev 2.0`,product:`Atlas B1 TT Validation - Rev 2.0`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`B1`,silicon_corner:`TT`,board_flavor:`Validation`,board_rev:`2.0`,short_code:`7QJ`},{id:44,board_number:`ATL-0002Q`,status:`Working`,project:`Atlas`,project_id:2,owner:`Ethan Hunt`,owner_id:5,product_name_and_rev:`Atlas B0 SS Demo - Rev 1.0`,product:`Atlas B0 SS Demo - Rev 1.0`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`B0`,silicon_corner:`SS`,board_flavor:`Demo`,board_rev:`1.0`,short_code:`RtE`},{id:45,board_number:`ATL-0003Y`,status:`In Rework`,project:`Atlas`,project_id:2,owner:`George Costanza`,owner_id:7,product_name_and_rev:`Atlas A0 FF Demo - Rev 2.0`,product:`Atlas A0 FF Demo - Rev 2.0`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`FF`,board_flavor:`Demo`,board_rev:`2.0`,short_code:`cV3`},{id:46,board_number:`ATL-0004H`,status:`In Rework`,project:`Atlas`,project_id:2,owner:`Ethan Hunt`,owner_id:5,product_name_and_rev:`Atlas B1 TT Validation - Rev 1.1`,product:`Atlas B1 TT Validation - Rev 1.1`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`B1`,silicon_corner:`TT`,board_flavor:`Validation`,board_rev:`1.1`,short_code:`UBG`},{id:47,board_number:`ATL-0005S`,status:`In Rework`,project:`Atlas`,project_id:2,owner:`Ethan Hunt`,owner_id:5,product_name_and_rev:`Atlas B0 SS Demo - Rev 1.1`,product:`Atlas B0 SS Demo - Rev 1.1`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`B0`,silicon_corner:`SS`,board_flavor:`Demo`,board_rev:`1.1`,short_code:`jeD`},{id:48,board_number:`ATL-0006B`,status:`Working`,project:`Atlas`,project_id:2,owner:`Alice Smith`,owner_id:1,product_name_and_rev:`Atlas A0 FF Validation - Rev 1.1`,product:`Atlas A0 FF Validation - Rev 1.1`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`FF`,board_flavor:`Validation`,board_rev:`1.1`,short_code:`tdx`},{id:49,board_number:`ATL-0007K`,status:`In Rework`,project:`Atlas`,project_id:2,owner:`Fiona Gallagher`,owner_id:6,product_name_and_rev:`Atlas B0 TT Demo - Rev 2.0`,product:`Atlas B0 TT Demo - Rev 2.0`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`B0`,silicon_corner:`TT`,board_flavor:`Demo`,board_rev:`2.0`,short_code:`SyG`},{id:50,board_number:`ATL-0008U`,status:`Working`,project:`Atlas`,project_id:2,owner:`Alice Smith`,owner_id:1,product_name_and_rev:`Atlas A0 SS Validation - Rev 1.1`,product:`Atlas A0 SS Validation - Rev 1.1`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`SS`,board_flavor:`Validation`,board_rev:`1.1`,short_code:`fX9`},{id:51,board_number:`ATL-0009D`,status:`Testing`,project:`Atlas`,project_id:2,owner:`Ethan Hunt`,owner_id:5,product_name_and_rev:`Atlas B0 FF Chamber - Rev 2.0`,product:`Atlas B0 FF Chamber - Rev 2.0`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`B0`,silicon_corner:`FF`,board_flavor:`Chamber`,board_rev:`2.0`,short_code:`kF4`},{id:52,board_number:`ATL-0010E`,status:`Testing`,project:`Atlas`,project_id:2,owner:`Bob Jones`,owner_id:2,product_name_and_rev:`Atlas B0 TT Validation - Rev 1.0`,product:`Atlas B0 TT Validation - Rev 1.0`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`B0`,silicon_corner:`TT`,board_flavor:`Validation`,board_rev:`1.0`,short_code:`aXx`},{id:53,board_number:`ATL-0011P`,status:`Working`,project:`Atlas`,project_id:2,owner:`Charlie Brown`,owner_id:3,product_name_and_rev:`Atlas B1 SS Validation - Rev 1.0`,product:`Atlas B1 SS Validation - Rev 1.0`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`B1`,silicon_corner:`SS`,board_flavor:`Validation`,board_rev:`1.0`,short_code:`jjW`},{id:54,board_number:`ATL-0012X`,status:`Testing`,project:`Atlas`,project_id:2,owner:`George Costanza`,owner_id:7,product_name_and_rev:`Atlas A0 FF Validation - Rev 1.0`,product:`Atlas A0 FF Validation - Rev 1.0`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`FF`,board_flavor:`Validation`,board_rev:`1.0`,short_code:`cPx`},{id:55,board_number:`ATL-0013G`,status:`Working`,project:`Atlas`,project_id:2,owner:`Ethan Hunt`,owner_id:5,product_name_and_rev:`Atlas A0 TT Chamber - Rev 1.1`,product:`Atlas A0 TT Chamber - Rev 1.1`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Chamber`,board_rev:`1.1`,short_code:`Aj5`},{id:56,board_number:`ATL-0014R`,status:`In Rework`,project:`Atlas`,project_id:2,owner:`Ethan Hunt`,owner_id:5,product_name_and_rev:`Atlas B0 SS Validation - Rev 1.0`,product:`Atlas B0 SS Validation - Rev 1.0`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`B0`,silicon_corner:`SS`,board_flavor:`Validation`,board_rev:`1.0`,short_code:`Pep`},{id:57,board_number:`ATL-0015A`,status:`In Rework`,project:`Atlas`,project_id:2,owner:`Fiona Gallagher`,owner_id:6,product_name_and_rev:`Atlas B1 FF Chamber - Rev 2.0`,product:`Atlas B1 FF Chamber - Rev 2.0`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`B1`,silicon_corner:`FF`,board_flavor:`Chamber`,board_rev:`2.0`,short_code:`U3b`},{id:58,board_number:`ATL-0016J`,status:`In Rework`,project:`Atlas`,project_id:2,owner:`Bob Jones`,owner_id:2,product_name_and_rev:`Atlas A0 TT Chamber - Rev 2.0`,product:`Atlas A0 TT Chamber - Rev 2.0`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Chamber`,board_rev:`2.0`,short_code:`SPq`},{id:59,board_number:`ATL-0017T`,status:`Working`,project:`Atlas`,project_id:2,owner:`Ethan Hunt`,owner_id:5,product_name_and_rev:`Atlas A0 SS Demo - Rev 1.1`,product:`Atlas A0 SS Demo - Rev 1.1`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`SS`,board_flavor:`Demo`,board_rev:`1.1`,short_code:`cVd`},{id:60,board_number:`ATL-0018C`,status:`Working`,project:`Atlas`,project_id:2,owner:`Fiona Gallagher`,owner_id:6,product_name_and_rev:`Atlas B1 FF Chamber - Rev 2.0`,product:`Atlas B1 FF Chamber - Rev 2.0`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`B1`,silicon_corner:`FF`,board_flavor:`Chamber`,board_rev:`2.0`,short_code:`x9a`},{id:61,board_number:`ATL-0019M`,status:`In Rework`,project:`Atlas`,project_id:2,owner:`Alice Smith`,owner_id:1,product_name_and_rev:`Atlas B0 TT Validation - Rev 1.1`,product:`Atlas B0 TT Validation - Rev 1.1`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`B0`,silicon_corner:`TT`,board_flavor:`Validation`,board_rev:`1.1`,short_code:`gxy`},{id:62,board_number:`ATL-0020N`,status:`Testing`,project:`Atlas`,project_id:2,owner:`Alice Smith`,owner_id:1,product_name_and_rev:`Atlas B1 SS Chamber - Rev 1.1`,product:`Atlas B1 SS Chamber - Rev 1.1`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`B1`,silicon_corner:`SS`,board_flavor:`Chamber`,board_rev:`1.1`,short_code:`FTn`},{id:63,board_number:`ATL-0021W`,status:`In Rework`,project:`Atlas`,project_id:2,owner:`Charlie Brown`,owner_id:3,product_name_and_rev:`Atlas B0 FF Validation - Rev 1.1`,product:`Atlas B0 FF Validation - Rev 1.1`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`B0`,silicon_corner:`FF`,board_flavor:`Validation`,board_rev:`1.1`,short_code:`wPq`},{id:64,board_number:`ATL-0022F`,status:`Working`,project:`Atlas`,project_id:2,owner:`Alice Smith`,owner_id:1,product_name_and_rev:`Atlas B0 TT Demo - Rev 1.1`,product:`Atlas B0 TT Demo - Rev 1.1`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`B0`,silicon_corner:`TT`,board_flavor:`Demo`,board_rev:`1.1`,short_code:`mpN`},{id:65,board_number:`ATL-0023Q`,status:`Working`,project:`Atlas`,project_id:2,owner:`Ethan Hunt`,owner_id:5,product_name_and_rev:`Atlas B1 SS Demo - Rev 2.0`,product:`Atlas B1 SS Demo - Rev 2.0`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`B1`,silicon_corner:`SS`,board_flavor:`Demo`,board_rev:`2.0`,short_code:`VAs`},{id:66,board_number:`ATL-0024Y`,status:`In Rework`,project:`Atlas`,project_id:2,owner:`Fiona Gallagher`,owner_id:6,product_name_and_rev:`Atlas A0 FF Validation - Rev 2.0`,product:`Atlas A0 FF Validation - Rev 2.0`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`FF`,board_flavor:`Validation`,board_rev:`2.0`,short_code:`URb`},{id:67,board_number:`ATL-0025H`,status:`Testing`,project:`Atlas`,project_id:2,owner:`Bob Jones`,owner_id:2,product_name_and_rev:`Atlas A0 TT Validation - Rev 1.0`,product:`Atlas A0 TT Validation - Rev 1.0`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`TT`,board_flavor:`Validation`,board_rev:`1.0`,short_code:`Jjf`},{id:68,board_number:`ATL-0026S`,status:`In Rework`,project:`Atlas`,project_id:2,owner:`Ethan Hunt`,owner_id:5,product_name_and_rev:`Atlas A0 SS Chamber - Rev 1.1`,product:`Atlas A0 SS Chamber - Rev 1.1`,project_key:`ATL`,bom:`BOM1`,silicon_rev:`A0`,silicon_corner:`SS`,board_flavor:`Chamber`,board_rev:`1.1`,short_code:`UeA`}],demoOwners:[{id:1,name:`Alice Smith`,username:`asmith`,pcb_count:12,rework_count:11,tag_count:2},{id:2,name:`Bob Jones`,username:`bjones`,pcb_count:10,rework_count:8,tag_count:2},{id:3,name:`Charlie Brown`,username:`cbrown`,pcb_count:6,rework_count:12,tag_count:0},{id:4,name:`Elena Miller`,username:`emiller`,pcb_count:4,rework_count:8,tag_count:0},{id:5,name:`Ethan Hunt`,username:`ehunt`,pcb_count:18,rework_count:9,tag_count:0},{id:6,name:`Fiona Gallagher`,username:`fgallagher`,pcb_count:8,rework_count:17,tag_count:0},{id:7,name:`George Costanza`,username:`gcostanza`,pcb_count:10,rework_count:10,tag_count:0}],demoReworks:[{id:1,pcb_id:1,title:`Set clock to external clock`,description:`Detailed rework analysis for DIO-0001U:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.495Z`,owner_id:1,owner_name:`Alice Smith`,pcb_board_number:`DIO-0001U`,image_path:`["this is picture DIO-0001U-R001-PIC-1","this is picture DIO-0001U-R001-PIC-2","this is picture DIO-0001U-R001-PIC-3"]`,rework_type:`Resistor Swap`,rework_number:1},{id:2,pcb_id:2,title:`Set clock to external clock`,description:`Detailed rework analysis for DIO-0002D:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.496Z`,owner_id:3,owner_name:`Charlie Brown`,pcb_board_number:`DIO-0002D`,image_path:`["this is picture DIO-0002D-R001-PIC-1","this is picture DIO-0002D-R001-PIC-2","this is picture DIO-0002D-R001-PIC-3"]`,rework_type:`Resistor Swap`,rework_number:1},{id:3,pcb_id:3,title:`Replaced Burned 3.3V reg`,description:`Detailed rework analysis for DIO-0003N:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.496Z`,owner_id:6,owner_name:`Fiona Gallagher`,pcb_board_number:`DIO-0003N`,rework_type:`Major`,rework_number:1},{id:4,pcb_id:4,title:`Set board for GPIO control`,description:`Detailed rework analysis for DIO-0004W:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.496Z`,owner_id:4,owner_name:`Elena Miller`,pcb_board_number:`DIO-0004W`,image_path:`["this is picture DIO-0004W-R001-PIC-1","this is picture DIO-0004W-R001-PIC-2"]`,rework_type:`Minor`,rework_number:1},{id:5,pcb_id:6,title:`Installed new Osc`,description:`Detailed rework analysis for DIO-0006Q:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:3,owner_name:`Charlie Brown`,pcb_board_number:`DIO-0006Q`,rework_type:`Major`,rework_number:1},{id:6,pcb_id:7,title:`Silicon Swap to A0 TT`,description:`Detailed rework analysis for DIO-0007Y:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:6,owner_name:`Fiona Gallagher`,pcb_board_number:`DIO-0007Y`,rework_type:`Silicon Swap`,rework_number:1},{id:7,pcb_id:9,title:`Removed the MDI termination resistors`,description:`Detailed rework analysis for DIO-0009S:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:7,owner_name:`George Costanza`,pcb_board_number:`DIO-0009S`,image_path:`["this is picture DIO-0009S-R001-PIC-1","this is picture DIO-0009S-R001-PIC-2","this is picture DIO-0009S-R001-PIC-3"]`,rework_type:`Minor`,rework_number:1},{id:8,pcb_id:11,title:`Swapped MID to copper`,description:`Detailed rework analysis for DIO-0011C:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:6,owner_name:`Fiona Gallagher`,pcb_board_number:`DIO-0011C`,image_path:`["this is picture DIO-0011C-R001-PIC-1","this is picture DIO-0011C-R001-PIC-2"]`,rework_type:`Resistor Swap`,rework_number:1},{id:9,pcb_id:12,title:`Set board for GPIO control`,description:`Detailed rework analysis for DIO-0012M:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:5,owner_name:`Ethan Hunt`,pcb_board_number:`DIO-0012M`,rework_type:`Minor`,rework_number:1},{id:10,pcb_id:14,title:`Added new Inductors to the board`,description:`Detailed rework analysis for DIO-0014E:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:7,owner_name:`George Costanza`,pcb_board_number:`DIO-0014E`,rework_type:`Major`,rework_number:1},{id:11,pcb_id:15,title:`Replaced Burned 3.3V reg`,description:`Detailed rework analysis for DIO-0015P:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:5,owner_name:`Ethan Hunt`,pcb_board_number:`DIO-0015P`,image_path:`["this is picture DIO-0015P-R001-PIC-1","this is picture DIO-0015P-R001-PIC-2"]`,rework_type:`Major`,rework_number:1},{id:12,pcb_id:16,title:`Replaced Burned 3.3V reg`,description:`Detailed rework analysis for DIO-0016X:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:1,owner_name:`Alice Smith`,pcb_board_number:`DIO-0016X`,rework_type:`Major`,rework_number:1},{id:13,pcb_id:16,title:`Silicon Swap to A0 TT`,description:`Detailed rework analysis for DIO-0016X:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:2,owner_name:`Bob Jones`,pcb_board_number:`DIO-0016X`,image_path:`["this is picture DIO-0016X-R001-PIC-1","this is picture DIO-0016X-R001-PIC-2","this is picture DIO-0016X-R001-PIC-3"]`,rework_type:`Silicon Swap`,rework_number:2},{id:14,pcb_id:16,title:`Replaced Burned 3.3V reg`,description:`Detailed rework analysis for DIO-0016X:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:3,owner_name:`Charlie Brown`,pcb_board_number:`DIO-0016X`,rework_type:`Major`,rework_number:3},{id:15,pcb_id:19,title:`Fixed Vbat to 3.3V rail`,description:`Detailed rework analysis for DIO-0019A:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:6,owner_name:`Fiona Gallagher`,pcb_board_number:`DIO-0019A`,image_path:`["this is picture DIO-0019A-R001-PIC-1","this is picture DIO-0019A-R001-PIC-2"]`,rework_type:`Minor`,rework_number:1},{id:16,pcb_id:22,title:`Swapped MID to copper`,description:`Detailed rework analysis for DIO-0022U:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:3,owner_name:`Charlie Brown`,pcb_board_number:`DIO-0022U`,rework_type:`Resistor Swap`,rework_number:1},{id:17,pcb_id:23,title:`Fixed Vbat to 3.3V rail`,description:`Detailed rework analysis for DIO-0023D:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:6,owner_name:`Fiona Gallagher`,pcb_board_number:`DIO-0023D`,rework_type:`Minor`,rework_number:1},{id:18,pcb_id:27,title:`Set clock to external clock`,description:`Detailed rework analysis for DIO-0027Q:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:7,owner_name:`George Costanza`,pcb_board_number:`DIO-0027Q`,rework_type:`Resistor Swap`,rework_number:1},{id:19,pcb_id:29,title:`Silicon Swap to A0 TT`,description:`Detailed rework analysis for DIO-0029H:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:5,owner_name:`Ethan Hunt`,pcb_board_number:`DIO-0029H`,rework_type:`Silicon Swap`,rework_number:1},{id:20,pcb_id:31,title:`Added new Inductors to the board`,description:`Detailed rework analysis for TIT-0001E:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:6,owner_name:`Fiona Gallagher`,pcb_board_number:`TIT-0001E`,image_path:`["this is picture TIT-0001E-R001-PIC-1","this is picture TIT-0001E-R001-PIC-2"]`,rework_type:`Major`,rework_number:1},{id:21,pcb_id:32,title:`Silicon Swap to A0 TT`,description:`Detailed rework analysis for TIT-0002P:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:7,owner_name:`George Costanza`,pcb_board_number:`TIT-0002P`,image_path:`["this is picture TIT-0002P-R001-PIC-1","this is picture TIT-0002P-R001-PIC-2","this is picture TIT-0002P-R001-PIC-3"]`,rework_type:`Silicon Swap`,rework_number:1},{id:22,pcb_id:32,title:`Removed the MDI termination resistors`,description:`Detailed rework analysis for TIT-0002P:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:2,owner_name:`Bob Jones`,pcb_board_number:`TIT-0002P`,rework_type:`Minor`,rework_number:2},{id:23,pcb_id:32,title:`Added test wire`,description:`Detailed rework analysis for TIT-0002P:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:6,owner_name:`Fiona Gallagher`,pcb_board_number:`TIT-0002P`,image_path:`["this is picture TIT-0002P-R001-PIC-1","this is picture TIT-0002P-R001-PIC-2"]`,rework_type:`Minor`,rework_number:3},{id:24,pcb_id:33,title:`Fixed Vbat to 3.3V rail`,description:`Detailed rework analysis for TIT-0003X:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:4,owner_name:`Elena Miller`,pcb_board_number:`TIT-0003X`,rework_type:`Minor`,rework_number:1},{id:25,pcb_id:34,title:`Added test wire`,description:`Detailed rework analysis for TIT-0004G:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:7,owner_name:`George Costanza`,pcb_board_number:`TIT-0004G`,rework_type:`Minor`,rework_number:1},{id:26,pcb_id:35,title:`Replaced Burned 3.3V reg`,description:`Detailed rework analysis for TIT-0005R:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:3,owner_name:`Charlie Brown`,pcb_board_number:`TIT-0005R`,rework_type:`Major`,rework_number:1},{id:27,pcb_id:35,title:`Silicon Swap to A0 TT`,description:`Detailed rework analysis for TIT-0005R:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:7,owner_name:`George Costanza`,pcb_board_number:`TIT-0005R`,rework_type:`Silicon Swap`,rework_number:2},{id:28,pcb_id:35,title:`Fixed Vbat to 3.3V rail`,description:`Detailed rework analysis for TIT-0005R:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:1,owner_name:`Alice Smith`,pcb_board_number:`TIT-0005R`,rework_type:`Minor`,rework_number:3},{id:29,pcb_id:36,title:`Added test wire`,description:`Detailed rework analysis for TIT-0006A:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:2,owner_name:`Bob Jones`,pcb_board_number:`TIT-0006A`,rework_type:`Minor`,rework_number:1},{id:30,pcb_id:37,title:`Added test wire`,description:`Detailed rework analysis for TIT-0007J:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:3,owner_name:`Charlie Brown`,pcb_board_number:`TIT-0007J`,rework_type:`Minor`,rework_number:1},{id:31,pcb_id:37,title:`Set board for GPIO control`,description:`Detailed rework analysis for TIT-0007J:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:1,owner_name:`Alice Smith`,pcb_board_number:`TIT-0007J`,rework_type:`Minor`,rework_number:2},{id:32,pcb_id:37,title:`Set clock to external clock`,description:`Detailed rework analysis for TIT-0007J:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:7,owner_name:`George Costanza`,pcb_board_number:`TIT-0007J`,rework_type:`Resistor Swap`,rework_number:3},{id:33,pcb_id:38,title:`Set board for GPIO control`,description:`Detailed rework analysis for TIT-0008T:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:7,owner_name:`George Costanza`,pcb_board_number:`TIT-0008T`,rework_type:`Minor`,rework_number:1},{id:34,pcb_id:39,title:`Silicon Swap to A0 TT`,description:`Detailed rework analysis for TIT-0009C:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:1,owner_name:`Alice Smith`,pcb_board_number:`TIT-0009C`,image_path:`["this is picture TIT-0009C-R001-PIC-1","this is picture TIT-0009C-R001-PIC-2"]`,rework_type:`Silicon Swap`,rework_number:1},{id:35,pcb_id:40,title:`Set clock to external clock`,description:`Detailed rework analysis for TIT-0010D:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:6,owner_name:`Fiona Gallagher`,pcb_board_number:`TIT-0010D`,rework_type:`Resistor Swap`,rework_number:1},{id:36,pcb_id:41,title:`Added new Inductors to the board`,description:`Detailed rework analysis for TIT-0011N:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:4,owner_name:`Elena Miller`,pcb_board_number:`TIT-0011N`,image_path:`["this is picture TIT-0011N-R001-PIC-1","this is picture TIT-0011N-R001-PIC-2"]`,rework_type:`Major`,rework_number:1},{id:37,pcb_id:42,title:`Replaced Burned 3.3V reg`,description:`Detailed rework analysis for TIT-0012W:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:3,owner_name:`Charlie Brown`,pcb_board_number:`TIT-0012W`,rework_type:`Major`,rework_number:1},{id:38,pcb_id:43,title:`Installed new Osc`,description:`Detailed rework analysis for ATL-0001F:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:1,owner_name:`Alice Smith`,pcb_board_number:`ATL-0001F`,image_path:`["this is picture ATL-0001F-R001-PIC-1","this is picture ATL-0001F-R001-PIC-2"]`,rework_type:`Major`,rework_number:1},{id:39,pcb_id:44,title:`Added new Inductors to the board`,description:`Detailed rework analysis for ATL-0002Q:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:6,owner_name:`Fiona Gallagher`,pcb_board_number:`ATL-0002Q`,image_path:`["this is picture ATL-0002Q-R001-PIC-1","this is picture ATL-0002Q-R001-PIC-2","this is picture ATL-0002Q-R001-PIC-3"]`,rework_type:`Major`,rework_number:1},{id:40,pcb_id:44,title:`Removed the MDI termination resistors`,description:`Detailed rework analysis for ATL-0002Q:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:3,owner_name:`Charlie Brown`,pcb_board_number:`ATL-0002Q`,rework_type:`Minor`,rework_number:2},{id:41,pcb_id:44,title:`Fixed Vbat to 3.3V rail`,description:`Detailed rework analysis for ATL-0002Q:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:3,owner_name:`Charlie Brown`,pcb_board_number:`ATL-0002Q`,image_path:`["this is picture ATL-0002Q-R001-PIC-1","this is picture ATL-0002Q-R001-PIC-2"]`,rework_type:`Minor`,rework_number:3},{id:42,pcb_id:45,title:`Swapped MID to copper`,description:`Detailed rework analysis for ATL-0003Y:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:4,owner_name:`Elena Miller`,pcb_board_number:`ATL-0003Y`,image_path:`["this is picture ATL-0003Y-R001-PIC-1","this is picture ATL-0003Y-R001-PIC-2","this is picture ATL-0003Y-R001-PIC-3"]`,rework_type:`Resistor Swap`,rework_number:1},{id:43,pcb_id:46,title:`Set board for GPIO control`,description:`Detailed rework analysis for ATL-0004H:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:4,owner_name:`Elena Miller`,pcb_board_number:`ATL-0004H`,rework_type:`Minor`,rework_number:1},{id:44,pcb_id:47,title:`Replaced Burned 3.3V reg`,description:`Detailed rework analysis for ATL-0005S:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:2,owner_name:`Bob Jones`,pcb_board_number:`ATL-0005S`,image_path:`["this is picture ATL-0005S-R001-PIC-1","this is picture ATL-0005S-R001-PIC-2","this is picture ATL-0005S-R001-PIC-3"]`,rework_type:`Major`,rework_number:1},{id:45,pcb_id:48,title:`Set clock to external clock`,description:`Detailed rework analysis for ATL-0006B:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:7,owner_name:`George Costanza`,pcb_board_number:`ATL-0006B`,rework_type:`Resistor Swap`,rework_number:1},{id:46,pcb_id:49,title:`Installed new Osc`,description:`Detailed rework analysis for ATL-0007K:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:5,owner_name:`Ethan Hunt`,pcb_board_number:`ATL-0007K`,image_path:`["this is picture ATL-0007K-R001-PIC-1","this is picture ATL-0007K-R001-PIC-2","this is picture ATL-0007K-R001-PIC-3"]`,rework_type:`Major`,rework_number:1},{id:47,pcb_id:49,title:`Installed new Osc`,description:`Detailed rework analysis for ATL-0007K:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:6,owner_name:`Fiona Gallagher`,pcb_board_number:`ATL-0007K`,rework_type:`Major`,rework_number:2},{id:48,pcb_id:49,title:`Installed new Osc`,description:`Detailed rework analysis for ATL-0007K:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:1,owner_name:`Alice Smith`,pcb_board_number:`ATL-0007K`,rework_type:`Major`,rework_number:3},{id:49,pcb_id:50,title:`Replaced Burned 3.3V reg`,description:`Detailed rework analysis for ATL-0008U:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:4,owner_name:`Elena Miller`,pcb_board_number:`ATL-0008U`,rework_type:`Major`,rework_number:1},{id:50,pcb_id:51,title:`Added test wire`,description:`Detailed rework analysis for ATL-0009D:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:1,owner_name:`Alice Smith`,pcb_board_number:`ATL-0009D`,rework_type:`Minor`,rework_number:1},{id:51,pcb_id:52,title:`Added new Inductors to the board`,description:`Detailed rework analysis for ATL-0010E:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:5,owner_name:`Ethan Hunt`,pcb_board_number:`ATL-0010E`,rework_type:`Major`,rework_number:1},{id:52,pcb_id:53,title:`Removed the MDI termination resistors`,description:`Detailed rework analysis for ATL-0011P:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:6,owner_name:`Fiona Gallagher`,pcb_board_number:`ATL-0011P`,image_path:`this is picture ATL-0011P-R001-PIC-1`,rework_type:`Minor`,rework_number:1},{id:53,pcb_id:53,title:`Removed the MDI termination resistors`,description:`Detailed rework analysis for ATL-0011P:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:6,owner_name:`Fiona Gallagher`,pcb_board_number:`ATL-0011P`,image_path:`["this is picture ATL-0011P-R001-PIC-1","this is picture ATL-0011P-R001-PIC-2","this is picture ATL-0011P-R001-PIC-3"]`,rework_type:`Minor`,rework_number:2},{id:54,pcb_id:53,title:`Silicon Swap to A0 TT`,description:`Detailed rework analysis for ATL-0011P:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:6,owner_name:`Fiona Gallagher`,pcb_board_number:`ATL-0011P`,rework_type:`Silicon Swap`,rework_number:3},{id:55,pcb_id:54,title:`Added test wire`,description:`Detailed rework analysis for ATL-0012X:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:6,owner_name:`Fiona Gallagher`,pcb_board_number:`ATL-0012X`,image_path:`["this is picture ATL-0012X-R001-PIC-1","this is picture ATL-0012X-R001-PIC-2"]`,rework_type:`Minor`,rework_number:1},{id:56,pcb_id:55,title:`Set clock to external clock`,description:`Detailed rework analysis for ATL-0013G:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:1,owner_name:`Alice Smith`,pcb_board_number:`ATL-0013G`,image_path:`this is picture ATL-0013G-R001-PIC-1`,rework_type:`Resistor Swap`,rework_number:1},{id:57,pcb_id:56,title:`Silicon Swap to A0 TT`,description:`Detailed rework analysis for ATL-0014R:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:3,owner_name:`Charlie Brown`,pcb_board_number:`ATL-0014R`,rework_type:`Silicon Swap`,rework_number:1},{id:58,pcb_id:57,title:`Added test wire`,description:`Detailed rework analysis for ATL-0015A:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:4,owner_name:`Elena Miller`,pcb_board_number:`ATL-0015A`,image_path:`["this is picture ATL-0015A-R001-PIC-1","this is picture ATL-0015A-R001-PIC-2"]`,rework_type:`Minor`,rework_number:1},{id:59,pcb_id:58,title:`Removed the MDI termination resistors`,description:`Detailed rework analysis for ATL-0016J:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:5,owner_name:`Ethan Hunt`,pcb_board_number:`ATL-0016J`,rework_type:`Minor`,rework_number:1},{id:60,pcb_id:59,title:`Replaced Burned 3.3V reg`,description:`Detailed rework analysis for ATL-0017T:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:2,owner_name:`Bob Jones`,pcb_board_number:`ATL-0017T`,image_path:`["this is picture ATL-0017T-R001-PIC-1","this is picture ATL-0017T-R001-PIC-2"]`,rework_type:`Major`,rework_number:1},{id:61,pcb_id:59,title:`Removed the MDI termination resistors`,description:`Detailed rework analysis for ATL-0017T:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:1,owner_name:`Alice Smith`,pcb_board_number:`ATL-0017T`,image_path:`["this is picture ATL-0017T-R001-PIC-1","this is picture ATL-0017T-R001-PIC-2","this is picture ATL-0017T-R001-PIC-3"]`,rework_type:`Minor`,rework_number:2},{id:62,pcb_id:59,title:`Set board for GPIO control`,description:`Detailed rework analysis for ATL-0017T:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:6,owner_name:`Fiona Gallagher`,pcb_board_number:`ATL-0017T`,image_path:`["this is picture ATL-0017T-R001-PIC-1","this is picture ATL-0017T-R001-PIC-2","this is picture ATL-0017T-R001-PIC-3"]`,rework_type:`Minor`,rework_number:3},{id:63,pcb_id:60,title:`Set clock to external clock`,description:`Detailed rework analysis for ATL-0018C:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:1,owner_name:`Alice Smith`,pcb_board_number:`ATL-0018C`,image_path:`["this is picture ATL-0018C-R001-PIC-1","this is picture ATL-0018C-R001-PIC-2","this is picture ATL-0018C-R001-PIC-3"]`,rework_type:`Resistor Swap`,rework_number:1},{id:64,pcb_id:61,title:`Installed new Osc`,description:`Detailed rework analysis for ATL-0019M:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:3,owner_name:`Charlie Brown`,pcb_board_number:`ATL-0019M`,image_path:`["this is picture ATL-0019M-R001-PIC-1","this is picture ATL-0019M-R001-PIC-2","this is picture ATL-0019M-R001-PIC-3"]`,rework_type:`Major`,rework_number:1},{id:65,pcb_id:62,title:`Silicon Swap to A0 TT`,description:`Detailed rework analysis for ATL-0020N:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:4,owner_name:`Elena Miller`,pcb_board_number:`ATL-0020N`,rework_type:`Silicon Swap`,rework_number:1},{id:66,pcb_id:63,title:`Swapped MID to copper`,description:`Detailed rework analysis for ATL-0021W:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:5,owner_name:`Ethan Hunt`,pcb_board_number:`ATL-0021W`,image_path:`["this is picture ATL-0021W-R001-PIC-1","this is picture ATL-0021W-R001-PIC-2"]`,rework_type:`Resistor Swap`,rework_number:1},{id:67,pcb_id:64,title:`Replaced Burned 3.3V reg`,description:`Detailed rework analysis for ATL-0022F:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:2,owner_name:`Bob Jones`,pcb_board_number:`ATL-0022F`,image_path:`["this is picture ATL-0022F-R001-PIC-1","this is picture ATL-0022F-R001-PIC-2","this is picture ATL-0022F-R001-PIC-3"]`,rework_type:`Major`,rework_number:1},{id:68,pcb_id:65,title:`Installed new Osc`,description:`Detailed rework analysis for ATL-0023Q:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:7,owner_name:`George Costanza`,pcb_board_number:`ATL-0023Q`,rework_type:`Major`,rework_number:1},{id:69,pcb_id:65,title:`Added new Inductors to the board`,description:`Detailed rework analysis for ATL-0023Q:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:6,owner_name:`Fiona Gallagher`,pcb_board_number:`ATL-0023Q`,image_path:`this is picture ATL-0023Q-R001-PIC-1`,rework_type:`Major`,rework_number:2},{id:70,pcb_id:65,title:`Set board for GPIO control`,description:`Detailed rework analysis for ATL-0023Q:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:5,owner_name:`Ethan Hunt`,pcb_board_number:`ATL-0023Q`,rework_type:`Minor`,rework_number:3},{id:71,pcb_id:66,title:`Swapped MID to copper`,description:`Detailed rework analysis for ATL-0024Y:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:5,owner_name:`Ethan Hunt`,pcb_board_number:`ATL-0024Y`,image_path:`["this is picture ATL-0024Y-R001-PIC-1","this is picture ATL-0024Y-R001-PIC-2"]`,rework_type:`Resistor Swap`,rework_number:1},{id:72,pcb_id:66,title:`Fixed Vbat to 3.3V rail`,description:`Detailed rework analysis for ATL-0024Y:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:2,owner_name:`Bob Jones`,pcb_board_number:`ATL-0024Y`,rework_type:`Minor`,rework_number:2},{id:73,pcb_id:66,title:`Installed new Osc`,description:`Detailed rework analysis for ATL-0024Y:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:2,owner_name:`Bob Jones`,pcb_board_number:`ATL-0024Y`,rework_type:`Major`,rework_number:3},{id:74,pcb_id:67,title:`Set clock to external clock`,description:`Detailed rework analysis for ATL-0025H:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:6,owner_name:`Fiona Gallagher`,pcb_board_number:`ATL-0025H`,rework_type:`Resistor Swap`,rework_number:1},{id:75,pcb_id:68,title:`Swapped MID to copper`,description:`Detailed rework analysis for ATL-0026S:

This operation involved extensive root-cause debugging across the downstream signal path. All surrounding passive components have been validated to comply with the base specification, and power integrity tracks tested clean.

Action Taken:
- Applied thermal stress profiling.
- Re-soldered compromised pads.
- Cleaned with flux remover.

Additional notes: Please verify the I2C communications rail before deploying this board into the automated test chamber sequence.`,timestamp:`2026-03-28T20:26:43.497Z`,owner_id:3,owner_name:`Charlie Brown`,pcb_board_number:`ATL-0026S`,image_path:`["this is picture ATL-0026S-R001-PIC-1","this is picture ATL-0026S-R001-PIC-2"]`,rework_type:`Resistor Swap`,rework_number:1}],demoTags:[{id:1,name:`Team Alice`,color:`#ec4899`,owner_id:1,type:`public`},{id:2,name:`Team Bob`,color:`#14b8a6`,owner_id:2,type:`public`},{id:3,name:`Damaged`,color:`#ef4444`,owner_id:1,type:`public`},{id:4,name:`Silicon Not Installed`,color:`#f59e0b`,owner_id:2,type:`public`}],demoPcbTags:{1:[1,3,4],2:[2],4:[1],6:[2,3],7:[1],8:[4],10:[1,2],11:[3],13:[1],14:[2],15:[4],16:[1,3],18:[2],19:[1],21:[3],22:[1,2,4],25:[1],26:[2,3],28:[1],29:[4],30:[2],31:[1,3],34:[1,2],36:[3,4],37:[1],38:[2],40:[1],41:[3],42:[2],43:[1,4],46:[1,2,3],49:[1],50:[2,4],51:[3],52:[1],54:[2],55:[1],56:[3],57:[4],58:[1,2],61:[1,3],62:[2],64:[1,4],66:[2,3],67:[1]}},y=`http://${window.location.hostname}:5002/api`,b=[...v.demoProjects],x=[...v.demoPcbs],S=[...v.demoOwners],C=[],w=1;b.forEach(e=>{C.push({id:w++,project_id:e.id,filename:`BBB-SCH.pdf`,path:`/docs/BBB-SCH.pdf`,uploaded_at:new Date(Date.now()-7200*60*1e3).toISOString()}),C.push({id:w++,project_id:e.id,filename:`BBB.brd`,path:`/docs/BBB.brd`,uploaded_at:new Date(Date.now()-2880*60*1e3).toISOString()})});var T={},E=v.demoReworks.map(e=>(T[e.pcb_id]||(T[e.pcb_id]=0),T[e.pcb_id]++,{...e,rework_number:e.rework_number||T[e.pcb_id]})),D=[...v.demoTags],O={...v.demoPcbTags},k=e=>new Promise(t=>setTimeout(t,e));function A(e,t=200){return{ok:t>=200&&t<300,status:t,json:async()=>e}}var j=new Map,M=Promise.resolve();async function N(e,t){if(!p.getState().isDemoMode){let{currentUser:n,currentUserRole:r}=H.getState(),i=new Headers(t?.headers),a=n?.username||(r===`Super User`?`admin`:`guest`),o=n?.name||(r===`Super User`?`Super User`:`Guest`);i.set(`X-User-Username`,a),i.set(`X-User-Name`,o),i.set(`X-User-Role`,r);let s=g();return s&&(i.set(`Authorization`,`Bearer ${s}`),i.set(`X-Session-Token`,s)),fetch(e,{...t,headers:i})}let n=t?.method||`GET`;if(n===`GET`)return P(e,t);let r=``;t?.body&&(typeof t.body==`string`?r=t.body:t.body instanceof FormData&&(r=JSON.stringify(Object.fromEntries(t.body.entries()))));let i=`${n}:${e}:${r}`;if(j.has(i)){console.log(`[Demo Deduplicate] Duplicate request detected: ${i}`);let e=j.get(i);return e.response?(console.log(`[Demo Deduplicate] Returning cached response for key: ${i}`),Promise.resolve(e.response)):new Promise(t=>{e.listeners.push(t)})}let a={listeners:[],response:null};return j.set(i,a),new Promise((n,r)=>{M=M.then(async()=>{try{let r=await P(e,t);a.response=r,setTimeout(()=>{j.delete(i)},3e3),n(r),a.listeners.forEach(e=>{e(r)})}catch(e){j.delete(i),r(e),a.listeners.forEach(t=>{t(A({error:e instanceof Error?e.message:String(e)},500))})}})})}async function P(e,t){await k(300);let n=e;e.includes(`/api/`)&&(n=`/`+e.split(`/api/`)[1]);let r=t?.method||`GET`,i=null;if(t?.body&&(i=typeof t.body==`string`?JSON.parse(t.body):t.body instanceof FormData?Object.fromEntries(t.body.entries()):t.body),n.startsWith(`/dashboard`)&&r===`GET`)return A({projects:b.length,pcbs:x.length,owners:S.length,reworks:E.length,tags:D.length});if(n.startsWith(`/projects`)){let e=n.split(`/`);if(e.length===5&&e[3]===`docs`){let t=parseInt(e[2]),n=parseInt(e[4]);if(r===`DELETE`)return C=C.filter(e=>!(e.id===n&&e.project_id===t)),A({message:`Document deleted`})}if(e.length===4&&e[3]===`docs`){let n=parseInt(e[2]);if(r===`GET`)return A(C.filter(e=>e.project_id===n));if(r===`POST`){let e=[];if(t?.body&&t.body instanceof FormData)for(let[,r]of t.body.entries()){let t=r;if(t&&typeof t==`object`&&t.name){let r={id:Date.now()+Math.floor(Math.random()*1e3)+e.length,project_id:n,filename:t.name,path:`/docs/demo_doc.pdf`,uploaded_at:new Date().toISOString()};C.push(r),e.push(r)}}if(e.length===0){let t={id:Date.now(),project_id:n,filename:`datasheet_revA.pdf`,path:`/docs/demo_doc.pdf`,uploaded_at:new Date().toISOString()};C.push(t),e.push(t)}return A(e,201)}}if(r===`GET`){if(e.length===3&&e[2]){let t=parseInt(e[2]),n=b.find(e=>e.id===t);if(n){let e=C.filter(e=>e.project_id===n.id).length;return A({...n,doc_count:e})}return A({error:`Not found`},404)}return A(b.map(e=>{let t=C.filter(t=>t.project_id===e.id).length;return{...e,doc_count:t}}))}if(r===`POST`){let e={id:Date.now(),...i,pcb_count:0,pcbs:[]};return b.push(e),A(e,201)}if(r===`PUT`){let t=parseInt(e.pop()||`0`);return b=b.map(e=>e.id===t?{...e,...i}:e),A({message:`Project updated`})}if(r===`DELETE`){let t=parseInt(e.pop()||`0`);return b=b.filter(e=>e.id!==t),A({message:`Project deleted`})}}if(n.startsWith(`/pcbs`)){if(r===`GET`){let e=n.split(`/`);if(e.length===4&&e[3]===`tags`){let t=O[parseInt(e[2])]||[];return A(D.filter(e=>t.includes(e.id)).map(e=>{let t=S.find(t=>String(t.id)===String(e.owner_id));return t?{...e,owner_name:t.name,owner_username:t.username}:e}))}if(e.length===3&&e[2]){let t=parseInt(e[2]),n=x.find(e=>e.id===t);return A(n||{error:`Not found`},n?200:404)}return A(x.map(e=>{let t=S.find(t=>String(t.id)===String(e.owner_id)||t.name===e.owner);return{...e,product:e.product_name_and_rev||e.product,tag_ids:O[e.id]||[],owner_username:e.owner_username||(t?t.username:void 0)}}))}if(r===`POST`){let e=n.split(`/`);if(e.length===4&&e[3]===`tags`){let t=parseInt(e[2]),n=parseInt(i.tag_id);return O[t]||(O[t]=[]),O[t].includes(n)||O[t].push(n),A({message:`Tag attached`},201)}let t=b.find(e=>e.id===parseInt(i.project_id)),r=S.find(e=>e.id===parseInt(i.owner_id)),a={id:Date.now(),...i,project:t?t.name:`Unknown`,owner:r?r.name:`Unassigned`,owner_username:r?r.username:void 0};return t&&(t.pcb_count=(t.pcb_count||0)+1,t.pcbs||=[],t.pcbs.push(a.board_number)),r&&(r.pcb_count=(r.pcb_count||0)+1),x.push(a),A(a,201)}if(r===`PUT`){let e=parseInt(n.split(`/`).pop()||`0`);return x=x.map(t=>t.id===e?{...t,...i}:t),A({message:`PCB updated`})}if(r===`DELETE`){let e=n.split(`/`);if(e.length===5&&e[3]===`tags`){let t=parseInt(e[2]),n=parseInt(e[4]);return O[t]&&(O[t]=O[t].filter(e=>e!==n)),A({message:`Tag detached`})}let t=parseInt(n.split(`/`).pop()||`0`);return x=x.filter(e=>e.id!==t),A({message:`PCB deleted`})}}if(n.startsWith(`/owners`)){if(r===`GET`){let e=n.split(`/`);if(e.length===3&&e[2]){let t=parseInt(e[2]),n=S.find(e=>e.id===t);return A(n||{error:`Not found`},n?200:404)}return A(S)}if(r===`POST`){let e={id:Date.now(),...i,pcb_count:0,rework_count:0,tag_count:0};return S.push(e),A(e,201)}if(r===`PUT`){let e=parseInt(n.split(`/`).pop()||`0`);return S=S.map(t=>t.id===e?{...t,...i}:t),A({message:`Owner updated`})}if(r===`DELETE`){let e=parseInt(n.split(`/`).pop()||`0`);return S=S.filter(t=>t.id!==e),A({message:`Owner deleted`})}if(r===`PATCH`&&n.includes(`/role`)){let e=parseInt(n.split(`/`)[2]||`0`),{role:t}=i;return S=S.map(n=>n.id===e?{...n,is_super_user:t===`Super User`?1:0}:n),A({success:!0,role:t})}}if(n.startsWith(`/reworks`)){if(r===`GET`){let e=n.split(`/`);if(e.length===3&&e[2]){let t=parseInt(e[2]),n=E.find(e=>e.id===t);if(n){let e=S.find(e=>String(e.id)===String(n.owner_id));return A(e?{...n,owner_name:e.name,owner_username:e.username}:n)}return A({error:`Not found`},404)}return A(E.map(e=>{let t=S.find(t=>String(t.id)===String(e.owner_id));return t?{...e,owner_name:t.name,owner_username:t.username}:e}))}if(r===`POST`){let e=parseInt(i.pcb_id),t=x.find(t=>t.id===e),n=E.filter(t=>t.pcb_id===e||t.pcb_id===String(e)),r=1;if(n.length>0){let e=[...n].sort((e,t)=>t.id-e.id)[0];r=e&&e.rework_number?e.rework_number+1:n.length+1}let a=S.find(e=>e.id===parseInt(i.owner_id)),o={id:Date.now(),timestamp:new Date().toISOString(),...i,pcb_id:e,owner_id:parseInt(i.owner_id),rework_number:r,owner_name:a?a.name:`Unknown`,owner_username:a?a.username:void 0};return a&&(a.rework_count=(a.rework_count||0)+1),i.new_product&&t&&(t.product=i.new_product,t.product_name_and_rev=i.new_product),E.push(o),A(o,201)}if(r===`PUT`){let e=parseInt(n.split(`/`).pop()||`0`),t=E.find(t=>t.id===e);if(!t)return A({error:`Rework not found`},404);let r=999;if(t.timestamp){let e=t.timestamp.includes(`T`)?t.timestamp:t.timestamp.replace(` `,`T`)+`Z`,n=new Date(e);isNaN(n.getTime())||(r=(Date.now()-n.getTime())/(1e3*60*60*24))}if(r>14)return A({error:`Rework log is older than 2 weeks and cannot be edited.`},400);if(E=E.map(t=>t.id===e?{...t,...i}:t),i.rework_type===`Silicon Swap`&&i.new_product&&i.pcb_id){let e=x.find(e=>e.id===parseInt(i.pcb_id));e&&(e.product=i.new_product,e.product_name_and_rev=i.new_product)}return A({message:`Rework updated`})}if(r===`DELETE`){let e=parseInt(n.split(`/`).pop()||`0`),t=E.find(t=>t.id===e);if(!t)return A({error:`Rework not found`},404);if(E.some(n=>n.pcb_id===t.pcb_id&&n.id>e))return A({error:`Cannot delete rework because there are newer rework logs after it on this board.`},400);let r=999;if(t.timestamp){let e=t.timestamp.includes(`T`)?t.timestamp:t.timestamp.replace(` `,`T`)+`Z`,n=new Date(e);isNaN(n.getTime())||(r=(Date.now()-n.getTime())/(1e3*60*60*24))}return r>3?A({error:`Cannot delete rework because it was created more than 3 days ago.`},400):(E=E.filter(t=>t.id!==e),A({message:`Rework deleted`}))}}if(n.startsWith(`/tags`)){if(r===`GET`){let e=n.split(`/`);if(e.length===4&&e[3]===`pcbs`){let t=parseInt(e[2]),n=Object.keys(O).filter(e=>O[parseInt(e)].includes(t)).map(Number);return A(x.filter(e=>n.includes(e.id)).map(e=>{let t=b.find(t=>t.id===e.project_id);return{...e,project_name:t?.name,project_key:t?.project_key}}))}if(e.length===3&&e[2]){let t=parseInt(e[2]),n=D.find(e=>e.id===t);return A(n||{error:`Not found`},n?200:404)}return A(D.map(e=>{let t=S.find(t=>String(t.id)===String(e.owner_id)),n=Object.values(O).filter(t=>t.includes(e.id)).length;return{...e,pcb_count:n,...t?{owner_name:t.name,owner_username:t.username}:{}}}))}if(r===`POST`){let e={id:Date.now(),...i,pcb_count:0};return D.push(e),A(e,201)}if(r===`PUT`){let e=parseInt(n.split(`/`).pop()||`0`);return D=D.map(t=>t.id===e?{...t,...i}:t),A({message:`Tag updated`})}if(r===`DELETE`){let e=parseInt(n.split(`/`).pop()||`0`);return D=D.filter(t=>t.id!==e),A({message:`Tag deleted`})}}return n.startsWith(`/otp/verify`)?A({valid:!0,token:`demo-session-token`}):n.startsWith(`/otp/setup`)?A({secret:`JBSWY3DPEHPK3PXP`,otpauthUrl:`otpauth://totp/ReworkTracker:demo?secret=JBSWY3DPEHPK3PXP`}):A({error:`Not found in demo mode`},404)}var F=c((e,t)=>({pcbs:[],loading:!1,hasFetched:!1,error:null,selectedProjects:[],selectedRevisions:[],selectedFlavors:[],selectedPcbRevs:[],selectedCorners:[],selectedTags:[],requiredTags:[],selectedOwners:[],selectedBoardNumbers:[],selectedBoms:[],setSelectedProjects:t=>e({selectedProjects:t}),setSelectedRevisions:t=>e({selectedRevisions:t}),setSelectedFlavors:t=>e({selectedFlavors:t}),setSelectedPcbRevs:t=>e({selectedPcbRevs:t}),setSelectedCorners:t=>e({selectedCorners:t}),setSelectedTags:t=>e({selectedTags:t}),setRequiredTags:t=>e({requiredTags:t}),setSelectedOwners:t=>e({selectedOwners:t}),setSelectedBoardNumbers:t=>e({selectedBoardNumbers:t}),setSelectedBoms:t=>e({selectedBoms:t}),resetFilters:()=>e({selectedProjects:[],selectedRevisions:[],selectedFlavors:[],selectedPcbRevs:[],selectedCorners:[],selectedTags:[],requiredTags:[],selectedOwners:[],selectedBoardNumbers:[],selectedBoms:[]}),fetchPcbs:async()=>{e({loading:!0,error:null});try{let t=await N(`${y}/pcbs`);if(!t.ok)throw Error(`Failed to fetch pcbs`);e({pcbs:await t.json(),loading:!1,hasFetched:!0})}catch(t){e({error:t.message,loading:!1,hasFetched:!0})}},addPcb:async n=>{e({loading:!0,error:null});try{let r=await N(`${y}/pcbs`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(n)}),i=await r.json();return r.ok?(await t().fetchPcbs(),!0):(e({error:i.error||`Failed to add pcb`,loading:!1}),!1)}catch(t){return e({error:t.message,loading:!1}),!1}},updatePcb:async(n,r)=>{e({loading:!0,error:null});try{let i=await N(`${y}/pcbs/${n}`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify(r)}),a=await i.json();return i.ok?(await t().fetchPcbs(),!0):(e({error:a.error||`Failed to update pcb`,loading:!1}),!1)}catch(t){return e({error:t.message,loading:!1}),!1}},deletePcb:async n=>{e({loading:!0,error:null});try{let r=t().pcbs.find(e=>e.id.toString()===n.toString())?.board_number;return(await N(`${y}/pcbs/${n}`,{method:`DELETE`})).ok?(r&&H.getState().expandedPcb===r&&H.getState().setExpandedPcb(null),e({pcbs:t().pcbs.filter(e=>e.id.toString()!==n.toString()),loading:!1}),!0):(e({error:`Failed to delete pcb`,loading:!1}),!1)}catch(t){return e({error:t.message,loading:!1}),!1}}})),I=c((e,t)=>({reworks:[],loading:!1,error:null,selectedBoards:[],setSelectedBoards:t=>e({selectedBoards:t}),resetFilters:()=>e({selectedBoards:[]}),fetchReworks:async()=>{e({loading:!0,error:null});try{let t=await N(`${y}/reworks`);if(!t.ok)throw Error(`Failed to fetch reworks`);e({reworks:await t.json(),loading:!1})}catch(t){e({error:t.message,loading:!1})}},addRework:async n=>{e({loading:!0,error:null});try{let r=n instanceof FormData,i=await N(`${y}/reworks`,{method:`POST`,...r?{}:{headers:{"Content-Type":`application/json`}},body:r?n:JSON.stringify(n)}),a=await i.json();return i.ok?(await t().fetchReworks(),!0):(e({error:a.error||`Failed to add rework`,loading:!1}),!1)}catch(t){return e({error:t.message,loading:!1}),!1}},updateRework:async(n,r)=>{e({loading:!0,error:null});try{let i=await N(`${y}/reworks/${n}`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify(r)}),a=await i.json();return i.ok?(await t().fetchReworks(),!0):(e({error:a.error||`Failed to update rework`,loading:!1}),!1)}catch(t){return e({error:t.message,loading:!1}),!1}},deleteRework:async n=>{e({loading:!0,error:null});try{let r=await N(`${y}/reworks/${n}`,{method:`DELETE`});return r.ok?(e({reworks:t().reworks.filter(e=>e.id.toString()!==n.toString()),loading:!1}),!0):(e({error:(await r.json().catch(()=>({}))).error||`Failed to delete rework`,loading:!1}),!1)}catch(t){return e({error:t.message,loading:!1}),!1}}})),L=c((e,t)=>({tags:[],loading:!1,error:null,selectedTagTypes:[],selectedTagOwners:[],setSelectedTagTypes:t=>e({selectedTagTypes:t}),setSelectedTagOwners:t=>e({selectedTagOwners:t}),resetFilters:()=>e({selectedTagTypes:[],selectedTagOwners:[]}),fetchTags:async()=>{e({loading:!0,error:null});try{let t=await N(`${y}/tags`);if(!t.ok)throw Error(`Failed to fetch tags`);e({tags:await t.json(),loading:!1})}catch(t){e({error:t.message,loading:!1})}},addTag:async n=>{e({loading:!0,error:null});try{let r=await N(`${y}/tags`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(n)}),i=await r.json();return r.ok?(await t().fetchTags(),!0):(e({error:i.error||`Failed to add tag`,loading:!1}),!1)}catch(t){return e({error:t.message,loading:!1}),!1}},updateTag:async(n,r)=>{e({loading:!0,error:null});try{let i=await N(`${y}/tags/${n}`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify(r)}),a=await i.json();return i.ok?(await t().fetchTags(),!0):(e({error:a.error||`Failed to update tag`,loading:!1}),!1)}catch(t){return e({error:t.message,loading:!1}),!1}},deleteTag:async n=>{e({loading:!0,error:null});try{return(await N(`${y}/tags/${n}`,{method:`DELETE`})).ok?(e({tags:t().tags.filter(e=>e.id.toString()!==n.toString()),loading:!1}),!0):(e({error:`Failed to delete tag`,loading:!1}),!1)}catch(t){return e({error:t.message,loading:!1}),!1}}})),R=e=>{if(!e||!e.name)return``;let t=e.name.trim().replace(/\s+/g,`-`);return e.type===`public`?t:e.owner_username?`${e.owner_username}/${t}`:e.owner_name?`${e.owner_name}/${t}`:t},z=null,B=`Guest`;function V(){if(typeof window<`u`){let e=window.location.hash||``;if(e.includes(`nato`))return`nato`;if(e.includes(`letter`))return`letter`;let t=new URLSearchParams(window.location.search);if(t.get(`crc`)===`nato`)return`nato`;if(t.get(`crc`)===`letter`)return`letter`}return`letter`}var H=c()(d((e,t)=>({page:`projects`,activeTab:`projects`,selectedId:null,isMobile:typeof window<`u`?window.innerWidth<=768:!1,expandedProject:null,expandedPcb:null,expandedRework:null,isolatedView:!1,qrModalBoard:null,mistypedUrl:null,correctedUrl:null,searchQuery:``,showFilters:!1,showMobileSearch:!1,currentUser:z,currentUserRole:B,crcFormat:V(),allowGuestMinorRework:!0,setCrcFormat:n=>{e({crcFormat:n});let{currentUser:r,currentUserRole:i}=t();r&&i!==`Guest`&&N(`${y}/owners/${r.id}`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify({name:r.name,username:r.username,email:r.email,crc_format:n})}).then(e=>{if(e.ok){let e={...r,crc_format:n};t().setCurrentUser(e,i)}}).catch(e=>{console.error(`Failed to sync crc_format setting to DB:`,e)})},toggleCrcFormat:()=>{let e=t().crcFormat===`letter`?`nato`:`letter`;t().setCrcFormat(e)},setAllowGuestMinorRework:t=>{e({allowGuestMinorRework:t}),N(`${y}/settings`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({allowGuestMinorRework:t?`true`:`false`})}).catch(e=>{console.error(`Failed to save allowGuestMinorRework to DB:`,e)})},resetSettings:()=>{e({crcFormat:V(),allowGuestMinorRework:!0}),N(`${y}/settings`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({crcFormat:V(),allowGuestMinorRework:`true`})}).catch(e=>{console.error(`Failed to reset DB settings:`,e)})},setCurrentUser:(t,n)=>{e({currentUser:t,currentUserRole:n}),t&&t.crc_format?e({crcFormat:t.crc_format}):t||e({crcFormat:`letter`}),typeof window<`u`&&n===`Guest`&&_()},setPage:t=>e({page:t}),setIsolatedView:t=>e({isolatedView:t}),setExpandedProject:t=>{e({expandedProject:t})},setExpandedPcb:t=>{e({expandedPcb:t})},setExpandedRework:t=>{e({expandedRework:t})},setQrModalBoard:t=>e({qrModalBoard:t}),setMistypedUrl:t=>e({mistypedUrl:t}),setCorrectedUrl:t=>e({correctedUrl:t}),setSearchQuery:t=>e({searchQuery:t}),setShowFilters:t=>e({showFilters:t}),setShowMobileSearch:t=>e({showMobileSearch:t}),setActiveTab:t=>{F.getState().resetFilters(),I.getState().resetFilters(),L.getState().resetFilters(),e({activeTab:t,page:t,selectedId:null,expandedProject:null,expandedPcb:null,expandedRework:null,searchQuery:``,showFilters:!1,showMobileSearch:!1})},editItem:(t,n)=>e({page:t,selectedId:n}),addItem:(n,r)=>{let i=n.split(`_`)[0];if(typeof window<`u`&&t().activeTab!==i){e({activeTab:i,page:n,selectedId:r||null});return}e({page:n,selectedId:r||null})},goBack:()=>e(e=>({page:e.activeTab,selectedId:null})),setIsMobile:t=>e({isMobile:t})}),{name:`pcb-rework-tracker-global-settings`,partialize:e=>({crcFormat:e.crcFormat,allowGuestMinorRework:e.allowGuestMinorRework,currentUser:e.currentUser,currentUserRole:e.currentUserRole}),onRehydrateStorage:()=>e=>{e&&!g()&&e.currentUserRole!==`Guest`&&e.setCurrentUser(null,`Guest`)},storage:l(()=>typeof window<`u`&&window.localStorage?window.localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}})}));typeof window<`u`&&window.addEventListener(`resize`,()=>{let e=window.innerWidth<=768;H.getState().isMobile!==e&&H.getState().setIsMobile(e)});export{F as a,h as c,I as i,m as l,R as n,y as o,L as r,N as s,H as t,c as u};