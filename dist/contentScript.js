let y=null;async function S(){if(y)return y;try{let n=(await(await fetch(chrome.runtime.getURL("quotes.csv"))).text()).split(`
`).map(o=>o.trim()).filter(o=>o);return n.length>0&&(n[0].toLowerCase().includes("quote")||n[0].toLowerCase().includes("author"))&&n.shift(),y=n.map(o=>{if(o.indexOf(",")===-1)return{text:o.replace(/^"|"$/g,""),author:""};{const i=o.indexOf(",");return{text:o.substring(0,i).replace(/^"|"$/g,"").trim(),author:o.substring(i+1).replace(/^"|"$/g,"").trim()}}}).filter(o=>o&&o.text),y}catch(t){return console.error("Failed to load quotes:",t),[]}}async function A(t,e,n){const o=await new Promise(r=>chrome.storage.local.get("activeQuotes",d=>r(d.activeQuotes||[])));let i=o.length>0?o:(t==null?void 0:t.length)>0?t.map(r=>typeof r=="string"?{text:r,author:""}:r):await S();if(!i.length)return null;const c=i[Math.floor(Math.random()*i.length)],l=await new Promise(r=>chrome.storage.local.get("displaySettings",d=>r(d.displaySettings||{textColor:"#000000",backgroundColor:"#ffffff",fontSize:"16px",fontFamily:"Arial, sans-serif"}))),a=document.createElement("div");a.style.cssText=`
    width: ${e}px;
    height: ${n}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: ${l.backgroundColor};
    border-radius: 8px;
    color: ${l.textColor};
    font-family: ${l.fontFamily};
    font-size: ${l.fontSize};
    text-align: center;
    transition: transform 0.2s ease;
  `;const s=document.createElement("blockquote");if(s.textContent=`“${c.text}”`,s.style.cssText=`
    margin: 0;
    line-height: 1.6;
    font-style: italic;
    max-width: 90%;
  `,a.appendChild(s),c.author){const r=document.createElement("div");r.textContent=`— ${c.author}`,r.style.cssText=`
      margin-top: 15px;
      font-size: 0.85em;
      opacity: 0.8;
    `,a.appendChild(r)}return a}let f=[],b=!1,h=[];function L(t,e){return new Promise(n=>{t.style.transition=`opacity ${e}ms ease`,t.style.opacity=0,setTimeout(n,e)})}function M(t,e){return new Promise(n=>{t.style.transition=`opacity ${e}ms ease`,t.style.opacity=1,setTimeout(n,e)})}function z(){const t=document.createElement("div");t.innerHTML="🎉",t.style.cssText=`
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: 3rem;
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
    animation: popEffect 0.8s ease-out forwards;
  `,document.body.appendChild(t),setTimeout(()=>t.remove(),800)}async function E(){if(h.length)return h;try{h=(await(await fetch(chrome.runtime.getURL("reminders.csv"))).text()).split(`
`).map(e=>e.trim()).filter(e=>e)}catch(t){console.error("Error loading CSV:",t)}return h}async function R(t,e,n){let o=await new Promise(m=>chrome.storage.local.get("activeReminders",u=>m(u.activeReminders||[])));!b&&(t!=null&&t.length)&&(f=[...t],b=!0);let i=[];if(o.length>0?i=[...o]:f.length>0?i=[...f]:i=await E(),!i.length)return null;const c=await new Promise(m=>chrome.storage.local.get("displaySettings",u=>m(u.displaySettings||{textColor:"#000000",backgroundColor:"#ffffff",fontSize:"16px",fontFamily:"Arial, sans-serif"}))),l=document.createElement("div");l.style.cssText=`
    width: ${e}px;
    min-height: ${n}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: ${c.backgroundColor};
    border-radius: 8px;
    color: ${c.textColor};
    font-family: ${c.fontFamily};
    font-size: ${c.fontSize};
    text-align: center;
    transition: transform 0.2s ease;
    position: relative;
  `;let a=Math.floor(Math.random()*i.length),s=i[a];const r=document.createElement("div");r.textContent=typeof s=="object"?s.text:s,r.style.cssText=`
    margin-bottom: 15px;
    font-weight: 500;
    max-width: 90%;
    opacity: 1;
    transition: opacity 0.3s ease;
  `;const d=document.createElement("button");return d.textContent="✔ Done!",d.style.cssText=`
    padding: 8px 20px;
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: opacity 0.2s ease;
  `,d.addEventListener("click",async()=>{await L(r,300),r.innerHTML=`✅ <span style="text-decoration: line-through; opacity: 0.7;">
      ${typeof s=="object"?s.text:s}
    </span>`,d.remove(),z();const m=["Great job! 🎉","Well done! 👏","Task completed! ✅","You're awesome! 💪","Keep it up! 🚀"],u=document.createElement("div");u.textContent=m[Math.floor(Math.random()*m.length)],u.style.cssText=`
      position: absolute;
      bottom: 20px;
      font-size: 0.9em;
      opacity: 0;
      transition: opacity 0.3s ease;
    `,l.appendChild(u),setTimeout(()=>{u.style.opacity="1",setTimeout(()=>u.style.opacity="0",1500)},100),setTimeout(async()=>{o.length>0?(o=o.filter((w,g)=>g!==a),await chrome.storage.local.set({activeReminders:o})):f.length>0?f=f.filter((w,g)=>g!==a):h=h.filter((w,g)=>g!==a);const x=o.length>0?o:f.length>0?f:await E();x.length>0?(a=Math.floor(Math.random()*x.length),s=x[a],r.style.opacity="0",r.innerHTML=typeof s=="object"?s.text:s,l.appendChild(d),await M(r,300)):(r.innerHTML="All caught up! 🎉",r.style.opacity="1")},2e3)}),l.append(r,d),l}console.log("AdFriend content script loaded!");const p={minSize:{width:100,height:50},adDomains:["doubleclick.net","googlesyndication.com","adservice.google.com","adnxs.com","adform.net","taboola.com","outbrain.com"]};function k(t){try{const e=window.getComputedStyle(t);return e.display!=="none"&&e.visibility!=="hidden"}catch{return!1}}function T(t){if(!t||!t.matches||t.dataset.adfriendProcessed||t.closest("header, nav, footer, aside"))return!1;try{const n=t.getBoundingClientRect();if(n.width<p.minSize.width||n.height<p.minSize.height)return!1}catch{return!1}if(!k(t))return!1;const e=t.tagName;if(e==="IFRAME"&&t.src){const n=t.src.toLowerCase();for(const o of p.adDomains)if(n.includes(o))return!0}if(t.matches("ins.adsbygoogle")||t.hasAttribute("data-ad-client"))return!0;if(e==="OBJECT"||e==="EMBED"){const n=(t.getAttribute("data")||t.getAttribute("src")||"").toLowerCase();if(n.endsWith(".swf")||n.includes("flash"))return!0}if(e==="IMG"&&t.src&&t.src.toLowerCase().endsWith(".gif")){const n=t.getAttribute("alt")||"",o=t.getAttribute("title")||"";if((n+o).trim()==="")return!0;const i=t.closest("a, div, span, section");if(i){const c=(i.id+" "+i.className).toLowerCase();if(/^\s*(ad|ads)\s*$/i.test(c))return!0}}if(e==="DIV"||e==="SECTION"||e==="SPAN"){const n=(t.id+" "+t.className).toLowerCase().trim();if(/^(ad|ads)$/.test(n)){const o=t.innerText.trim();if((o?o.split(/\s+/).length:0)<10||t.childElementCount<3)return!0}}return!1}class P{constructor(){this.types=["quote","reminder"],this.counter=0}async getUserContent(e){try{const n=await chrome.storage.local.get([e]);if(n[e]&&Array.isArray(n[e])&&n[e].length>0)return n[e]}catch(n){console.error("Error accessing user content:",n)}return null}async replaceAd(e){if(!e||!e.parentNode||e.dataset.adfriendProcessed)return;e.dataset.adfriendProcessed="true";const n=e.getBoundingClientRect(),o=n.width||p.minSize.width,i=n.height||p.minSize.height,c=document.createElement("div");Object.assign(c.style,{width:`${o}px`,height:`${i}px`,position:"relative",display:"flex",justifyContent:"center",alignItems:"center",background:"#f3f3f3",border:"1px solid #ccc",overflow:"hidden"}),e.replaceWith(c);const l=this.types[this.counter%this.types.length];this.counter++;try{const a=await this.getUserContent(l);let s;l==="quote"?s=await A(a,o,i):s=await R(a,o,i),s&&(c.innerHTML="",c.appendChild(s))}catch(a){console.error("Error rendering content:",a)}}}const $=new P;function N(){const t=["ins.adsbygoogle","iframe","object","embed","img","div","section","span"].join(", ");document.querySelectorAll(t).forEach(e=>{T(e)&&$.replaceAd(e)})}const C=new MutationObserver(t=>{t.forEach(({addedNodes:e})=>{e.forEach(n=>{(function o(i){i.nodeType===Node.ELEMENT_NODE&&(T(i)&&$.replaceAd(i),i.childNodes.forEach(o))})(n)})})});function v(){N(),C.observe(document.documentElement,{childList:!0,subtree:!0}),window.addEventListener("beforeunload",()=>C.disconnect())}document.readyState==="complete"?v():window.addEventListener("load",v);
