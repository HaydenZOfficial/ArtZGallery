(() => {
  "use strict";
  const CONFIG = Object.freeze({supabaseUrl:"https://tgcprvavaazeyzxwnjxa.supabase.co",supabaseKey:"sb_publishable_PC89E5N1Kr0JZ45ILlahHQ_J9ZRnX1A",functionName:"submit-commission"});
  if (!window.supabase?.createClient) { document.body.innerHTML='<main style="padding:2rem;font-family:system-ui;background:#110018;color:white;min-height:100vh"><h1>Commission form unavailable</h1><p>The Supabase library did not load. Refresh and try again.</p></main>'; return; }
  const db=window.supabase.createClient(CONFIG.supabaseUrl,CONFIG.supabaseKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  const $=s=>document.querySelector(s);
  const elements={year:$("#year"),menuButton:$(".menu-button"),nav:$("#site-nav"),form:$("#commission-request-form"),formStatus:$("#commission-form-status"),submitButton:$("#submit-commission"),startedAt:$("#form-started-at"),paymentClaim:$("#payment-claim"),paymentDetails:$("#payment-details"),success:$("#commission-success"),reference:$("#commission-reference"),newRequest:$("#new-commission-request")};
  function resetStartedAt(){elements.startedAt.value=String(Date.now());}
  function setStatus(message="",type=""){elements.formStatus.textContent=message;elements.formStatus.className=`form-status${type?` is-${type}`:""}`;}
  function setBusy(busy){elements.submitButton.disabled=busy;elements.submitButton.textContent=busy?"Sending securely…":"Send private request";}
  function updatePaymentFields(){const paidClaimed=elements.paymentClaim.value==="already_paid";elements.paymentDetails.hidden=!paidClaimed;elements.form.elements.paymentMethod.required=paidClaimed;elements.form.elements.paymentReference.required=paidClaimed;}

  function updateCommissionPrices(){
    const cards=[...document.querySelectorAll(".pricing-grid .price-file")];
    const pricing=[
      {name:"Headshot",description:"Portrait focus",footer:"FACE / BUST",prices:["$15","$25","$30","$40"]},
      {name:"Half Body",description:"Waist-up composition",footer:"WAIST / UP",prices:["$20","$30","$40","$50"]},
      {name:"Knee Up",description:"Expanded character view",footer:"KNEE / UP",prices:["$10","$20","$30","$40+"]},
      {name:"Full Body",description:"Complete character art",footer:"FULL / FRAME",prices:["$25","$40","$50","$80"]}
    ];
    pricing.forEach((item,index)=>{
      const card=cards[index]; if(!card)return;
      const title=card.querySelector("h3"), description=card.querySelector("header b"), values=[...card.querySelectorAll("dl dd")], footer=card.querySelector("footer span");
      if(title)title.textContent=item.name;
      if(description)description.textContent=item.description;
      values.forEach((value,i)=>{if(item.prices[i])value.textContent=item.prices[i];});
      if(footer)footer.textContent=item.footer;
    });
    const specialty=document.querySelector(".specialty-strip");
    if(specialty){
      specialty.innerHTML='<div><span>EXTRA / A</span><strong>Emote</strong><b>$15–$20</b></div><div><span>EXTRA / B</span><strong>Reference Sheet</strong><b>$35–$100</b></div><div><span>EXTRA / C</span><strong>VRC Retexture</strong><b>~$30+</b><small>Furry models only</small></div><div><span>EXTRA / D</span><strong>Character Design</strong><b>ASK / TBA</b></div><div><span>EXTRA / E</span><strong>Animation Meme</strong><b>ASK / TBA</b></div>';
    }
  }

  function updateCommissionTypeOptions(){
    const select=elements.form?.elements.commissionType; if(!select)return;
    const current=select.value;
    select.innerHTML='<option value="">Select a service</option><option value="Headshot">Headshot</option><option value="Half Body">Half Body</option><option value="Knee Up">Knee Up</option><option value="Full Body">Full Body</option><option value="Emote or Sticker">Emote or Sticker</option><option value="Reference Sheet">Reference Sheet</option><option value="VRC Retexture">VRC Retexture</option><option value="Character Design">Character Design</option><option value="Animation Meme">Animation Meme</option><option value="Other">Other / custom request</option>';
    if([...select.options].some(option=>option.value===current))select.value=current;
  }

  function collectPayload(){const data=new FormData(elements.form);return {name:String(data.get("name")||""),email:String(data.get("email")||""),contactMethod:String(data.get("contactMethod")||""),contactHandle:String(data.get("contactHandle")||""),commissionType:String(data.get("commissionType")||""),usageType:String(data.get("usageType")||""),budget:String(data.get("budget")||""),deadline:String(data.get("deadline")||""),message:String(data.get("message")||""),referenceLinks:String(data.get("referenceLinks")||""),paymentClaim:String(data.get("paymentClaim")||""),paymentMethod:String(data.get("paymentMethod")||""),paymentReference:String(data.get("paymentReference")||""),website:String(data.get("website")||""),startedAt:Number(data.get("startedAt")||0)};}
  async function submitRequest(event){event.preventDefault();setStatus();setBusy(true);const {data,error}=await db.functions.invoke(CONFIG.functionName,{body:collectPayload()});setBusy(false);if(error){let message=error.message||"The request could not be delivered.";try{const context=error.context;if(context instanceof Response){const body=await context.clone().json();if(body?.error)message=body.error;}}catch{}setStatus(message,"error");return;}if(!data?.referenceCode){setStatus("The server did not return a reference number. Please try again.","error");return;}elements.reference.textContent=data.referenceCode;elements.form.hidden=true;elements.success.hidden=false;elements.success.scrollIntoView({behavior:"smooth",block:"center"});}
  function startNewRequest(){elements.form.reset();updateCommissionTypeOptions();updatePaymentFields();resetStartedAt();setStatus();elements.success.hidden=true;elements.form.hidden=false;elements.form.scrollIntoView({behavior:"smooth",block:"start"});elements.form.elements.name.focus();}
  elements.year.textContent=String(new Date().getFullYear());resetStartedAt();updateCommissionPrices();updateCommissionTypeOptions();updatePaymentFields();elements.paymentClaim.addEventListener("change",updatePaymentFields);elements.form.addEventListener("submit",submitRequest);elements.newRequest.addEventListener("click",startNewRequest);elements.menuButton.addEventListener("click",()=>{const open=elements.menuButton.getAttribute("aria-expanded")==="true";elements.menuButton.setAttribute("aria-expanded",String(!open));elements.nav.classList.toggle("is-open",!open);});elements.nav.addEventListener("click",event=>{if(event.target.closest("a")){elements.menuButton.setAttribute("aria-expanded","false");elements.nav.classList.remove("is-open");}});
})();
