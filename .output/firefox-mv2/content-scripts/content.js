var content=(function(){"use strict";const b=globalThis.browser?.runtime?.id?globalThis.browser:globalThis.chrome;function qe(i){return i}const gt=180,yt=180,xt=260,mt=190,h=i=>typeof i=="object"&&i!==null,S=i=>!h(i)||!h(i.stencil)||typeof i.stencil.id!="string"?"":i.stencil.id,q=i=>{const t=i.toLowerCase();return t.includes("flow")||t.includes("association")||t.includes("connection")||t.includes("link")},F=i=>!h(i)||!Array.isArray(i.childShapes)?[]:i.childShapes,wt=i=>{const t=[],e=[...i];for(;e.length>0;){const r=e.pop();if(h(r)&&(t.push(r),Array.isArray(r.childShapes)))for(const s of r.childShapes)e.push(s)}return t},R=i=>structuredClone(i),X=i=>{const t=new Set;for(const e of i)typeof e.resourceId=="string"&&e.resourceId.trim()&&t.add(e.resourceId);return t},kt=i=>{const t=new Map;for(const e of i){const r=crypto.randomUUID().replace(/-/g,"").slice(0,12);t.set(e,`sid-${r}`)}return t},H=(i,t)=>{if(Array.isArray(i))return i.map(r=>H(r,t));if(!h(i))return i;const e={};for(const[r,s]of Object.entries(i)){if(r==="resourceId"&&typeof s=="string"&&t.has(s)){e[r]=t.get(s);continue}e[r]=H(s,t)}return e},bt=i=>{if(!Array.isArray(i.childShapes))return;let t=0;for(const e of i.childShapes){if(!h(e))continue;const r=S(e);if(q(r)||!h(e.bounds))continue;const s=e.bounds;if(!h(s.upperLeft)||!h(s.lowerRight))continue;const n=s.upperLeft,a=s.lowerRight,o=typeof a.x=="number"&&typeof n.x=="number"?Math.max(40,a.x-n.x):120,c=typeof a.y=="number"&&typeof n.y=="number"?Math.max(40,a.y-n.y):80,l=gt+t%3*xt,d=yt+Math.floor(t/3)*mt;s.upperLeft={x:l,y:d},s.lowerRight={x:l+o,y:d+c},t+=1}},vt=i=>{const t=F(i).filter(h);return t.length===0?null:t.find(r=>!q(S(r)))??t[0]??null},Ct=i=>!i||!h(i.properties)?null:i.properties,St=["name","title","text","documentation","description","conditionexpression","conditionExpression","condition","taskname","subject","label","caption"],Et=i=>i.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim(),Tt=new Set(["task","usertask","manualtask","servicetask","webservice","scripttask","sendtask","receivetask","businessruletask","callactivity","automatic","bpmn"]),It=i=>i.toLowerCase().replace(/[^a-z0-9]/g,""),Lt=i=>{const t=It(i);return Tt.has(t)},At=i=>{if(!i)return"";for(const t of St){const e=i[t];if(typeof e=="string"){const r=Et(e);if(r.length>0&&!Lt(r))return r}}return""},Mt=(i,t)=>{if(!i)return"";for(const e of t){const r=i[e];if(typeof r=="string"&&r.trim())return r.trim()}return""},Nt=(i,t)=>{if(!i)return null;for(const e of t){const r=i[e];if(typeof r=="boolean")return r;if(typeof r=="number")return r!==0;if(typeof r=="string"){const s=r.trim().toLowerCase();if(["true","yes","1"].includes(s))return!0;if(["false","no","0"].includes(s))return!1}}return null},qt=(i,t)=>{const e=i.toLowerCase(),r=Mt(t,["tasktype","type","activitytype","implementation","trigger"]).toLowerCase(),s=`${e} ${r}`;return s.includes("callactivity")||s.includes("call activity")?"call-activity":s.includes("servicetask")||s.includes("service task")||s.includes("service")||s.includes("webservice")?"service":s.includes("usertask")||s.includes("user task")||s.includes("user")?"user":s.includes("manualtask")||s.includes("manual task")||s.includes("manual")?"manual":s.includes("scripttask")||s.includes("script task")||s.includes("script")?"script":s.includes("sendtask")||s.includes("send task")||s.includes("send")?"send":s.includes("receivetask")||s.includes("receive task")||s.includes("receive")?"receive":s.includes("businessruletask")||s.includes("business rule")||s.includes("decision")?"business-rule":s.includes("automatic")||s.includes("auto")?"automatic":"default"},Ft=i=>u(i,["timer"])?"Timer":u(i,["message"])?"Message":u(i,["signal"])?"Signal":u(i,["conditional"])?"Conditional":u(i,["linkevent"," link "])?"Link":u(i,["multiple"])?"Multiple":u(i,["escalation"])?"Escalation":u(i,["error"])?"Error":u(i,["compensation"])?"Compensation":u(i,["terminate"])?"Terminate":u(i,["cancel"])?"Cancel":"",Rt=(i,t,e)=>{const r=i.toLowerCase(),s=Object.values(e??{}).filter(o=>typeof o=="string").join(" ").toLowerCase(),n=`${r} ${s}`,a=Ft(n);return r.includes("transaction")?"Transaction":r.includes("subprocess")?"Subprocess":r.includes("parallelgateway")?"Parallel Gateway":r.includes("inclusivegateway")?"Inclusive Gateway":r.includes("eventbasedgateway")?"Event-Based Gateway":r.includes("complexgateway")?"Complex Gateway":r.includes("gateway")?"Exclusive Gateway":r.includes("startevent")?a?`Start ${a} Event`:"Start Event":r.includes("endevent")?a?`End ${a} Event`:"End Event":r.includes("boundaryevent")?a?`Boundary ${a} Event`:"Boundary Event":r.includes("intermediate")||r.includes("event")?a?`Intermediate ${a} Event`:"Intermediate Event":r.includes("messageflow")?"Message Flow":r.includes("sequenceflow")?"Sequence Flow":r.includes("association")?"Association":r.includes("dataobject")?"Data Object":r.includes("datastore")?"Data Store":r.includes("annotation")?"Text Annotation":r.includes("group")?"Group":r.includes("pool")||r.includes("lane")||r.includes("participant")?"Pool/Lane":r.includes("task")||r.includes("activity")||r.includes("callactivity")?t==="service"?"Service Task":t==="user"?"User Task":t==="manual"?"Manual Task":t==="script"?"Script Task":t==="send"?"Send Task":t==="receive"?"Receive Task":t==="business-rule"?"Business Rule Task":t==="call-activity"?"Call Activity":t==="automatic"?"Automatic Task":"Task":"Component"},Ot=(i,t)=>(i.match(/[^\s]+/g)??[]).slice(0,t).join(" ").trim(),u=(i,t)=>t.some(e=>i.includes(e)),Dt=i=>{const t=new Set,e=[];for(const r of i)t.has(r)||(t.add(r),e.push(r));return e},tt=i=>{const t=F(i).filter(h);let e=0;for(const r of t)q(S(r))||(e+=1);return e};function $t(i,t=3){const e=F(i).filter(h),r=[];for(const s of e){const n=S(s);if(!(!n||q(n))&&(r.push(n),r.length>=t))break}return r}function E(i){const t=vt(i),e=S(t),r=Ct(t),s=At(r),n=s.length>0,a=qt(e,r),o=Rt(e,a,r);return{stencilId:e,hasContent:n,contentText:s,taskVariant:a,typeName:o,properties:r}}function et(i){const t=E(i),e=[],r=t.stencilId.toLowerCase(),s=Object.values(t.properties??{}).filter(o=>typeof o=="string").join(" ").toLowerCase(),n=`${r} ${s}`;return t.hasContent&&e.push("content"),tt(i)>1&&e.push("multi-element"),u(n,["timer"])&&e.push("timer"),u(n,["message"])&&e.push("message"),u(n,["conditional"])&&e.push("conditional"),u(n,["linkevent"," link "])&&e.push("link"),u(n,["multiple"])&&e.push("multiple"),u(n,["multi","multiple"])&&(u(n,["parallel"])&&e.push("mi-parallel"),u(n,["sequential","serial"])&&e.push("mi-sequential")),u(n,["loop"])&&e.push("loop"),u(n,["adhoc","ad hoc"])&&e.push("adhoc"),u(n,["transaction"])&&e.push("transaction"),(Nt(t.properties,["isinterrupting","interrupting"])===!1||u(n,["noninterrupting","non-interrupting"]))&&e.push("non-interrupting"),Dt(e)}function Bt(i){const t=E(i).taskVariant;return t==="default"?null:t}const V=(i,t,e)=>{if(Array.isArray(i)){for(const r of i)V(r,t,e);return}if(h(i)&&!e.has(i)){e.add(i),typeof i.resourceId=="string"&&h(i.stencil)&&typeof i.stencil.id=="string"&&t.push(i);for(const r of Object.values(i))V(r,t,e)}},O=(i,t,e)=>{if(typeof i=="string")return t.has(i);if(Array.isArray(i))return i.some(r=>O(r,t,e));if(!h(i)||e.has(i))return!1;e.add(i);for(const r of Object.values(i))if(O(r,t,e))return!0;return!1},Wt=i=>{if(!Array.isArray(i.childShapes)||!h(i.linked))return;const t=i.childShapes.filter(h),e=X(t),r=[];if(V(i.linked,r,new WeakSet),r.length===0)return;const s=r.filter(c=>S(c).toLowerCase().includes("annotation")),n=new Set;for(const c of s)typeof c.resourceId=="string"&&c.resourceId.trim()&&n.add(c.resourceId);const a=r.filter(c=>S(c).toLowerCase().includes("association")),o=[];for(const c of s)o.push(c);for(const c of a){const l=O(c,n,new WeakSet),d=O(c,e,new WeakSet);(l||d)&&o.push(c)}for(const c of o)typeof c.resourceId!="string"||!c.resourceId.trim()||e.has(c.resourceId)||(i.childShapes.push(R(c)),e.add(c.resourceId))};function it(i){if(!h(i)||!Array.isArray(i.childShapes))return R(i);const t=R(i);return Wt(t),t}function zt(i){const t=E(i),e=tt(i);let r=t.typeName||"Favorite snippet";if(t.hasContent){const s=Ot(t.contentText,2);s&&(r=`${t.typeName}: ${s}`)}return e>1?`${r}, more...`:r}function Pt(i){if(!h(i)||!Array.isArray(i.childShapes))return R(i);const t=it(i),e=wt(F(t)),r=X(e),s=kt(r),n=H(t,s);return h(n)&&(n.useOffset=!1,bt(n)),n}const rt="favorites",st="favoritesBackups",nt="lastCapture",_="sigtastic.favorites.mirror.v1",U="bpkeys.favorites.mirror.v1",Ht=6,D=i=>structuredClone(i),v=i=>i.trim().replace(/\s+/g," "),Vt=i=>i.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),_t=(i,t)=>{const e=v(i);if(!e)return"Favorite";if(!t.some(l=>v(l.name).toLowerCase()===e.toLowerCase()))return e;const s=e.match(/^(.*?)(?:\s+(\d+))?$/),n=v(s?.[1]??e),a=new RegExp(`^${Vt(n)}(?:\\s+(\\d+))?$`,"i"),o=new Set;for(const l of t){const p=v(l.name).match(a);p&&p[1]&&o.add(Number(p[1]))}let c=1;for(;o.has(c);)c+=1;return`${n} ${c}`},Ut=i=>[...i].sort((t,e)=>t.order!==e.order?t.order-e.order:t.createdAt-e.createdAt),G=i=>Ut(i).map((t,e)=>({...t,order:e})),Gt=i=>{if(!i||typeof i!="object")return!1;const t=i;return typeof t.id=="string"&&typeof t.name=="string"&&"payload"in t&&typeof t.namespace=="string"&&typeof t.order=="number"&&typeof t.createdAt=="number"&&typeof t.updatedAt=="number"},K=i=>Array.isArray(i)?i.filter(Gt).map(t=>D(t)):[],Kt=i=>Array.isArray(i)?i.map(t=>{if(!t||typeof t!="object")return null;const e=t;if(typeof e.savedAt!="number")return null;const r=K(e.favorites);return r.length===0?null:{savedAt:e.savedAt,favorites:r}}).filter(t=>!!t).sort((t,e)=>e.savedAt-t.savedAt):[],ot=()=>{try{if(typeof window<"u"&&window.localStorage)return window.localStorage}catch{}return null},at=i=>{const t=ot();if(!t)return[];try{const e=t.getItem(i);if(!e)return[];const r=JSON.parse(e);return K(r?.favorites)}catch{return[]}},jt=()=>{const i=at(_);return i.length>0?i:at(U)},Qt=i=>{const t=ot();if(t)try{if(i.length===0){t.removeItem(_),t.removeItem(U);return}t.setItem(_,JSON.stringify({savedAt:Date.now(),favorites:i})),t.removeItem(U)}catch{}},j=async()=>{const i=await b.storage.local.get([rt,st]);return{primary:K(i.favorites),backups:Kt(i.favoritesBackups),mirrored:jt()}},ct=i=>i.primary.length>0?i.primary:i.backups.length>0?i.backups[0].favorites:i.mirrored.length>0?i.mirrored:[],lt=async i=>{const t=G(i),e=await j(),r=t.length>0?[{savedAt:Date.now(),favorites:t},...e.backups.filter(s=>JSON.stringify(s.favorites)!==JSON.stringify(t))].slice(0,Ht):e.backups;await b.storage.local.set({[rt]:t,[st]:r}),Qt(t)};async function L(){const i=await j(),t=ct(i),e=G(t);return i.primary.length===0&&e.length>0&&await lt(e),e}async function Q(i,t){const e=i.map((r,s)=>({...r,order:s}));if(e.length===0&&!t?.allowEmpty){const r=await j(),s=ct(r);return G(s)}return await lt(e),e}async function dt(){const i=await b.storage.local.get(nt);return i.lastCapture?D(i.lastCapture):null}async function Yt(i){await b.storage.local.set({[nt]:D(i)})}async function Jt(i,t,e){const r=await L(),s=Date.now(),n=_t(i,r),a=v(e?.defaultDisplayName??""),o=v(e?.defaultDisplayContent??""),c=(e?.displayName??a)||i||n,l=v(c),d=v(e?.displayContent??o),p=l.length>0&&a.length>0?l.toLowerCase()!==a.toLowerCase():l.length>0,g=d.length>0&&o.length>0?d.toLowerCase()!==o.toLowerCase():d.length>0,f={id:crypto.randomUUID(),name:n,displayName:l,displayNameCustom:p,displayContent:d,displayContentCustom:g,payload:it(t.valueJson),namespace:t.namespace,requestTemplate:t.requestTemplate?D(t.requestTemplate):void 0,order:r.length,createdAt:s,updatedAt:s};return r.unshift(f),await Q(r),f}async function Zt(i){const t=await L(),e=t.filter(r=>r.id!==i);return e.length===t.length?t:Q(e,{allowEmpty:!0})}async function Xt(i,t){const e=await L(),r=e.findIndex(l=>l.id===i);if(r===-1)return e;const s=t==="up"?r-1:r+1;if(s<0||s>=e.length)return e;const n=[...e],a=n[r],o=n[s];if(!a||!o)return e;n[r]=o,n[s]=a;const c=Date.now();return n[r]={...o,updatedAt:c},n[s]={...a,updatedAt:c},Q(n)}const $="sigtastic-content";function te(i){if(typeof i!="object"||i===null)return!1;const t=i;return t.source==="sigtastic-hook"&&t.type==="clipboard-write-result"&&typeof t.requestId=="string"&&typeof t.ok=="boolean"}function ee(i,t){const e=crypto.randomUUID(),r=t?.sanitize??!0;return{source:$,type:"clipboard-write-request",requestId:e,payload:{valueJson:r?Pt(i.payload):i.payload,namespace:i.namespace,requestTemplate:i.requestTemplate}}}const ie=172;class re{host;root;wrapper;searchInput;listWrap;grid;emptyState;hintText;actions;favorites=[];filtered=[];selectedId=null;opened=!1;query="";mode="search";cardById=new Map;typeLabelFitFrame=null;selectedScrollFrame=null;constructor(t){this.actions=t,this.host=document.createElement("div"),this.host.id="sigtastic-overlay-host",this.root=this.host.attachShadow({mode:"open"});const e=document.createElement("style");e.textContent=this.getStyles(),this.wrapper=document.createElement("div"),this.wrapper.className="sigtastic-wrapper",this.wrapper.tabIndex=-1;const r=document.createElement("div");r.className="sigtastic-scrim",r.addEventListener("click",()=>this.close());const s=document.createElement("section");s.className="sigtastic-panel",s.addEventListener("click",p=>{p.stopPropagation()});const n=document.createElement("div");n.className="sigtastic-top-row";const a=document.createElement("div");a.className="sigtastic-search-shell";const o=document.createElement("span");o.className="sigtastic-search-icon",o.setAttribute("aria-hidden","true"),o.innerHTML='<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.8" stroke="currentColor" stroke-width="1.8"/><path d="M16.1 16.1L21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',this.searchInput=document.createElement("input"),this.searchInput.className="sigtastic-search",this.searchInput.type="text",this.searchInput.placeholder="Search Components",this.searchInput.setAttribute("aria-label","Search components"),this.searchInput.addEventListener("focus",()=>{this.mode="search"}),this.searchInput.addEventListener("pointerdown",()=>{this.mode="search"}),this.searchInput.addEventListener("input",()=>{this.mode="search",this.query=this.searchInput.value.trim().toLowerCase(),this.applyFilter(),this.renderGrid()}),a.append(o,this.searchInput),n.append(a);const c=document.createElement("div");c.className="sigtastic-divider";const l=document.createElement("div");l.className="sigtastic-list-wrap",this.listWrap=l,this.grid=document.createElement("div"),this.grid.className="sigtastic-grid",this.emptyState=document.createElement("div"),this.emptyState.className="sigtastic-empty",l.append(this.grid,this.emptyState);const d=document.createElement("div");d.className="sigtastic-footer-divider",this.hintText=document.createElement("div"),this.hintText.className="sigtastic-hints",this.hintText.replaceChildren(this.createHintItem("Close","Esc"),this.createHintSeparator(),this.createHintItem("Insert","Enter"),this.createHintSeparator(),this.createHintItem("Remove","Option+Delete"),this.createHintSeparator(),this.createHintItem("Reorder","Option+Up/Down")),s.append(n,c,l,d,this.hintText),this.wrapper.append(r,s),this.root.append(e,this.wrapper),window.addEventListener("keydown",this.onKeyDown,!0),window.addEventListener("resize",this.onResize,{passive:!0}),document.documentElement.appendChild(this.host),this.renderGrid()}isOpen(){return this.opened}open(t){this.opened=!0,this.wrapper.classList.add("open"),this.query="",this.mode="search",this.searchInput.value="",this.setFavorites(t),this.searchInput.focus()}close(){this.opened&&(this.opened=!1,this.wrapper.classList.remove("open"),this.actions.onClose())}toggle(t){if(this.opened){this.close();return}this.open(t)}refreshFavorites(t){this.setFavorites(t),this.scheduleSelectedVisibilityScroll()}setFavorites(t){this.favorites=[...t].sort((e,r)=>e.order-r.order),!this.selectedId&&this.favorites.length>0&&(this.selectedId=this.favorites[0]?.id??null),this.applyFilter(),this.renderGrid()}applyFilter(){if(this.query?this.filtered=this.favorites.filter(t=>{const e=E(t.payload),r=this.getVisualDisplayName(t,e),s=this.getVisualDisplayContent(t,e);return`${t.name} ${r} ${s} ${e.typeName} ${e.contentText}`.toLowerCase().includes(this.query)}):this.filtered=[...this.favorites],this.filtered.length===0){this.selectedId=null;return}(!this.selectedId||!this.filtered.some(t=>t.id===this.selectedId))&&(this.selectedId=this.filtered[0]?.id??null)}getSelectedFavorite(){return this.selectedId?this.filtered.find(t=>t.id===this.selectedId)??null:null}enterSearchMode(t){this.mode="search",this.searchInput.focus(),t&&(this.searchInput.value+=t,this.query=this.searchInput.value.trim().toLowerCase(),this.applyFilter(),this.renderGrid())}enterListMode(){this.mode="list",this.searchInput.blur(),this.wrapper.focus()}renderGrid(){this.cardById.clear(),this.grid.innerHTML="";const t=this.filtered;if(this.emptyState.style.display=t.length===0?"block":"none",this.favorites.length===0){this.emptyState.textContent="No favorites yet. Copy a shape in Signavio and use Option+Shift+S to save one.",this.hintText.style.opacity="0.75";return}if(t.length===0){this.emptyState.textContent="No favorites match your search.",this.hintText.style.opacity="0.85";return}this.hintText.style.opacity="1";const e=this.getDuplicateSignatureCounts();for(const r of t){const s=document.createElement("button");s.className="sigtastic-card",s.type="button",s.dataset.favoriteId=r.id,s.title=r.name;const n=E(r.payload),a=et(r.payload),o=Bt(r.payload),c=this.getVisualDisplayName(r,n),l=this.getVisualDisplayContent(r,n),d=this.getFavoriteSignature(n,c,l,a),p=(e.get(d)??0)>1;s.addEventListener("click",()=>{this.selectedId=r.id,this.enterListMode(),this.updateSelectedCardClasses()}),s.addEventListener("dblclick",()=>{this.close(),this.actions.onInsert(r)});const g=this.createPreview(r,n,c,a,o,p),f=document.createElement("div");f.className="sigtastic-card-label",f.textContent=l,s.append(g,f),this.grid.appendChild(s),this.cardById.set(r.id,s)}this.updateSelectedCardClasses(),this.scheduleTypeLabelFit()}updateSelectedCardClasses(){for(const[t,e]of this.cardById.entries())e.classList.toggle("selected",t===this.selectedId)}getVisualDisplayName(t,e){const r=t.displayName?.trim()||"";return t.displayNameCustom&&r?r:e.typeName||"Component"}getVisualDisplayContent(t,e){const r=t.displayContent?.trim()||"";return t.displayContentCustom&&r?r:e.hasContent?e.contentText:"Empty"}middleEllipsis(t,e=24){const r=t.trim();if(r.length<=e)return r;if(e<=4)return`${r.slice(0,1)}...`;const s=e-3,n=Math.ceil(s/2),a=Math.floor(s/2);return`${r.slice(0,n)}...${r.slice(r.length-a)}`}scheduleTypeLabelFit(){this.typeLabelFitFrame!==null&&window.cancelAnimationFrame(this.typeLabelFitFrame),this.typeLabelFitFrame=window.requestAnimationFrame(()=>{this.typeLabelFitFrame=null,this.fitTypeLabelsToWidth()})}scheduleSelectedVisibilityScroll(){this.selectedScrollFrame!==null&&window.cancelAnimationFrame(this.selectedScrollFrame),this.selectedScrollFrame=window.requestAnimationFrame(()=>{this.selectedScrollFrame=null,this.scrollSelectedCardToTopIfOutOfView()})}fitTypeLabelsToWidth(){const t=this.grid.querySelectorAll(".sigtastic-type-inline");for(const e of t){const r=e.dataset.fullText?.trim()??"";if(!r){e.textContent="";continue}e.textContent=r;const s=e.clientWidth;if(s<=0||e.scrollWidth<=s)continue;let n=5,a=r.length,o=`${r.slice(0,1)}...`;for(;n<=a;){const c=Math.floor((n+a)/2),l=this.middleEllipsis(r,c);e.textContent=l,e.scrollWidth<=s?(o=l,n=c+1):a=c-1}e.textContent=o}}getFavoriteSignature(t,e,r,s){return[t.typeName.toLowerCase(),e.trim().toLowerCase(),r.trim().toLowerCase(),[...s].sort().join(",")].join("::")}getDuplicateSignatureCounts(){const t=new Map;for(const e of this.favorites){const r=E(e.payload),s=et(e.payload),n=this.getVisualDisplayName(e,r),a=this.getVisualDisplayContent(e,r),o=this.getFavoriteSignature(r,n,a,s);t.set(o,(t.get(o)??0)+1)}return t}createHintItem(t,e){const r=document.createElement("span");r.className="sigtastic-hint-item";const s=document.createElement("span");s.className="sigtastic-hint-action",s.textContent=t;const n=document.createElement("span");return n.className="sigtastic-hint-key",n.textContent=e,r.append(s,n),r}createHintSeparator(){const t=document.createElement("span");return t.className="sigtastic-hint-separator",t.textContent="|",t}createPreview(t,e,r,s,n,a){const o=document.createElement("div");o.className="sigtastic-preview";const c=e.stencilId.toLowerCase(),l=this.getIconKind(c,e),d=$t(t.payload,3).map(y=>y.toLowerCase()),p=d.length>0?d.map(y=>this.getIconKind(y)):[l];if(this.hasRoundedBackground(l)?o.classList.add("rounded-bg"):o.classList.add("shape-only"),o.classList.add(e.hasContent?"has-content":"is-empty"),p.length>1){const y=document.createElement("div");y.className=`sigtastic-preview-stack count-${Math.min(3,p.length)}`,p.slice(0,3).forEach((m,Me)=>{const Z=document.createElement("div");Z.className=`sigtastic-preview-bubble slot-${Me+1}`,Z.appendChild(this.createIconSvgNode(m,"sigtastic-preview-bubble-svg")),y.appendChild(Z)}),o.appendChild(y)}else o.appendChild(this.createIconSvgNode(l,"sigtastic-preview-svg"));n&&o.appendChild(this.getTypeBadge(n));const f=document.createElement("div");f.className="sigtastic-type-inline",f.dataset.fullText=r,f.textContent=r,f.setAttribute("title",r),o.appendChild(f);const M=[...s];if(a&&M.push("duplicate"),M.length>0){const y=document.createElement("div");y.className="sigtastic-badge-row";for(const m of M)y.appendChild(this.getBadge(m));o.appendChild(y)}return o}createIconSvgNode(t,e){const r=document.createElementNS("http://www.w3.org/2000/svg","svg");return r.setAttribute("viewBox","-4 -4 148 112"),r.classList.add(e),t.startsWith("gateway-")&&(r.style.height="75%"),r.innerHTML=this.getIconSvg(t),r}getBadge(t){const e=document.createElement("span");e.className="sigtastic-badge";const r={content:'<text x="12" y="15.5" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor" font-family="Segoe UI, sans-serif">T</text>',"multi-element":'<line x1="8.5" y1="8.5" x2="15.5" y2="8.5" stroke="currentColor" stroke-width="1.8"/><line x1="8.5" y1="8.5" x2="12" y2="14.8" stroke="currentColor" stroke-width="1.8"/><line x1="15.5" y1="8.5" x2="12" y2="14.8" stroke="currentColor" stroke-width="1.8"/><circle cx="8.5" cy="8.5" r="2.3" fill="currentColor"/><circle cx="15.5" cy="8.5" r="2.3" fill="currentColor"/><circle cx="12" cy="14.8" r="2.3" fill="currentColor"/>',duplicate:'<rect x="5.5" y="5.5" width="9.5" height="9.5" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="9" y="9" width="9.5" height="9.5" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.8"/>',timer:'<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="12" x2="12" y2="7" stroke="currentColor" stroke-width="2"/><line x1="12" y1="12" x2="16" y2="14" stroke="currentColor" stroke-width="2"/>',message:'<rect x="4" y="6" width="16" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 8 L12 13 L20 8" fill="none" stroke="currentColor" stroke-width="1.8"/>',conditional:'<rect x="5" y="5" width="14" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><line x1="8" y1="10" x2="16" y2="10" stroke="currentColor" stroke-width="1.8"/><line x1="8" y1="14" x2="16" y2="14" stroke="currentColor" stroke-width="1.8"/>',link:'<path d="M8 12 C8 9 10 7 13 7 H16" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 7 L14 5 M16 7 L14 9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 12 C16 15 14 17 11 17 H8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 17 L10 15 M8 17 L10 19" fill="none" stroke="currentColor" stroke-width="2"/>',multiple:'<circle cx="8" cy="12" r="2.2" fill="currentColor"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><circle cx="16" cy="12" r="2.2" fill="currentColor"/>',loop:'<path d="M17 10 A6 6 0 1 0 18 13" fill="none" stroke="currentColor" stroke-width="2"/><polygon points="18,8 21,10 18,12" fill="currentColor"/>',"mi-parallel":'<line x1="7" y1="7" x2="7" y2="17" stroke="currentColor" stroke-width="2.4"/><line x1="12" y1="7" x2="12" y2="17" stroke="currentColor" stroke-width="2.4"/><line x1="17" y1="7" x2="17" y2="17" stroke="currentColor" stroke-width="2.4"/>',"mi-sequential":'<line x1="7" y1="7" x2="7" y2="17" stroke="currentColor" stroke-width="2.4"/><line x1="12" y1="9" x2="12" y2="17" stroke="currentColor" stroke-width="2.4"/><line x1="17" y1="11" x2="17" y2="17" stroke="currentColor" stroke-width="2.4"/>',adhoc:'<path d="M4 14 C6 10 8 18 10 14 C12 10 14 18 16 14 C18 10 20 18 22 14" fill="none" stroke="currentColor" stroke-width="2"/>',"non-interrupting":'<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="2.5 2.5"/>',transaction:'<rect x="5" y="5" width="14" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="8" y="8" width="8" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/>'};return e.setAttribute("title",t),e.innerHTML=`<svg viewBox="0 0 24 24" fill="none">${r[t]}</svg>`,e}getTypeBadge(t){const e=document.createElement("div");e.className="sigtastic-type-badge-center";const r={user:'<circle cx="12" cy="8" r="3.6" fill="currentColor"/><path d="M4.8 20 C4.8 15.4 8 13 12 13 C16 13 19.2 15.4 19.2 20" fill="currentColor"/>',service:'<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2.1"/><circle cx="12" cy="12" r="2.3" fill="currentColor"/><line x1="12" y1="3.6" x2="12" y2="6.1" stroke="currentColor" stroke-width="2"/><line x1="12" y1="17.9" x2="12" y2="20.4" stroke="currentColor" stroke-width="2"/><line x1="3.6" y1="12" x2="6.1" y2="12" stroke="currentColor" stroke-width="2"/><line x1="17.9" y1="12" x2="20.4" y2="12" stroke="currentColor" stroke-width="2"/>',manual:'<path d="M6 19 V11 C6 9.6 7 8.8 8.2 8.8 C9.3 8.8 10.2 9.6 10.2 11.1 V14.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10.2 14.2 V8 C10.2 6.9 11 6.1 12.1 6.1 C13.2 6.1 14 6.9 14 8 V14.4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 12 C15 11.6 16.1 12.3 16.4 13.4 L17.8 18.4" fill="none" stroke="currentColor" stroke-width="2"/>',script:'<path d="M6 4.6 H13.8 L18 8.8 V19.4 H6 Z" fill="none" stroke="currentColor" stroke-width="2"/><line x1="8.5" y1="12" x2="15.5" y2="12" stroke="currentColor" stroke-width="1.9"/><line x1="8.5" y1="15.5" x2="14.2" y2="15.5" stroke="currentColor" stroke-width="1.9"/>',send:'<rect x="3.8" y="6.8" width="13.2" height="9.8" rx="2.1" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.8 8.1 L10.4 12.5 L17 8.1" fill="none" stroke="currentColor" stroke-width="1.7"/><line x1="16.8" y1="11.7" x2="22" y2="11.7" stroke="currentColor" stroke-width="2"/><polygon points="22,11.7 18.9,9.5 18.9,13.9" fill="currentColor"/>',receive:'<rect x="7" y="6.8" width="13.2" height="9.8" rx="2.1" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 8.1 L13.6 12.5 L20.2 8.1" fill="none" stroke="currentColor" stroke-width="1.7"/><line x1="2" y1="11.7" x2="7.2" y2="11.7" stroke="currentColor" stroke-width="2"/><polygon points="2,11.7 5.1,9.5 5.1,13.9" fill="currentColor"/>',"business-rule":'<rect x="4" y="5" width="16" height="14" fill="none" stroke="currentColor" stroke-width="2"/><line x1="4" y1="10" x2="20" y2="10" stroke="currentColor" stroke-width="2"/><line x1="9.2" y1="5" x2="9.2" y2="19" stroke="currentColor" stroke-width="2"/>',"call-activity":'<rect x="4" y="6" width="16" height="12" rx="3.6" fill="none" stroke="currentColor" stroke-width="2.6"/><rect x="7" y="9" width="10" height="6" rx="2.1" fill="none" stroke="currentColor" stroke-width="1.8"/>',automatic:'<polygon points="8,4 5,12.5 10,12.5 8.2,20 18.4,9.4 12.8,9.4 14.4,4" fill="currentColor"/>'};return e.setAttribute("title",t),e.innerHTML=`<svg viewBox="0 0 24 24" fill="none">${r[t]}</svg>`,e}getIconKind(t,e){const r=Object.values(e?.properties??{}).filter(a=>typeof a=="string").join(" ").toLowerCase(),s=`${t} ${r}`,n=this.getEventFlavor(s);return t.includes("usertask")?"task-user":t.includes("servicetask")||t.includes("service")?"task-service":t.includes("manualtask")||t.includes("manual")?"task-manual":t.includes("scripttask")||t.includes("script")?"task-script":t.includes("sendtask")?"task-send":t.includes("receivetask")?"task-receive":t.includes("businessruletask")||t.includes("decision")?"task-business-rule":t.includes("automatic")?"task-automatic":t.includes("transaction")?"transaction":t.includes("callactivity")?"call-activity":t.includes("subprocess")?"subprocess":t.includes("parallelgateway")?"gateway-parallel":t.includes("inclusivegateway")?"gateway-inclusive":t.includes("eventbasedgateway")?"gateway-event":t.includes("complexgateway")?"gateway-complex":t.includes("gateway")?"gateway-exclusive":t.includes("boundaryevent")?n?`event-boundary-${n}`:"event-boundary":t.includes("startevent")?n?`event-start-${n}`:"event-start":t.includes("endevent")?n?`event-end-${n}`:"event-end":t.includes("event")?n?`event-intermediate-${n}`:"event-intermediate":t.includes("messageflow")?"message-flow":t.includes("sequenceflow")?"sequence-flow":t.includes("association")?"association":t.includes("dataobject")?"data-object":t.includes("datastore")?"data-store":t.includes("group")?"group":t.includes("conversation")?"conversation":t.includes("choreography")?"choreography-task":t.includes("pool")||t.includes("lane")||t.includes("participant")?"pool-lane":t.includes("annotation")?"annotation":t.includes("message")?"message":t.includes("task")||t.includes("activity")||t.includes("callactivity")?"task":"generic"}getEventFlavor(t){return t.includes("timer")?"timer":t.includes("message")?"message":t.includes("signal")?"signal":t.includes("conditional")?"conditional":t.includes("linkevent")||t.includes(" link ")?"link":t.includes("multiple")?"multiple":t.includes("error")?"error":t.includes("compensation")?"compensation":t.includes("escalation")?"escalation":t.includes("terminate")?"terminate":""}hasRoundedBackground(t){return!1}getIconSvg(t){const e='<rect x="16" y="18" width="108" height="68" rx="16" fill="#f6f4d4" stroke="#575757" stroke-width="3"/>';if(t.startsWith("event-start-"))return this.getEventSvg("start",t.replace("event-start-",""));if(t.startsWith("event-intermediate-"))return this.getEventSvg("intermediate",t.replace("event-intermediate-",""));if(t.startsWith("event-end-"))return this.getEventSvg("end",t.replace("event-end-",""));if(t.startsWith("event-boundary-"))return this.getEventSvg("boundary",t.replace("event-boundary-",""));switch(t){case"task":return e;case"task-user":return this.getTaskWithGlyph('<circle cx="70" cy="45" r="9" fill="#5f5f5f"/><path d="M52 67 C52 57 60 52 70 52 C80 52 88 57 88 67" fill="#5f5f5f"/>');case"task-service":return this.getTaskWithGlyph('<circle cx="70" cy="52" r="13" fill="none" stroke="#5f5f5f" stroke-width="2.6"/><circle cx="70" cy="52" r="4" fill="#5f5f5f"/><line x1="70" y1="36" x2="70" y2="40" stroke="#5f5f5f" stroke-width="2.2"/><line x1="70" y1="64" x2="70" y2="68" stroke="#5f5f5f" stroke-width="2.2"/><line x1="54" y1="52" x2="58" y2="52" stroke="#5f5f5f" stroke-width="2.2"/><line x1="82" y1="52" x2="86" y2="52" stroke="#5f5f5f" stroke-width="2.2"/>');case"task-manual":return this.getTaskWithGlyph('<path d="M58 66 V50 C58 48 59.2 46.8 61 46.8 C62.8 46.8 64 48 64 50 V56" fill="none" stroke="#5f5f5f" stroke-width="2.4"/><path d="M64 56 V45 C64 42.8 65.4 41.4 67.4 41.4 C69.3 41.4 70.8 42.8 70.8 45 V56.5" fill="none" stroke="#5f5f5f" stroke-width="2.4"/><path d="M70.8 54.8 C72.5 53.8 74.8 54.4 75.8 56.2 L79.2 62" fill="none" stroke="#5f5f5f" stroke-width="2.4"/>');case"task-script":return this.getTaskWithGlyph('<path d="M59 37 H77 L84 44 V67 H59 Z" fill="none" stroke="#5f5f5f" stroke-width="2.4"/><line x1="63" y1="50" x2="80" y2="50" stroke="#5f5f5f" stroke-width="2.2"/><line x1="63" y1="57" x2="78" y2="57" stroke="#5f5f5f" stroke-width="2.2"/>');case"task-send":return this.getTaskWithGlyph('<rect x="56" y="42" width="22" height="16" rx="3" fill="none" stroke="#5f5f5f" stroke-width="2.4"/><path d="M56 44 L67 51 L78 44" fill="none" stroke="#5f5f5f" stroke-width="2"/><line x1="78" y1="50" x2="88" y2="50" stroke="#5f5f5f" stroke-width="2.2"/><polygon points="88,50 82,46.2 82,53.8" fill="#5f5f5f"/>');case"task-receive":return this.getTaskWithGlyph('<rect x="62" y="42" width="22" height="16" rx="3" fill="none" stroke="#5f5f5f" stroke-width="2.4"/><path d="M62 44 L73 51 L84 44" fill="none" stroke="#5f5f5f" stroke-width="2"/><line x1="52" y1="50" x2="62" y2="50" stroke="#5f5f5f" stroke-width="2.2"/><polygon points="52,50 58,46.2 58,53.8" fill="#5f5f5f"/>');case"task-business-rule":return this.getTaskWithGlyph('<rect x="56" y="39" width="28" height="22" fill="none" stroke="#5f5f5f" stroke-width="2.2"/><line x1="56" y1="48" x2="84" y2="48" stroke="#5f5f5f" stroke-width="2.2"/><line x1="65" y1="39" x2="65" y2="61" stroke="#5f5f5f" stroke-width="2.2"/>');case"task-automatic":return this.getTaskWithGlyph('<polygon points="66,36 60,52 68,52 65,67 82,46 74,46 77,36" fill="#5f5f5f"/>');case"subprocess":return'<rect x="20" y="18" width="100" height="68" rx="15" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><line x1="64" y1="74" x2="76" y2="74" stroke="#666" stroke-width="2.4"/><line x1="70" y1="68" x2="70" y2="80" stroke="#666" stroke-width="2.4"/>';case"call-activity":return'<rect x="16" y="18" width="108" height="68" rx="16" fill="#f6f4d4" stroke="#505050" stroke-width="4"/><rect x="22" y="24" width="96" height="56" rx="12" fill="none" stroke="#646464" stroke-width="2"/>';case"transaction":return'<rect x="16" y="18" width="108" height="68" rx="16" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><rect x="24" y="26" width="92" height="52" rx="10" fill="none" stroke="#666" stroke-width="2.2"/>';case"gateway-exclusive":return'<polygon points="70,12 120,52 70,92 20,52" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><line x1="55" y1="38" x2="85" y2="66" stroke="#636363" stroke-width="3"/><line x1="85" y1="38" x2="55" y2="66" stroke="#636363" stroke-width="3"/>';case"gateway-parallel":return'<polygon points="70,12 120,52 70,92 20,52" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><line x1="70" y1="33" x2="70" y2="71" stroke="#636363" stroke-width="3.2"/><line x1="51" y1="52" x2="89" y2="52" stroke="#636363" stroke-width="3.2"/>';case"gateway-inclusive":return'<polygon points="70,12 120,52 70,92 20,52" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><circle cx="70" cy="52" r="17" fill="none" stroke="#666" stroke-width="3"/>';case"gateway-event":return'<polygon points="70,12 120,52 70,92 20,52" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><circle cx="70" cy="52" r="14" fill="none" stroke="#666" stroke-width="2.6"/><polygon points="70,38 76,50 70,64 64,50" fill="#666"/>';case"gateway-complex":return'<polygon points="70,12 120,52 70,92 20,52" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><line x1="70" y1="32" x2="70" y2="72" stroke="#666" stroke-width="2.6"/><line x1="50" y1="52" x2="90" y2="52" stroke="#666" stroke-width="2.6"/><line x1="55" y1="37" x2="85" y2="67" stroke="#666" stroke-width="2.4"/><line x1="85" y1="37" x2="55" y2="67" stroke="#666" stroke-width="2.4"/>';case"event-start":return'<circle cx="70" cy="52" r="31" fill="#f6f4d4" stroke="#575757" stroke-width="3"/>';case"event-end":return'<circle cx="70" cy="52" r="31" fill="#f6f4d4" stroke="#4d4d4d" stroke-width="5"/>';case"event-intermediate":return'<circle cx="70" cy="52" r="31" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><circle cx="70" cy="52" r="24" fill="none" stroke="#666" stroke-width="2"/>';case"event-boundary":return'<circle cx="70" cy="52" r="31" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><circle cx="70" cy="52" r="24" fill="none" stroke="#666" stroke-width="2"/><circle cx="70" cy="52" r="6" fill="#737373"/>';case"sequence-flow":return'<line x1="18" y1="52" x2="120" y2="52" stroke="#5a5a5a" stroke-width="4" stroke-linecap="round"/><polygon points="120,52 102,42 102,62" fill="#5a5a5a"/>';case"message-flow":return'<line x1="16" y1="52" x2="120" y2="52" stroke="#6a6a6a" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round"/><polygon points="120,52 103,42 103,62" fill="#6a6a6a"/><rect x="52" y="35" width="34" height="24" rx="2" fill="#f6f4d4" stroke="#666" stroke-width="2"/>';case"association":return'<line x1="18" y1="52" x2="120" y2="52" stroke="#737373" stroke-width="3" stroke-dasharray="5 5" stroke-linecap="round"/>';case"data-object":return'<path d="M32 18 H90 L108 36 V86 H32 Z" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><path d="M90 18 V36 H108" fill="none" stroke="#575757" stroke-width="3"/>';case"data-store":return'<ellipse cx="70" cy="28" rx="34" ry="11" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><path d="M36 28 V76 C36 83 51 88 70 88 C89 88 104 83 104 76 V28" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><ellipse cx="70" cy="28" rx="23" ry="7" fill="none" stroke="#666" stroke-width="1.8"/><path d="M40 48 C40 54 54 58 70 58 C86 58 100 54 100 48" fill="none" stroke="#666" stroke-width="1.8"/>';case"pool-lane":return'<rect x="16" y="16" width="108" height="72" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><line x1="42" y1="16" x2="42" y2="88" stroke="#666" stroke-width="2.6"/><line x1="42" y1="52" x2="124" y2="52" stroke="#666" stroke-width="2.2"/>';case"annotation":return'<path d="M34 20 H94 L108 34 V84 H34 Z" fill="#f6f4d4" stroke="#666" stroke-width="3"/><path d="M94 20 V34 H108" fill="none" stroke="#666" stroke-width="3"/><line x1="42" y1="44" x2="97" y2="44" stroke="#777" stroke-width="2"/><line x1="42" y1="56" x2="97" y2="56" stroke="#777" stroke-width="2"/><line x1="42" y1="68" x2="85" y2="68" stroke="#777" stroke-width="2"/>';case"group":return'<rect x="18" y="18" width="104" height="68" rx="10" fill="none" stroke="#666" stroke-width="3" stroke-dasharray="7 6"/>';case"conversation":return'<polygon points="70,14 116,38 116,66 70,90 24,66 24,38" fill="#f6f4d4" stroke="#575757" stroke-width="3"/>';case"choreography-task":return'<rect x="16" y="18" width="108" height="68" rx="10" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><rect x="16" y="18" width="108" height="14" rx="10" fill="none" stroke="#666" stroke-width="2"/><rect x="16" y="72" width="108" height="14" rx="10" fill="none" stroke="#666" stroke-width="2"/>';case"message":return'<rect x="24" y="24" width="92" height="56" rx="8" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><path d="M24 28 L70 58 L116 28" fill="none" stroke="#666" stroke-width="2.8"/>';default:return e}}getTaskWithGlyph(t){return`<rect x="16" y="18" width="108" height="68" rx="16" fill="#f6f4d4" stroke="#575757" stroke-width="3"/>${t}`}getEventSvg(t,e){let s=`<circle cx="70" cy="52" r="31" fill="#f6f4d4" stroke="#575757" stroke-width="${t==="end"?"5":"3"}"/>`;return(t==="intermediate"||t==="boundary")&&(s+='<circle cx="70" cy="52" r="24" fill="none" stroke="#666" stroke-width="2"/>'),t==="boundary"&&(s+='<circle cx="70" cy="52" r="31" fill="none" stroke="#575757" stroke-width="2" stroke-dasharray="3.5 2.8"/>'),`${s}${this.getEventFlavorSymbol(e)}`}getEventFlavorSymbol(t){switch(t){case"timer":return'<circle cx="70" cy="52" r="12" fill="none" stroke="#5f5f5f" stroke-width="2.2"/><line x1="70" y1="52" x2="70" y2="45" stroke="#5f5f5f" stroke-width="2.2"/><line x1="70" y1="52" x2="76" y2="55" stroke="#5f5f5f" stroke-width="2.2"/>';case"message":return'<rect x="58" y="43" width="24" height="18" rx="3" fill="none" stroke="#5f5f5f" stroke-width="2.2"/><path d="M58 45 L70 53 L82 45" fill="none" stroke="#5f5f5f" stroke-width="1.9"/>';case"signal":return'<path d="M57 57 C60 51 64 49 70 49 C76 49 80 51 83 57" fill="none" stroke="#5f5f5f" stroke-width="2.2"/><path d="M60 61 C63 57 66 55.5 70 55.5 C74 55.5 77 57 80 61" fill="none" stroke="#5f5f5f" stroke-width="2.2"/><circle cx="70" cy="64" r="2.3" fill="#5f5f5f"/>';case"conditional":return'<rect x="58" y="41" width="24" height="22" rx="2.5" fill="none" stroke="#5f5f5f" stroke-width="2.1"/><line x1="62" y1="48" x2="78" y2="48" stroke="#5f5f5f" stroke-width="2"/><line x1="62" y1="54" x2="78" y2="54" stroke="#5f5f5f" stroke-width="2"/><line x1="62" y1="60" x2="74" y2="60" stroke="#5f5f5f" stroke-width="2"/>';case"link":return'<path d="M62 52 C62 49 64 47 67 47 H72" fill="none" stroke="#5f5f5f" stroke-width="2.2"/><path d="M72 47 L69.5 44.6 M72 47 L69.5 49.4" fill="none" stroke="#5f5f5f" stroke-width="2.2"/><path d="M78 52 C78 55 76 57 73 57 H68" fill="none" stroke="#5f5f5f" stroke-width="2.2"/><path d="M68 57 L70.5 54.6 M68 57 L70.5 59.4" fill="none" stroke="#5f5f5f" stroke-width="2.2"/>';case"multiple":return'<circle cx="64" cy="52" r="2.6" fill="#5f5f5f"/><circle cx="70" cy="52" r="2.6" fill="#5f5f5f"/><circle cx="76" cy="52" r="2.6" fill="#5f5f5f"/>';case"error":return'<line x1="62" y1="44" x2="78" y2="60" stroke="#5f5f5f" stroke-width="2.5"/><line x1="78" y1="44" x2="62" y2="60" stroke="#5f5f5f" stroke-width="2.5"/>';case"compensation":return'<polygon points="70,52 78,47 78,57" fill="#5f5f5f"/><polygon points="62,52 70,47 70,57" fill="#5f5f5f"/>';case"escalation":return'<line x1="70" y1="60" x2="70" y2="45" stroke="#5f5f5f" stroke-width="2.2"/><polygon points="70,42 77,49 63,49" fill="#5f5f5f"/>';case"terminate":return'<rect x="63" y="45" width="14" height="14" fill="#5f5f5f"/>';default:return""}}moveSelectionByKey(t){const e=this.filtered.findIndex(n=>n.id===this.selectedId);if(e<0)return;const r=this.getColumnCount();let s=e;t==="ArrowLeft"?s=e-1:t==="ArrowRight"?s=e+1:t==="ArrowUp"?s=e-r:t==="ArrowDown"&&(s=e+r),s=Math.max(0,Math.min(this.filtered.length-1,s)),this.selectedId=this.filtered[s]?.id??this.selectedId,this.updateSelectedCardClasses(),this.scrollSelectedCardToTopIfOutOfView()}scrollSelectedCardToTopIfOutOfView(){if(!this.selectedId)return;const t=this.cardById.get(this.selectedId);if(!t)return;const e=this.listWrap.getBoundingClientRect(),r=t.getBoundingClientRect(),s=10;if(!(r.top<e.top+s||r.bottom>e.bottom))return;const a=r.top-e.top,o=this.listWrap.scrollTop+a-s;this.listWrap.scrollTo({top:Math.max(0,o),behavior:"smooth"})}moveSelectionToLeftNeighborOnDelete(){const t=this.filtered.findIndex(e=>e.id===this.selectedId);if(!(t<0)){if(t>0){this.selectedId=this.filtered[t-1]?.id??null;return}this.selectedId=this.filtered[1]?.id??null}}onKeyDown=t=>{if(!this.opened)return;if(t.stopPropagation(),t.key==="Escape"){t.preventDefault(),this.close();return}const e=this.getSelectedFavorite();if(t.altKey&&(t.key==="Delete"||t.key==="Backspace")){t.preventDefault(),e&&(this.enterListMode(),this.moveSelectionToLeftNeighborOnDelete(),this.actions.onDelete(e));return}const r=["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(t.key),s=t.key.length===1&&!t.metaKey&&!t.ctrlKey&&!t.altKey;if(this.mode==="search"){if(t.key==="Delete"||t.key==="Backspace")return;if(r||t.key==="Enter"){if(t.preventDefault(),this.enterListMode(),r){this.moveSelectionByKey(t.key);return}e&&(this.close(),this.actions.onInsert(e));return}return}if(s){t.preventDefault(),this.enterSearchMode(t.key);return}if(e){if(t.key==="Enter"){t.preventDefault(),this.close(),this.actions.onInsert(e);return}if(t.altKey&&(t.key==="ArrowUp"||t.key==="ArrowDown")){t.preventDefault();const n=t.key==="ArrowUp"?"up":"down";this.actions.onMove(e,n);return}if(t.key==="Delete"||t.key==="Backspace"){t.preventDefault();return}r&&(t.preventDefault(),this.moveSelectionByKey(t.key))}};onResize=()=>{this.opened&&this.scheduleTypeLabelFit()};getColumnCount(){const t=this.grid.clientWidth;return t<=0?4:Math.max(1,Math.floor(t/ie))}getStyles(){return`
      :host {
        all: initial;
      }

      :host, :host * {
        box-sizing: border-box;
      }

      .sigtastic-wrapper {
        position: fixed;
        inset: 0;
        z-index: 2147483600;
        display: none;
        align-items: center;
        justify-content: center;
        font-family: "Avenir Next", "Segoe UI", sans-serif;
      }

      .sigtastic-wrapper.open {
        display: flex;
      }

      .sigtastic-scrim {
        position: absolute;
        inset: 0;
        background: rgba(10, 12, 14, 0.2);
        backdrop-filter: blur(3px);
      }

      .sigtastic-panel {
        position: relative;
        width: min(900px, 95vw);
        min-height: min(520px, 74vh);
        max-height: 80vh;
        padding: 20px;
        border-radius: 30px;
        background: rgba(26, 28, 33, 0.78);
        backdrop-filter: blur(8px) saturate(110%);
        box-shadow: 0 22px 54px rgba(0, 0, 0, 0.62);
        display: grid;
        grid-template-rows: auto auto minmax(0, 1fr) auto auto;
        gap: 12px;
        border: 1px solid rgba(255, 255, 255, 0.24);
        overflow: hidden;
      }

      .sigtastic-top-row {
        display: flex;
        align-items: center;
      }

      .sigtastic-search-shell {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 9px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
        padding: 8px 11px;
      }

      .sigtastic-search-icon {
        width: 18px;
        height: 18px;
        color: rgba(236, 236, 236, 0.88);
        display: inline-flex;
        flex: 0 0 auto;
      }

      .sigtastic-search-icon svg {
        width: 100%;
        height: 100%;
      }

      .sigtastic-search {
        width: 100%;
        border: none;
        outline: none;
        background: transparent;
        color: #ececec;
        font-size: 17px;
        font-weight: 500;
        line-height: 1.1;
        letter-spacing: 0.01em;
      }

      .sigtastic-search::placeholder {
        color: rgba(236, 236, 236, 0.88);
      }

      .sigtastic-divider {
        height: 1px;
        border-radius: 999px;
        background: rgba(246, 246, 246, 0.22);
      }

      .sigtastic-list-wrap {
        overflow-x: hidden;
        overflow-y: auto;
        min-height: 0;
        padding: 10px 2px;
        margin: -12px 0;
      }

      .sigtastic-list-wrap::-webkit-scrollbar {
        width: 8px;
      }

      .sigtastic-list-wrap::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.16);
        border-radius: 999px;
      }

      .sigtastic-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 14px;
        align-content: start;
        width: 100%;
        padding: 2px;
      }

      .sigtastic-card {
        border: 1px solid transparent;
        display: grid;
        justify-items: center;
        align-items: start;
        grid-template-rows: auto 1fr;
        height: auto;
        border-radius: 22px;
        background: #383a3fb0;
        color: #ececec;
        cursor: pointer;
        transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
        outline: none;
        overflow: visible;
      }

      .sigtastic-card:hover {
        transform: translateY(-1px);
        box-shadow: 0 5px 16px -4px rgba(0, 0, 0, 0.4);
      }

      .sigtastic-card.selected {
        background: #474950b0;
        border-color: rgba(236, 236, 236, 0.72);
        box-shadow: 0 0 0 1px rgba(236, 236, 236, 0.18) inset;
      }

      .sigtastic-preview {
        width: 176px;
        height: 108px;
        border-radius: 14px;
        background: #313338;
        border: 1px solid transparent;
        margin-top: 10px;
        margin-bottom: 5px;
        display: grid;
        place-items: center;
        overflow: visible;
        position: relative;
        padding-bottom: 16px;
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
      }

      .sigtastic-preview.rounded-bg {
        background: rgba(24, 28, 35, 0.84);
        border-color: rgba(228, 228, 228, 0.18);
      }

      .sigtastic-preview.shape-only {
        border: none;
      }

      .sigtastic-preview.has-content {
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08) inset;
      }

      .sigtastic-preview.is-empty {
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04) inset;
      }

      .sigtastic-preview-svg {
        width: 80%;
        height: 100%;
        overflow: visible;
        transform: translateY(-8px);
      }

      .sigtastic-preview-stack {
        position: relative;
        width: 100%;
        height: 100%;
        transform: translateY(-5px);
      }

      .sigtastic-preview-bubble {
        position: absolute;
        border-radius: 12px;
        background: #313338;
        border: 1px solid rgba(241, 241, 241, 0.16);
        box-shadow: 0 7px 14px rgba(0, 0, 0, 0.22);
        overflow: hidden;
      }

      .sigtastic-preview-bubble-svg {
        width: 100%;
        height: 100%;
        overflow: visible;
      }

