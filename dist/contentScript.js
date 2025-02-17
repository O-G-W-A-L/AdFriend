let m=null;async function w(){if(m)return m;try{let t=(await(await fetch(chrome.runtime.getURL("quotes.csv"))).text()).split(`
`).map(e=>e.trim()).filter(e=>e);return t.length>0&&(t[0].toLowerCase().includes("quote")||t[0].toLowerCase().includes("author"))&&t.shift(),m=t.map(e=>{if(e.indexOf(",")===-1)return{text:e.replace(/^"|"$/g,""),author:""};{const a=e.indexOf(",");return{text:e.substring(0,a).replace(/^"|"$/g,"").trim(),author:e.substring(a+1).replace(/^"|"$/g,"").trim()}}}).filter(e=>e&&e.text),console.log("Loaded quotes:",m),m}catch(n){return console.error("Failed to load quotes:",n),[]}}async function v(n,o,t){let e;if(n&&Array.isArray(n)&&n.length>0?e=n.map(r=>typeof r=="string"?{text:r,author:""}:r):e=await w(),!e||e.length===0)return console.error("No quotes available"),null;const a=Math.floor(Math.random()*e.length),c=e[a];console.log("Selected quote index:",a,"Quote:",c);const d=document.documentElement.classList.contains("dark")||window.matchMedia("(prefers-color-scheme: dark)").matches,s=document.createElement("div");s.style.cssText=`
    width: ${o}px;
    height: ${t}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
    background: ${d?"#2D3748":"#FFF"};
    border: 1px solid ${d?"#4A5568":"#E2E8F0"};
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    color: ${d?"#E2E8F0":"#2D3748"};
    text-align: center;
    transition: transform 0.2s ease;
    overflow: hidden;
  `,s.onmouseenter=()=>s.style.transform="scale(1.02)",s.onmouseleave=()=>s.style.transform="none";const i=document.createElement("blockquote");if(i.textContent=`“${c.text}”`,i.style.cssText=`
    margin: 0;
    font-size: 1.3rem;
    line-height: 1.6;
    font-style: italic;
    font-family: 'Georgia', serif;
    max-width: 90%;
    padding: 0 30px;
  `,s.appendChild(i),c.author){const r=document.createElement("div");r.textContent=`— ${c.author}`,r.style.cssText=`
      margin-top: 20px;
      font-size: 1rem;
      color: ${d?"#A0AEC0":"#718096"};
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-weight: 500;
    `,s.appendChild(r)}return s}let p=null;const b=async()=>{if(p)return p;try{return p=(await(await fetch(chrome.runtime.getURL("reminders.csv"))).text()).split(`
`).map(t=>t.trim()).filter(Boolean).map(t=>t.replace(/^"|"$/g,""))}catch(n){return console.error("Failed to load reminders:",n),[]}},E=async()=>new Promise(n=>chrome.storage.local.get(["reminders"],async o=>{let t=(o.reminders||[]).map(e=>typeof e=="object"?e.text:e);t.length||(t=await b()),n(t.length?t[Math.floor(Math.random()*t.length)]:null)}));async function C(n,o,t){const e=n&&Array.isArray(n)&&n.length?n:await b();if(!(e!=null&&e.length))return null;const a=e[Math.floor(Math.random()*e.length)],c=typeof a=="object"?a.text:a,d=document.documentElement.classList.contains("dark")||window.matchMedia("(prefers-color-scheme: dark)").matches,s=document.createElement("div");s.style.cssText=`
    position: relative;
    width: ${o}px;
    min-height: ${t}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 25px;
    background: ${d?"#2D3748":"#FFF"};
    border: 1px solid ${d?"#4A5568":"#E2E8F0"};
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    font-family: 'Segoe UI', system-ui, sans-serif;
    color: ${d?"#E2E8F0":"#2D3748"};
    text-align: center;
    transition: transform 0.2s ease;
    overflow: hidden;
  `,s.onmouseenter=()=>s.style.transform="translateY(-2px)",s.onmouseleave=()=>s.style.transform="none";const i=document.createElement("div");i.textContent=c,i.style.cssText=`
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 20px;
    line-height: 1.5;
    max-width: 90%;
  `;const r=document.createElement("button");return r.textContent="Mark Completed",r.style.cssText=`
    padding: 8px 20px;
    font-size: 0.95rem;
    background: #48BB78;
    color: #FFF;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.1s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `,r.onmouseenter=()=>r.style.background="#38A169",r.onmouseleave=()=>r.style.background="#48BB78",r.onmousedown=()=>r.style.transform="scale(0.95)",r.onmouseup=()=>r.style.transform="scale(1)",r.onmouseout=()=>r.style.transform="scale(1)",r.addEventListener("click",async()=>{i.innerHTML=`
      <div style="display: flex; align-items: center; gap: 8px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#48BB78">
          <path d="M0 0h24v24H0z" fill="none"/>
          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
        </svg>
        <span style="text-decoration: line-through; color: ${d?"#A0AEC0":"#718096"};">
          ${c}
        </span>
      </div>
    `,r.remove();const l=document.createElement("div");l.textContent="Great job! Keep up the good work!",l.style.cssText=`
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(72,187,120,0.9);
      color: #FFF;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 1rem;
      z-index: 10;
      opacity: 0;
      transition: opacity 0.3s ease;
    `,s.appendChild(l),setTimeout(()=>l.style.opacity="1",50),setTimeout(()=>{l.style.opacity="0",setTimeout(()=>l.remove(),300)},1500),chrome.runtime.sendMessage({action:"reminderCompleted",reminderText:c},()=>{chrome.runtime.lastError&&console.warn(chrome.runtime.lastError.message),setTimeout(async()=>{const h=await E();h?(i.textContent=typeof h=="object"?h.text:h,s.appendChild(r)):i.textContent="You're all caught up! 🎉"},2e3)})}),s.append(i,r),s}console.log("AdFriend content script loaded!");const u={adKeywords:["\\bad\\b","\\bads\\b","\\badvert\\b","\\badvertisement\\b","\\bsponsored\\b","\\bpromoted\\b","\\bbanner\\b","\\bbannerad\\b","\\brecommended\\b"],blocklist:["\\badd\\b","\\baddress\\b","\\badmin\\b","\\badvance\\b","\\bavatar\\b","\\bbadge\\b","\\bcard\\b","\\bcloud\\b"],attributes:["data-ad","data-ad-type","role","id","class","aria-label"],minSize:{width:100,height:50}},A=new RegExp(u.adKeywords.join("|"),"i"),k=new RegExp(u.blocklist.join("|"),"i");class ${constructor(){this.types=["quote","reminder"],this.counter=0}async getUserContent(o){try{const t=await chrome.storage.local.get([o]);if(t[o]&&Array.isArray(t[o])&&t[o].length>0)return t[o]}catch(t){console.error("Error accessing user content:",t)}return null}async replaceAd(o){if(!o||!o.parentNode||o.dataset.adfriendProcessed)return;o.dataset.adfriendProcessed="true";const t=o.getBoundingClientRect(),e=t.width||300,a=t.height||250,c=document.createElement("div");Object.assign(c.style,{width:`${e}px`,height:`${a}px`,position:"relative",display:"flex",justifyContent:"center",alignItems:"center",background:"#f3f3f3",border:"1px solid #ccc",overflow:"hidden"}),o.replaceWith(c);const d=this.types[this.counter%this.types.length];this.counter++;try{const s=await this.getUserContent(d);let i;d==="quote"?i=await v(s,e,a):i=await C(s,e,a),i&&(c.innerHTML="",c.appendChild(i))}catch(s){console.error("Error rendering content:",s)}}}function x(n){if(!n||!n.matches||n.dataset.adfriendProcessed||n.closest("header, nav, footer, aside"))return!1;if(n.classList.contains("adsbygoogle")||n.hasAttribute("data-ad-client"))return!0;try{const{width:t,height:e}=n.getBoundingClientRect();if(t<u.minSize.width||e<u.minSize.height||window.getComputedStyle(n).visibility==="hidden")return!1}catch{return!1}const o=u.attributes.map(t=>(n.getAttribute(t)||"").toLowerCase()).join(" ");return A.test(o)&&!k.test(o)}const y=new $;function F(){const n="ins.adsbygoogle, iframe[src*='ad'], div[id*='ad'], div[class*='ad']";document.querySelectorAll(n).forEach(o=>{x(o)&&y.replaceAd(o)})}const f=new MutationObserver(n=>{n.forEach(({addedNodes:o})=>{o.forEach(t=>{(function e(a){a.nodeType===Node.ELEMENT_NODE&&(x(a)&&y.replaceAd(a),a.childNodes.forEach(e))})(t)})})});function g(){F(),f.observe(document.documentElement,{childList:!0,subtree:!0}),window.addEventListener("beforeunload",()=>f.disconnect())}document.readyState==="complete"?g():window.addEventListener("load",g);