.sigtastic-preview-stack.count-2 .sigtastic-preview-bubble.slot-1 {
	width: 69px;
	height: 54px;
	left: calc(50% - 69px);
	top: 33px;
	z-index: 1;
}

      .sigtastic-preview-stack.count-2 .sigtastic-preview-bubble.slot-2 {
        width: 69px;
        height: 54px;
        left: calc(50% + 3px);
        top: 16px;
        z-index: 2;
      }

.sigtastic-preview-stack.count-3 .sigtastic-preview-bubble.slot-1 {
	width: 52px;
	height: 41px;
	left: 23px;
	top: 41px;
	z-index: 1;
}

.sigtastic-preview-stack.count-3 .sigtastic-preview-bubble.slot-2 {
	width: 52px;
	height: 41px;
	left: 96px;
	top: 46px;
	z-index: 2;
}

.sigtastic-preview-stack.count-3 .sigtastic-preview-bubble.slot-3 {
	width: 52px;
	height: 41px;
	left: 50px;
	top: 14px;
	z-index: 3;
}

      .sigtastic-preview.is-empty .sigtastic-preview-svg {
        opacity: 0.94;
      }

      .sigtastic-type-inline {
        position: absolute;
        left: 10px;
        right: 10px;
        bottom: 8px;
        font-size: 12px;
        font-weight: 700;
        color: #f3f3f3;
        line-height: 1.1;
        white-space: nowrap;
        overflow: hidden;
        text-align: center;
        pointer-events: none;
      }

      .sigtastic-type-badge-center {
        position: absolute;
        left: 50%;
        top: 44%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        border-radius: 999px;
        display: grid;
        place-items: center;
        color: #f4f4f4;
        background: rgba(20, 25, 33, 0.95);
        border: 1px solid rgba(244, 244, 244, 0.46);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.34);
        pointer-events: none;
      }

      .sigtastic-type-badge-center svg {
        width: 25px;
        height: 25px;
      }

      .sigtastic-badge-row {
        position: absolute;
        top: -6px;
        right: -6px;
        display: flex;
        gap: 4px;
      }

      .sigtastic-badge {
        width: 23px;
        height: 23px;
        border-radius: 999px;
        display: grid;
        place-items: center;
        background: rgba(19, 24, 32, 0.95);
        border: 1px solid rgba(244, 244, 244, 0.46);
        color: #f1f1f1;
        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.32);
      }

      .sigtastic-badge svg {
        width: 16px;
        height: 16px;
      }

      .sigtastic-card-label {
        padding: 0 10px 8px 10px;
        font-size: 12px;
        font-weight: 600;
        color: rgba(243, 243, 243, 0.88);
        line-height: 1.2;
        text-align: center;
        white-space: normal;
        overflow: hidden;
        max-height: calc(1.2em * 3);
        display: block;
        -webkit-mask-image: linear-gradient( to bottom, rgb(0, 0, 0) 74%, rgba(0, 0, 0, 0) calc(100% - 4px));
        mask-image: linear-gradient( to bottom, rgb(0, 0, 0) 74%, rgba(0, 0, 0, 0) calc(100% - 4px));
        width: 100%;
        align-self: start;
      }

      .sigtastic-empty {
        display: none;
        font-size: 14px;
        color: rgba(243, 243, 243, 0.86);
        padding: 6px 2px;
      }

      .sigtastic-footer-divider {
        height: 1px;
        border-radius: 999px;
        background: rgba(246, 246, 246, 0.22);
      }

      .sigtastic-hints {
        align-self: end;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 7px;
        color: rgba(243, 243, 243, 0.84);
        padding-top: 1px;
        min-height: 24px;
        margin: -8px 5px -13px 5px;
      }

      .sigtastic-hint-item {
        display: inline-flex;
        align-items: center;
        gap: 7px;
      }

      .sigtastic-hint-action {
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.01em;
      }

      .sigtastic-hint-key {
        font-size: 11px;
        font-weight: 700;
        line-height: 1;
        padding: 4px 7px;
        border-radius: 7px;
        background: rgba(176, 182, 192, 0.18);
        border: 1px solid rgba(210, 214, 220, 0.22);
        color: #f2f2f2;
      }

      .sigtastic-hint-separator {
        margin: 0 3px;
        font-size: 12px;
        color: rgba(243, 243, 243, 0.44);
      }

      @media (max-width: 1000px) {
        .sigtastic-panel {
          width: min(900px, calc(100vw - 12px));
          min-height: min(500px, calc(100vh - 12px));
          max-height: calc(100vh - 12px);
          border-radius: 24px;
          padding: 14px;
          gap: 9px;
        }

        .sigtastic-search {
          font-size: 15px;
        }

        .sigtastic-grid {
          grid-template-columns: repeat(auto-fill, minmax(138px, 1fr));
          gap: 10px;
        }

        .sigtastic-card {
          height: auto;
          min-height: 0;
          grid-template-rows: auto auto;
          border-radius: 18px;
        }

        .sigtastic-preview {
          width: min(100%, 120px);
          height: 86px;
          border-radius: 14px;
          margin-bottom: 6px;
          padding-bottom: 12px;
        }

        .sigtastic-preview-svg {
          transform: translateY(-4px);
        }

        .sigtastic-preview-stack {
          transform: translateY(-3px);
        }

        .sigtastic-preview-stack.count-2 .sigtastic-preview-bubble.slot-1 {
          width: 44px;
          height: 32px;
          left: calc(50% - 45px);
          top: 21px;
        }

        .sigtastic-preview-stack.count-2 .sigtastic-preview-bubble.slot-2 {
          width: 44px;
          height: 32px;
          left: calc(50% + 1px);
          top: 15px;
        }

        .sigtastic-preview-stack.count-3 .sigtastic-preview-bubble.slot-1 {
          width: 38px;
          height: 28px;
          left: 8px;
          top: 28px;
        }

        .sigtastic-preview-stack.count-3 .sigtastic-preview-bubble.slot-2 {
          width: 38px;
          height: 28px;
          left: 56px;
          top: 20px;
        }

        .sigtastic-preview-stack.count-3 .sigtastic-preview-bubble.slot-3 {
          width: 38px;
          height: 28px;
          left: 32px;
          top: 8px;
        }

        .sigtastic-type-badge-center {
          width: 32px;
          height: 32px;
          top: 50%;
        }

        .sigtastic-type-badge-center svg {
          width: 20px;
          height: 20px;
        }

        .sigtastic-type-inline {
          left: 8px;
          right: 8px;
          bottom: 4px;
          font-size: 11px;
        }

        .sigtastic-card-label {
          font-size: 11px;
          padding: 0 8px 8px;
          max-height: calc(1.2em * 3);
        }

        .sigtastic-hints {
          gap: 6px;
          row-gap: 5px;
        }

        .sigtastic-hint-action {
          font-size: 11px;
        }

        .sigtastic-hint-key {
          font-size: 10px;
          padding: 3px 6px;
        }
      }

      @media (max-width: 700px) {
        .sigtastic-panel {
          width: calc(100vw - 10px);
          min-height: min(460px, calc(100vh - 10px));
          max-height: calc(100vh - 10px);
          border-radius: 20px;
          padding: 12px;
          gap: 8px;
        }

        .sigtastic-grid {
          grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
          gap: 8px;
        }

        .sigtastic-card {
          height: auto;
          min-height: 0;
          grid-template-rows: auto auto;
          border-radius: 16px;
        }

        .sigtastic-preview {
          width: min(100%, 112px);
          height: 82px;
          margin-top: 8px;
          margin-bottom: 5px;
        }

        .sigtastic-preview-stack.count-2 .sigtastic-preview-bubble.slot-1 {
          width: 40px;
          height: 30px;
          left: calc(50% - 42px);
          top: 20px;
        }

        .sigtastic-preview-stack.count-2 .sigtastic-preview-bubble.slot-2 {
          width: 40px;
          height: 30px;
          left: calc(50% + 2px);
          top: 14px;
        }

        .sigtastic-preview-stack.count-3 .sigtastic-preview-bubble.slot-1 {
          width: 35px;
          height: 26px;
          left: 8px;
          top: 27px;
        }

        .sigtastic-preview-stack.count-3 .sigtastic-preview-bubble.slot-2 {
          width: 35px;
          height: 26px;
          left: 52px;
          top: 19px;
        }

        .sigtastic-preview-stack.count-3 .sigtastic-preview-bubble.slot-3 {
          width: 35px;
          height: 26px;
          left: 30px;
          top: 8px;
        }

        .sigtastic-type-badge-center {
          width: 30px;
          height: 30px;
          top: 50%;
        }

        .sigtastic-type-badge-center svg {
          width: 18px;
          height: 18px;
        }

        .sigtastic-card-label {
          font-size: 10px;
          padding: 0 7px 7px;
        }

        .sigtastic-hints {
          gap: 5px;
          row-gap: 4px;
        }

        .sigtastic-hint-action {
          font-size: 10px;
        }

        .sigtastic-hint-key {
          font-size: 9px;
          padding: 3px 5px;
        }
      }
    `}}const w=[{id:"none",label:"None"},{id:"send",label:"Send"},{id:"receive",label:"Receive"},{id:"script",label:"Script"},{id:"service",label:"Service"},{id:"user",label:"User"},{id:"manual",label:"Manual"},{id:"business-rule",label:"Business Rule"}],T=6,C=10,se=850,pt=(i,t,e)=>Math.min(e,Math.max(t,i)),Y=i=>i.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim(),ne=i=>String(i+1);class oe{host;root;wrapper;anchor;panel;subtitle;list;actions;supportsCssAnchors;optionButtons=new Map;opened=!1;applying=!1;altKeyPressed=!1;optionHintsVisible=!1;selectedIndex=0;currentTaskType=null;shapeId=null;anchorRect=null;typedQuery="";typedQueryTimer=null;constructor(t){this.actions=t,this.supportsCssAnchors=!1,this.host=document.createElement("div"),this.host.id="sigtastic-quick-menu-host",this.root=this.host.attachShadow({mode:"open"});const e=document.createElement("style");e.textContent=this.getStyles(),this.wrapper=document.createElement("div"),this.wrapper.className="sigtastic-quick-wrapper";const r=document.createElement("div");r.className="sigtastic-quick-scrim",r.addEventListener("pointerdown",()=>this.close()),this.anchor=document.createElement("div"),this.anchor.className="sigtastic-quick-anchor",this.panel=document.createElement("section"),this.panel.className="sigtastic-quick-panel",this.panel.addEventListener("pointerdown",o=>o.stopPropagation()),this.panel.addEventListener("click",o=>o.stopPropagation());const s=document.createElement("div");s.className="sigtastic-quick-header";const n=document.createElement("h2");n.className="sigtastic-quick-title",n.textContent="Change Type",this.subtitle=document.createElement("div"),this.subtitle.className="sigtastic-quick-subtitle";const a=document.createElement("div");a.className="sigtastic-quick-divider",this.list=document.createElement("div"),this.list.className="sigtastic-quick-list",this.list.setAttribute("role","listbox"),this.list.setAttribute("aria-label","Task type options"),s.append(n,this.subtitle),this.panel.append(s,a,this.list),this.wrapper.append(r,this.anchor,this.panel),this.root.append(e,this.wrapper),window.addEventListener("keydown",this.onKeyDown,!0),window.addEventListener("keyup",this.onKeyUp,!0),window.addEventListener("blur",this.onWindowBlur),window.addEventListener("resize",this.onResize,{passive:!0}),document.documentElement.appendChild(this.host)}isOpen(){return this.opened}getShapeId(){return this.shapeId}open(t){this.opened=!0,this.optionHintsVisible=this.altKeyPressed,this.typedQuery="",this.currentTaskType=t.taskType,this.shapeId=t.shapeId,this.anchorRect=t.anchorRect,this.selectedIndex=Math.max(0,w.findIndex(e=>e.id===t.taskType)),this.wrapper.classList.add("open"),this.render(),this.syncAnchor(),window.requestAnimationFrame(()=>{this.syncPosition(),this.focusSelectedButton()})}close(){this.opened&&(this.opened=!1,this.applying=!1,this.optionHintsVisible=!1,this.resetTypedQuery(),this.shapeId=null,this.wrapper.classList.remove("open"),this.panel.style.left="",this.panel.style.top="",delete this.panel.dataset.optionHints,this.actions.onClose())}render(){this.optionButtons.clear(),this.list.replaceChildren();const t=w.find(e=>e.id===this.currentTaskType)?.label??"Unknown";this.subtitle.textContent=this.currentTaskType!==null?`Current: ${t}`:"Choose a type";for(const[e,r]of w.entries()){const s=document.createElement("button");s.type="button",s.className="sigtastic-quick-option",s.dataset.selected=String(e===this.selectedIndex),s.dataset.current=String(r.id===this.currentTaskType),s.setAttribute("role","option"),s.setAttribute("aria-selected",String(e===this.selectedIndex)),s.disabled=this.applying,s.addEventListener("mouseenter",()=>{this.selectedIndex=e,this.updateSelectedOption()}),s.addEventListener("focus",()=>{this.selectedIndex=e,this.updateSelectedOption()}),s.addEventListener("click",()=>{this.applyOption(r.id)});const n=document.createElement("span");n.className="sigtastic-quick-icon",n.setAttribute("aria-hidden","true"),n.innerHTML=this.getTaskTypeIconSvg(r.id);const a=document.createElement("span");a.className="sigtastic-quick-label",a.textContent=r.label;const o=document.createElement("span");if(o.className="sigtastic-quick-shortcut",o.textContent=ne(e),o.setAttribute("aria-hidden","true"),s.append(n,a),r.id===this.currentTaskType){const c=document.createElement("span");c.className="sigtastic-quick-current",c.textContent="Current",s.append(c)}s.append(o),this.list.appendChild(s),this.optionButtons.set(r.id,s)}this.updateSelectedOption(),this.syncOptionHints()}updateSelectedOption(){w.forEach((t,e)=>{const r=this.optionButtons.get(t.id);if(!r)return;const s=e===this.selectedIndex;r.dataset.selected=String(s),r.setAttribute("aria-selected",String(s))})}syncOptionHints(){this.panel.dataset.optionHints=String(this.optionHintsVisible)}focusSelectedButton(){const t=w[this.selectedIndex],e=t?this.optionButtons.get(t.id):null;e&&(e.focus({preventScroll:!0}),e.scrollIntoView({block:"nearest"}))}async applyOption(t){if(this.applying)return;this.applying=!0,this.panel.dataset.applying="true";for(const r of this.optionButtons.values())r.disabled=!0;const e=await this.actions.onApply(t).catch(()=>!1);if(this.applying=!1,delete this.panel.dataset.applying,e){this.close();return}for(const r of this.optionButtons.values())r.disabled=!1;this.focusSelectedButton()}moveSelection(t){const e=w.length;this.selectedIndex=(this.selectedIndex+t+e)%e,this.updateSelectedOption(),this.focusSelectedButton()}resetTypedQuery(){this.typedQueryTimer!==null&&(window.clearTimeout(this.typedQueryTimer),this.typedQueryTimer=null),this.typedQuery=""}scheduleTypedQueryReset(){this.typedQueryTimer!==null&&window.clearTimeout(this.typedQueryTimer),this.typedQueryTimer=window.setTimeout(()=>{this.typedQuery="",this.typedQueryTimer=null},se)}getMatchingOptionIndex(t){const e=Y(t);return e?w.map((s,n)=>{const a=Y(s.label),o=a.split(/\s+/).filter(Boolean),c=o.map(d=>d[0]||"").join("");let l=-1;if(a===e)l=1e3;else if(a.startsWith(e))l=900-a.length;else if(o.some(d=>d.startsWith(e)))l=760-a.length;else if(c.startsWith(e))l=680-c.length;else{const d=a.indexOf(e);d>=0&&(l=520-d)}return{index:n,score:l}}).filter(s=>s.score>=0).sort((s,n)=>n.score-s.score||s.index-n.index)[0]?.index??-1:-1}handleTypeaheadInput(t){const e=Y(t);if(!e)return!1;const r=`${this.typedQuery}${e}`;let s=this.getMatchingOptionIndex(r);if(s>=0)this.typedQuery=r;else{if(s=this.getMatchingOptionIndex(e),s<0)return!1;this.typedQuery=e}return this.scheduleTypedQueryReset(),this.selectedIndex=s,this.updateSelectedOption(),this.focusSelectedButton(),!0}getShortcutOption(t){if(!t.altKey)return null;const e=t.code||"";let r=-1;return e.startsWith("Digit")?r=Number.parseInt(e.slice(5),10)-1:e.startsWith("Numpad")&&(r=Number.parseInt(e.slice(6),10)-1),Number.isNaN(r)||r<0||r>=w.length?null:w[r]?.id??null}syncAnchor(){const t=this.anchorRect;if(!t){this.anchor.style.left=`${window.innerWidth/2}px`,this.anchor.style.top=`${window.innerHeight/2}px`,this.anchor.style.width="1px",this.anchor.style.height="1px";return}this.anchor.style.left=`${t.left}px`,this.anchor.style.top=`${t.top}px`,this.anchor.style.width=`${Math.max(1,t.width)}px`,this.anchor.style.height=`${Math.max(1,t.height)}px`}syncPosition(){if(this.opened){if(this.syncAnchor(),this.supportsCssAnchors){this.panel.dataset.anchored="true",this.panel.style.left="",this.panel.style.top="",window.requestAnimationFrame(()=>{if(!this.opened)return;const t=this.panel.getBoundingClientRect();(t.left<C||t.top<C||t.right>window.innerWidth-C||t.bottom>window.innerHeight-C)&&this.applyFallbackPosition()});return}this.applyFallbackPosition()}}applyFallbackPosition(){this.panel.dataset.anchored="false";const t=this.panel.offsetWidth||260,e=this.panel.offsetHeight||320;let r=(window.innerWidth-t)/2,s=(window.innerHeight-e)/2;if(this.anchorRect){const n=this.anchorRect,a=window.innerWidth-n.right-T,o=n.left-T,c=window.innerHeight-n.bottom-T,l=n.top-T;a>=t?r=n.right+T:o>=t?r=n.left-t-T:r=n.left+n.width/2-t/2,c>=e?s=n.top-4:l>=e?s=n.bottom-e+4:s=n.top+n.height/2-e/2}this.panel.style.left=`${pt(r,C,window.innerWidth-t-C)}px`,this.panel.style.top=`${pt(s,C,window.innerHeight-e-C)}px`}onKeyDown=t=>{if(t.key==="Alt"&&(this.altKeyPressed=!0,this.opened&&(this.optionHintsVisible=!0,this.syncOptionHints())),!this.opened)return;t.stopPropagation();const e=this.getShortcutOption(t);if(e){t.preventDefault(),this.applyOption(e);return}if(t.key==="Escape"){t.preventDefault(),this.close();return}if(t.key==="ArrowDown"){t.preventDefault(),this.moveSelection(1);return}if(t.key==="ArrowUp"){t.preventDefault(),this.moveSelection(-1);return}if(t.key==="Home"){t.preventDefault(),this.selectedIndex=0,this.updateSelectedOption(),this.focusSelectedButton();return}if(t.key==="End"){t.preventDefault(),this.selectedIndex=w.length-1,this.updateSelectedOption(),this.focusSelectedButton();return}if(t.key==="Enter"){t.preventDefault();const r=w[this.selectedIndex];r&&this.applyOption(r.id);return}if(t.key==="Backspace"){t.preventDefault(),this.typedQuery.length>0&&(this.typedQuery=this.typedQuery.slice(0,-1),this.scheduleTypedQueryReset());return}!t.metaKey&&!t.ctrlKey&&!t.altKey&&t.key.length===1&&/\S/.test(t.key)&&(t.preventDefault(),this.handleTypeaheadInput(t.key))};onKeyUp=t=>{t.key==="Alt"&&(this.altKeyPressed=!1),this.opened&&t.key==="Alt"&&(this.optionHintsVisible=!1,this.syncOptionHints())};onWindowBlur=()=>{this.altKeyPressed=!1,this.opened&&(this.optionHintsVisible=!1,this.syncOptionHints())};onResize=()=>{this.opened&&this.syncPosition()};getTaskTypeIconSvg(t){return{none:'<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="6" width="16" height="12" rx="3.2" stroke="currentColor" stroke-width="1.9"/><line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',send:'<svg viewBox="0 0 24 24" fill="none"><rect x="3.8" y="6.5" width="13" height="9.2" rx="2" stroke="currentColor" stroke-width="1.9"/><path d="M3.8 7.8 L10.3 12.1 L16.8 7.8" stroke="currentColor" stroke-width="1.6"/><line x1="16.8" y1="11.1" x2="21" y2="11.1" stroke="currentColor" stroke-width="1.9"/><path d="M21 11.1 L18.5 9.2 M21 11.1 L18.5 13" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',receive:'<svg viewBox="0 0 24 24" fill="none"><rect x="7.2" y="6.5" width="13" height="9.2" rx="2" stroke="currentColor" stroke-width="1.9"/><path d="M7.2 7.8 L13.7 12.1 L20.2 7.8" stroke="currentColor" stroke-width="1.6"/><line x1="3" y1="11.1" x2="7.2" y2="11.1" stroke="currentColor" stroke-width="1.9"/><path d="M3 11.1 L5.5 9.2 M3 11.1 L5.5 13" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',script:'<svg viewBox="0 0 24 24" fill="none"><path d="M6 4.6 H13.7 L18 8.9 V19.4 H6 Z" stroke="currentColor" stroke-width="1.9"/><line x1="8.4" y1="11.5" x2="15.8" y2="11.5" stroke="currentColor" stroke-width="1.7"/><line x1="8.4" y1="15.2" x2="14.3" y2="15.2" stroke="currentColor" stroke-width="1.7"/></svg>',service:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="6.6" stroke="currentColor" stroke-width="1.9"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><line x1="12" y1="2.8" x2="12" y2="5.1" stroke="currentColor" stroke-width="1.8"/><line x1="12" y1="18.9" x2="12" y2="21.2" stroke="currentColor" stroke-width="1.8"/><line x1="2.8" y1="12" x2="5.1" y2="12" stroke="currentColor" stroke-width="1.8"/><line x1="18.9" y1="12" x2="21.2" y2="12" stroke="currentColor" stroke-width="1.8"/></svg>',user:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.3" fill="currentColor"/><path d="M5.2 19.2 C5.2 15.2 8 13 12 13 C16 13 18.8 15.2 18.8 19.2" fill="currentColor"/></svg>',manual:'<svg viewBox="0 0 24 24" fill="none"><path d="M6.5 19 V11.5 C6.5 10.2 7.4 9.4 8.4 9.4 C9.3 9.4 10.1 10.1 10.1 11.5 V14" stroke="currentColor" stroke-width="1.8"/><path d="M10.1 14 V8.4 C10.1 7.2 10.9 6.4 12 6.4 C13.1 6.4 13.9 7.2 13.9 8.4 V14.2" stroke="currentColor" stroke-width="1.8"/><path d="M13.9 12.4 C14.8 12 15.9 12.6 16.2 13.5 L17.6 18.2" stroke="currentColor" stroke-width="1.8"/></svg>',"business-rule":'<svg viewBox="0 0 24 24" fill="none"><rect x="4.6" y="5.3" width="14.8" height="13.4" stroke="currentColor" stroke-width="1.9"/><line x1="4.6" y1="10" x2="19.4" y2="10" stroke="currentColor" stroke-width="1.8"/><line x1="9.5" y1="5.3" x2="9.5" y2="18.7" stroke="currentColor" stroke-width="1.8"/></svg>'}[t]}getStyles(){return`
      :host {
        all: initial;
      }

      :host, :host * {
        box-sizing: border-box;
      }

      .sigtastic-quick-wrapper {
        position: fixed;
        inset: 0;
        z-index: 2147483601;
        display: none;
        font-family: "Avenir Next", "Segoe UI", sans-serif;
      }

      .sigtastic-quick-wrapper.open {
        display: block;
      }

      .sigtastic-quick-scrim {
        position: absolute;
        inset: 0;
        background: transparent;
      }

      .sigtastic-quick-anchor {
        position: fixed;
        visibility: hidden;
        pointer-events: none;
        anchor-name: --sigtastic-quick-anchor;
      }

      .sigtastic-quick-panel {
        position: fixed;
        width: min(280px, calc(100vw - 20px));
        min-height: 346px;
        max-height: min(430px, calc(100vh - 20px));
        padding: 10px;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        background: rgba(34, 36, 41, 0.86);
        backdrop-filter: blur(8px) saturate(110%);
        box-shadow: 0 18px 34px rgba(0, 0, 0, 0.34);
        display: grid;
        grid-template-rows: auto auto minmax(0, 1fr);
        gap: 8px;
        color: #f3f3f3;
        overflow: hidden;
      }

      .sigtastic-quick-panel[data-anchored="true"] {
        position-anchor: --sigtastic-quick-anchor;
        top: anchor(top);
        left: anchor(right);
        margin-left: ${T}px;
        margin-top: -4px;
      }

      .sigtastic-quick-panel[data-applying="true"] {
        opacity: 0.92;
      }

      .sigtastic-quick-header {
        display: grid;
        gap: 2px;
        padding: 2px 2px 0;
      }

      .sigtastic-quick-title {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.01em;
      }

      .sigtastic-quick-subtitle {
        font-size: 10px;
        color: rgba(243, 243, 243, 0.64);
      }

      .sigtastic-quick-divider {
        height: 1px;
        background: rgba(255, 255, 255, 0.16);
      }

      .sigtastic-quick-list {
        display: grid;
        align-content: start;
        gap: 4px;
        overflow: auto;
      }

      .sigtastic-quick-option {
        display: grid;
        grid-template-columns: 28px minmax(0, 1fr) 70px 18px;
        align-items: center;
        gap: 10px;
        width: 100%;
        min-height: 36px;
        padding: 7px 10px;
        border-radius: 10px;
        border: 1px solid transparent;
        background: transparent;
        color: inherit;
        text-align: left;
        cursor: pointer;
        transition: background 120ms ease, border-color 120ms ease;
      }

      .sigtastic-quick-option:hover,
      .sigtastic-quick-option:focus-visible,
      .sigtastic-quick-option[data-selected="true"] {
        background: rgba(0, 0, 0, 0.18);
        border-color: rgba(255, 255, 255, 0.12);
        outline: none;
      }

      .sigtastic-quick-icon {
        display: grid;
        place-items: center;
        width: 24px;
        height: 24px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.07);
        color: rgba(255, 255, 255, 0.92);
      }

      .sigtastic-quick-icon svg {
        width: 16px;
        height: 16px;
      }

      .sigtastic-quick-label {
        font-size: 12px;
        line-height: 1.15;
        font-weight: 500;
        color: #f6f6f6;
      }

      .sigtastic-quick-current {
        grid-column: 3;
        justify-self: end;
        padding: 3px 7px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        font-size: 9px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: rgba(243, 243, 243, 0.78);
      }

      .sigtastic-quick-shortcut {
        grid-column: 4;
        justify-self: end;
        min-width: 10px;
        font-size: 10px;
        font-weight: 600;
        color: rgba(243, 243, 243, 0.62);
        opacity: 0;
        transform: translateX(-3px);
        transition: opacity 120ms ease, transform 120ms ease;
      }

      .sigtastic-quick-panel[data-option-hints="true"] .sigtastic-quick-shortcut {
        opacity: 1;
        transform: translateX(0);
      }

      @media (max-width: 720px) {
        .sigtastic-quick-panel {
          width: min(250px, calc(100vw - 12px));
          min-height: 332px;
          max-height: min(390px, calc(100vh - 12px));
          padding: 8px;
          border-radius: 14px;
        }

        .sigtastic-quick-option {
          padding: 6px 8px;
        }
      }
    `}}const ae="sigtastic-hook";let k=null,I=null;const B=new Map,A=new Map,W=new Map,x=(()=>{let i=null,t=null;return e=>{i||(i=document.createElement("div"),i.style.position="fixed",i.style.right="20px",i.style.bottom="20px",i.style.zIndex="2147483647",i.style.padding="10px 14px",i.style.background="rgba(31, 31, 31, 0.92)",i.style.color="#f3f3f3",i.style.border="1px solid rgba(255, 255, 255, 0.2)",i.style.borderRadius="12px",i.style.fontFamily="system-ui, sans-serif",i.style.fontSize="13px",i.style.boxShadow="0 8px 28px rgba(0, 0, 0, 0.35)",i.style.backdropFilter="blur(3px)",document.body.appendChild(i)),i.textContent=e,i.style.opacity="1",t&&window.clearTimeout(t),t=window.setTimeout(()=>{i&&(i.style.opacity="0")},2500)}})(),ce=i=>new Promise(t=>{const e=document.createElement("div");e.style.position="fixed",e.style.inset="0",e.style.zIndex="2147483647",e.style.display="grid",e.style.placeItems="center";const r=document.createElement("div");r.style.position="absolute",r.style.inset="0",r.style.background="rgba(10, 12, 14, 0.4)",r.style.backdropFilter="blur(3px)";const s=document.createElement("div");s.style.position="relative",s.style.width="min(720px, calc(100vw - 32px))",s.style.maxWidth="100%",s.style.maxHeight="calc(100vh - 32px)",s.style.overflow="auto",s.style.boxSizing="border-box",s.style.padding="16px",s.style.borderRadius="16px",s.style.background="rgba(26, 28, 33, 0.92)",s.style.border="1px solid rgba(255, 255, 255, 0.2)",s.style.boxShadow="0 22px 54px rgba(0, 0, 0, 0.62)",s.style.display="grid",s.style.gap="12px",s.style.fontFamily='"Avenir Next", "Segoe UI", sans-serif',s.addEventListener("click",m=>m.stopPropagation());const n=document.createElement("div");n.textContent="Save Favorite",n.style.fontSize="18px",n.style.fontWeight="700",n.style.color="#f3f3f3";const a=document.createElement("label");a.textContent="Name",a.style.fontSize="12px",a.style.fontWeight="600",a.style.color="rgba(243,243,243,0.86)",a.style.display="grid",a.style.gap="6px",a.style.minWidth="0";const o=document.createElement("input");o.type="text",o.value=i.name,o.style.display="block",o.style.width="100%",o.style.maxWidth="100%",o.style.minWidth="0",o.style.boxSizing="border-box",o.style.padding="9px 11px",o.style.borderRadius="10px",o.style.border="1px solid rgba(255,255,255,0.18)",o.style.background="rgba(255,255,255,0.08)",o.style.color="#ececec",o.style.fontSize="15px",o.style.outline="none";const c=document.createElement("label");c.textContent="Content",c.style.fontSize="12px",c.style.fontWeight="600",c.style.color="rgba(243,243,243,0.86)",c.style.display="grid",c.style.gap="6px",c.style.minWidth="0";const l=document.createElement("input");l.type="text",l.value=i.content,l.style.display="block",l.style.width="100%",l.style.maxWidth="100%",l.style.minWidth="0",l.style.boxSizing="border-box",l.style.padding="9px 11px",l.style.borderRadius="10px",l.style.border="1px solid rgba(255,255,255,0.18)",l.style.background="rgba(255,255,255,0.08)",l.style.color="#ececec",l.style.fontSize="15px",l.style.outline="none",a.append(o),c.append(l);const d=document.createElement("div");d.style.display="flex",d.style.justifyContent="flex-end",d.style.gap="8px";const p=document.createElement("button");p.type="button",p.textContent="Cancel",p.style.padding="8px 12px",p.style.borderRadius="10px",p.style.border="1px solid rgba(255,255,255,0.2)",p.style.background="rgba(255,255,255,0.06)",p.style.color="#ececec",p.style.cursor="pointer";const g=document.createElement("button");g.type="button",g.textContent="Save",g.style.padding="8px 12px",g.style.borderRadius="10px",g.style.border="1px solid rgba(255,255,255,0.32)",g.style.background="rgba(255,255,255,0.16)",g.style.color="#f6f6f6",g.style.fontWeight="700",g.style.cursor="pointer",d.append(p,g),s.append(n,a,c,d),e.append(r,s),document.body.append(e);const f=m=>{document.removeEventListener("keydown",y,!0),e.remove(),t(m)},M=()=>{f({name:o.value.trim(),content:l.value.trim()})},y=m=>{if(m.key==="Escape"){m.preventDefault(),f(null);return}m.key==="Enter"&&(m.preventDefault(),M())};r.addEventListener("click",()=>f(null)),p.addEventListener("click",()=>f(null)),g.addEventListener("click",M),document.addEventListener("keydown",y,!0),window.setTimeout(()=>{o.focus(),o.select()},0)}),le=i=>{if(typeof i!="object"||i===null)return!1;const t=i,e=!("requestTemplate"in t)||t.requestTemplate===void 0||typeof t.requestTemplate=="object"&&t.requestTemplate!==null;return typeof t.namespace=="string"&&typeof t.capturedAt=="number"&&(t.source==="fetch"||t.source==="xhr"||t.source==="manual")&&"valueJson"in t&&e},ut=i=>`${i}-${Date.now()}-${Math.random().toString(36).slice(2,10)}`,de=i=>{if(typeof i!="object"||i===null)return!1;const t=i;return typeof t.hasSelection=="boolean"&&typeof t.selectedCount=="number"&&typeof t.isTask=="boolean"&&(t.taskType===null||typeof t.taskType=="string")&&(t.shapeId===null||typeof t.shapeId=="string")},pe=()=>{if(document.getElementById("sigtastic-clipboard-hook"))return;const i=document.createElement("script");i.id="sigtastic-clipboard-hook",i.src=b.runtime.getURL("clipboard-hook.js"),i.async=!1,i.onload=()=>{i.remove()},(document.head||document.documentElement).appendChild(i)},ue=i=>{const t=B.get(i.requestId);if(t){if(window.clearTimeout(t.timer),B.delete(i.requestId),i.ok){t.resolve();return}t.reject(new Error(i.error||`Clipboard write failed (${i.status??"unknown"})`))}},he=(i,t)=>{if(i.type!==t||typeof i.requestId!="string")return;const e=A.get(i.requestId);if(e){if(window.clearTimeout(e.timer),A.delete(i.requestId),i.ok===!1){e.reject(new Error(typeof i.error=="string"?i.error:"Editor bridge request failed"));return}e.resolve(i.result)}},fe=async()=>{const i=ut("editor-query"),t=await new Promise((r,s)=>{const n=window.setTimeout(()=>{A.delete(i),s(new Error("Timed out waiting for editor selection info"))},2e4);A.set(i,{resolve:r,reject:s,timer:n}),window.postMessage({source:$,type:"editor-query-request",requestId:i,query:"selection-info"},window.location.origin)});if(!de(t))throw new Error("Editor selection response was invalid");const e=t.shapeId&&W.has(t.shapeId)?W.get(t.shapeId)??null:null;return t.shapeId&&t.taskType&&W.set(t.shapeId,t.taskType),e&&t.isTask&&(t.taskType===null||t.taskType==="none")?{...t,taskType:e}:t.isTask&&t.taskType===null?{...t,taskType:"none"}:t},ge=async(i,t)=>{const e=ut("editor-action"),r=await new Promise((n,a)=>{const o=window.setTimeout(()=>{A.delete(e),a(new Error("Timed out waiting for task type update"))},2e4);A.set(e,{resolve:n,reject:a,timer:o}),window.postMessage({source:$,type:"editor-action-request",requestId:e,action:"set-task-type",taskType:i,shapeId:t},window.location.origin)});if(typeof r!="object"||r===null||typeof r.ok!="boolean")throw new Error("Editor action response was invalid");const s=r;return s.ok&&t&&W.set(t,i),s},ye=async i=>{const t=async e=>{const r=ee({payload:i.payload,namespace:i.namespace,requestTemplate:i.requestTemplate},{sanitize:e});await new Promise((s,n)=>{const a=window.setTimeout(()=>{B.delete(r.requestId),n(new Error("Timed out waiting for page clipboard write result"))},5e3);B.set(r.requestId,{resolve:s,reject:n,timer:a}),window.postMessage(r,window.location.origin)})};try{await t(!1)}catch(e){await t(!0).catch(r=>{throw new Error(`Clipboard write failed (raw + sanitized). First: ${String(e)}. Second: ${String(r)}`)})}},xe=()=>k||(k=new re({onInsert:async i=>{try{await ye(i),x(`Loaded favorite: ${i.name}. Press Cmd/Ctrl+V to paste.`)}catch(t){console.error("[Sigtastic] Failed to write favorite payload",t);const e=t instanceof Error?t.message:String(t);x(`Clipboard write failed: ${e.slice(0,120)}`)}},onDelete:async i=>{const t=await Zt(i.id);k?.refreshFavorites(t),x(`Deleted favorite: ${i.name}`)},onMove:async(i,t)=>{const e=await Xt(i.id,t);k?.refreshFavorites(e)},onClose:()=>{}}),k),me=i=>({none:"None",send:"Send",receive:"Receive",script:"Script",service:"Service",user:"User",manual:"Manual","business-rule":"Business Rule"})[i],we=()=>I||(I=new oe({onApply:async i=>{try{const t=await ge(i,I?.getShapeId()??null);return t.ok?(x(`Changed task type to ${me(i)}.`),!0):(x(t.error||"Unable to change task type."),!1)}catch(t){const e=t instanceof Error?t.message:String(t);return x(`Task type change failed: ${e.slice(0,120)}`),!1}},onClose:()=>{}}),I),ke=async()=>{const i=await dt();if(!i){x("No copied Signavio snippet found yet.");return}const t=E(i.valueJson),e={name:zt(i.valueJson),content:t.contentText},r=await ce(e);if(!r)return;const s=r.name.trim();if(!s){x("Favorite name cannot be empty.");return}if(await Jt(s,i,{displayName:r.name,displayContent:r.content,defaultDisplayName:e.name,defaultDisplayContent:e.content}),k?.isOpen()){const n=await L();k.refreshFavorites(n)}x(`Saved favorite: ${s}`)},be=async()=>{I?.isOpen()&&I.close();const i=await L();xe().toggle(i)},ve=async()=>{k?.isOpen()&&k.close();const i=we();if(i.isOpen()){i.close();return}let t;try{t=await fe()}catch(e){const r=e instanceof Error?e.message:String(e);x(`Unable to inspect selection: ${r.slice(0,120)}`);return}if(!t.hasSelection){x("Select a task first.");return}if(t.selectedCount>1){x("Select a single task for quick type change.");return}if(!t.isTask){x("Quick type menu works on task elements only.");return}i.open(t)},Ce=async i=>{if(i.type==="SIGTASTIC_SAVE_FAVORITE"){await ke();return}if(i.type==="SIGTASTIC_TOGGLE_OVERLAY"){await be();return}i.type==="SIGTASTIC_TOGGLE_QUICK_MENU"&&await ve()},Se={matches:["*://*.signavio.com/*"],runAt:"document_idle",main(){pe(),(async()=>{const t=(await dt())?.requestTemplate,e=t?void 0:(await L()).find(s=>s.requestTemplate)?.requestTemplate,r=t??e;r&&window.postMessage({source:$,type:"clipboard-template-bootstrap",template:r},window.location.origin)})(),window.addEventListener("message",async i=>{if(i.source!==window||i.origin!==window.location.origin)return;const t=i.data;if(!(!t||t.source!==ae||typeof t.type!="string")){if(t.type==="clipboard-captured"&&le(t.payload)){await Yt(t.payload);return}if(t.type==="clipboard-write-result"&&te(t)){ue(t);return}(t.type==="editor-query-result"||t.type==="editor-action-result")&&he(t,t.type==="editor-query-result"?"editor-query-result":"editor-action-result")}}),b.runtime.onMessage.addListener(i=>{if(!(!i||typeof i!="object"||!("type"in i)))return Ce(i)})}};function z(i,...t){}const Ee={debug:(...i)=>z(console.debug,...i),log:(...i)=>z(console.log,...i),warn:(...i)=>z(console.warn,...i),error:(...i)=>z(console.error,...i)};var ht=class ft extends Event{static EVENT_NAME=J("wxt:locationchange");constructor(t,e){super(ft.EVENT_NAME,{}),this.newUrl=t,this.oldUrl=e}};function J(i){return`${b?.runtime?.id}:content:${i}`}const Te=typeof globalThis.navigation?.addEventListener=="function";function Ie(i){let t,e=!1;return{run(){e||(e=!0,t=new URL(location.href),Te?globalThis.navigation.addEventListener("navigate",r=>{const s=new URL(r.destination.url);s.href!==t.href&&(window.dispatchEvent(new ht(s,t)),t=s)},{signal:i.signal}):i.setInterval(()=>{const r=new URL(location.href);r.href!==t.href&&(window.dispatchEvent(new ht(r,t)),t=r)},1e3))}}}var Le=class N{static SCRIPT_STARTED_MESSAGE_TYPE=J("wxt:content-script-started");id;abortController;locationWatcher=Ie(this);constructor(t,e){this.contentScriptName=t,this.options=e,this.id=Math.random().toString(36).slice(2),this.abortController=new AbortController,this.stopOldScripts(),this.listenForNewerScripts()}get signal(){return this.abortController.signal}abort(t){return this.abortController.abort(t)}get isInvalid(){return b.runtime?.id==null&&this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(t){return this.signal.addEventListener("abort",t),()=>this.signal.removeEventListener("abort",t)}block(){return new Promise(()=>{})}setInterval(t,e){const r=setInterval(()=>{this.isValid&&t()},e);return this.onInvalidated(()=>clearInterval(r)),r}setTimeout(t,e){const r=setTimeout(()=>{this.isValid&&t()},e);return this.onInvalidated(()=>clearTimeout(r)),r}requestAnimationFrame(t){const e=requestAnimationFrame((...r)=>{this.isValid&&t(...r)});return this.onInvalidated(()=>cancelAnimationFrame(e)),e}requestIdleCallback(t,e){const r=requestIdleCallback((...s)=>{this.signal.aborted||t(...s)},e);return this.onInvalidated(()=>cancelIdleCallback(r)),r}addEventListener(t,e,r,s){e==="wxt:locationchange"&&this.isValid&&this.locationWatcher.run(),t.addEventListener?.(e.startsWith("wxt:")?J(e):e,r,{...s,signal:this.signal})}notifyInvalidated(){this.abort("Content script context invalidated"),Ee.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){document.dispatchEvent(new CustomEvent(N.SCRIPT_STARTED_MESSAGE_TYPE,{detail:{contentScriptName:this.contentScriptName,messageId:this.id}})),window.postMessage({type:N.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:this.id},"*")}verifyScriptStartedEvent(t){const e=t.detail?.contentScriptName===this.contentScriptName,r=t.detail?.messageId===this.id;return e&&!r}listenForNewerScripts(){const t=e=>{!(e instanceof CustomEvent)||!this.verifyScriptStartedEvent(e)||this.notifyInvalidated()};document.addEventListener(N.SCRIPT_STARTED_MESSAGE_TYPE,t),this.onInvalidated(()=>document.removeEventListener(N.SCRIPT_STARTED_MESSAGE_TYPE,t))}};function Fe(){}function P(i,...t){}const Ae={debug:(...i)=>P(console.debug,...i),log:(...i)=>P(console.log,...i),warn:(...i)=>P(console.warn,...i),error:(...i)=>P(console.error,...i)};return(async()=>{try{const{main:i,...t}=Se;return await i(new Le("content",t))}catch(i){throw Ae.error('The content script "content" crashed on startup!',i),i}})()})();
content;