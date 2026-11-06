(() => {
  const $ = (id) => document.getElementById(id);
  const category = $("category");
  const people = $("peopleValue");
  const entitlementEl = $("entitlement");
  const summaryEntitlement = $("summaryEntitlement");
  const recordsBody = $("recordsBody");
  const storageKey = "annalekha_entries_v1";
  let count = 4;
  let entries = [];
  try { entries = JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { entries = []; }

  const entitlement = () => category.value === "aay" ? 35 : count * 5;
  const localDate = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const monthKey = () => localDate().slice(0,7);
  const monthEntries = () => entries.filter(e => e.date.slice(0,7) === monthKey());
  const fmt = n => Number(n).toLocaleString("hi-IN", {maximumFractionDigits:2});
  const save = () => { try { localStorage.setItem(storageKey, JSON.stringify(entries)); } catch {} };
  const toast = (msg) => {
    $("toast").textContent = msg;
    $("toast").classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => $("toast").classList.remove("show"), 2600);
  };
  const refresh = () => {
    const target = entitlement();
    const list = monthEntries();
    const total = list.reduce((s,e) => s + Number(e.quantity), 0);
    const left = Math.max(0, target-total);
    entitlementEl.textContent = fmt(target);
    summaryEntitlement.textContent = fmt(target);
    $("received").textContent = fmt(total);
    $("remaining").textContent = total > target ? `${fmt(total-target)} कि.ग्रा. अधिक` : `${fmt(left)} कि.ग्रा.`;
    $("meterFill").style.width = `${Math.min(100, target ? total/target*100 : 0)}%`;
    $("status").textContent = total === 0 ? "अभी कोई प्राप्ति दर्ज नहीं है।" : total < target ? `अभी ${fmt(left)} किलोग्राम शेष है। अगली प्राप्ति भी दर्ज करें।` : total === target ? "दर्ज मात्रा सामान्य मासिक अधिकार के बराबर है।" : `दर्ज मात्रा सामान्य अधिकार से ${fmt(total-target)} किलोग्राम अधिक है।`;
    $("emptyState").hidden = list.length > 0;
    $("tableWrap").hidden = list.length === 0;
    recordsBody.innerHTML = "";
    list.slice().sort((a,b)=>b.date.localeCompare(a.date)).forEach(e => {
      const tr = document.createElement("tr");
      [new Date(e.date+"T00:00:00").toLocaleDateString("hi-IN"), e.type, `${fmt(e.quantity)} कि.ग्रा.`, e.price ? `₹ ${fmt(e.price)}` : "—", e.note || "—"].forEach(value => {
        const td = document.createElement("td"); td.textContent = value; tr.appendChild(td);
      });
      const td = document.createElement("td");
      const del = document.createElement("button"); del.type="button"; del.textContent="हटाएँ"; del.setAttribute("aria-label","यह प्रविष्टि हटाएँ");
      del.addEventListener("click",()=>{ entries=entries.filter(x=>x.id!==e.id); save(); refresh(); toast("प्रविष्टि हटा दी गई।"); });
      td.appendChild(del); tr.appendChild(td); recordsBody.appendChild(tr);
    });
  };
  const updateCount = () => {
    people.textContent = count;
    $("peopleWrap").hidden = category.value === "aay";
    $("calcNote").textContent = category.value === "aay"
      ? "अन्त्योदय अन्न योजना में सामान्य मानक 35 किलोग्राम प्रति परिवार प्रति माह है।"
      : "प्राथमिकता श्रेणी में सामान्य मानक 5 किलोग्राम प्रति पात्र व्यक्ति प्रति माह है।";
    refresh();
  };
  $("minus").addEventListener("click",()=>{count=Math.max(1,count-1);updateCount();});
  $("plus").addEventListener("click",()=>{count=Math.min(50,count+1);updateCount();});
  category.addEventListener("change",updateCount);
  $("entryDate").value = localDate();
  $("entryForm").addEventListener("submit",e=>{
    e.preventDefault();
    const quantity=Number($("quantity").value);
    if (!Number.isFinite(quantity) || quantity<=0) return;
    entries.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),date:$("entryDate").value,type:$("entryType").value,quantity,price:$("price").value?Number($("price").value):0,note:$("note").value.trim()});
    save(); refresh(); $("quantity").value=""; $("price").value=""; $("note").value="";
    toast("प्राप्ति आपके निजी लेखे में जोड़ दी गई।");
  });
  $("clearBtn").addEventListener("click",()=>{
    if (!confirm("क्या आप इस मास की सभी प्रविष्टियाँ मिटाना चाहते हैं? यह कार्य वापस नहीं होगा।")) return;
    entries=entries.filter(e=>e.date.slice(0,7)!==monthKey()); save(); refresh(); toast("इस मास का लेखा मिटा दिया गया।");
  });
  $("exportBtn").addEventListener("click",()=>{
    const list=monthEntries();
    const rows=[["तिथि","अन्न","मात्रा (किलोग्राम)","देय मूल्य (रुपये)","टिप्पणी"],...list.map(e=>[e.date,e.type,e.quantity,e.price||"",e.note||""])];
    const csv="\uFEFF"+rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\r\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`annalekha-${monthKey()}.csv`; a.click(); URL.revokeObjectURL(url);
    toast("आपका लेखा-पत्र तैयार है।");
  });
  $("printTop").addEventListener("click",()=>window.print());
  updateCount();

  // आधिकारिक राज्यीय शिकायत-मार्ग; जिन क्षेत्रों के लिए सीधा मार्ग सूचीबद्ध नहीं है,
  // उनके लिए राष्ट्रीय खाद्य सुरक्षा अधिनियम की मूल निर्देशिका दी जाती है।
  const directoryUrl = "https://www.nfsa.gov.in/portal/State_UT_Online_Grievance_AA";
  const departmentDirectory = "https://nfsa.gov.in/portal/State_Food_Directorate";
  const regions = [
    ["आंध्र प्रदेश","https://aepos.ap.gov.in/","https://www.apcivilsupplies.gov.in/"],
    ["अरुणाचल प्रदेश","https://pgportal.gov.in/","https://arunfcs.gov.in/"],
    ["असम","https://assam.grams.nic.in/","https://fcsca.assam.gov.in/"],
    ["बिहार","https://ejawaab.aahaar.nic.in/","https://fcp.bih.nic.in/"],
    ["छत्तीसगढ़","https://khadya.cg.nic.in/","https://khadya.cg.nic.in/"],
    ["गोवा","https://nfsa.gov.in/","https://goacivilsupplies.gov.in/"],
    ["गुजरात","https://ipds.gujarat.gov.in/","https://ipds.gujarat.gov.in/"],
    ["हरियाणा",null,null],
    ["हिमाचल प्रदेश","https://epds.co.in/","https://admis.hp.nic.in/"],
    ["झारखंड","https://pds.jharkhand.gov.in/","https://www.jharkhand.gov.in/"],
    ["कर्नाटक",null,"https://ahara.kar.nic.in/"],
    ["केरल","https://pg.civilsupplieskerala.gov.in/","https://civilsupplieskerala.gov.in/"],
    ["मध्य प्रदेश","https://cmhelpline.mp.gov.in/","https://nfsa.gov.in/portal/State_Food_Directorate"],
    ["महाराष्ट्र","https://mahafood.gov.in/","https://nfsa.gov.in/portal/State_Food_Directorate"],
    ["मणिपुर","https://rcmsmanipur.nic.in/","https://nfsa.gov.in/portal/State_Food_Directorate"],
    ["मेघालय","https://megpgrams.gov.in/","https://megfcsca.gov.in/"],
    ["मिजोरम","https://mizorampds.nic.in/","https://nfsa.gov.in/portal/State_Food_Directorate"],
    ["नागालैंड",null,"https://nlsic.gov.in/"],
    ["ओडिशा","https://grs.pdsodisha.gov.in/","https://www.foododisha.in/"],
    ["पंजाब","https://epds.punjab.gov.in/","https://nfsa.gov.in/portal/State_Food_Directorate"],
    ["राजस्थान","https://sampark.rajasthan.gov.in/","https://www.food.rajasthan.gov.in/"],
    ["सिक्किम","https://www.sikkimpds.grams.nic.in/","https://nfsa.gov.in/portal/State_Food_Directorate"],
    ["तमिलनाडु","https://tnpds.gov.in/","https://www.tn.gov.in/"],
    ["तेलंगाना","https://nfsagrams.telangana.nic.in/","https://nfsa.gov.in/portal/State_Food_Directorate"],
    ["त्रिपुरा","https://gramstr.gov.in/","https://tripura.nic.in/"],
    ["उत्तर प्रदेश","https://cms.up.gov.in/","https://fcs.up.nic.in/"],
    ["उत्तराखण्ड","https://www.samadhan.uk.gov.in/","https://uic.gov.in/"],
    ["पश्चिम बंगाल","https://helpdesk.wbfood.in/","https://nfsa.gov.in/portal/State_Food_Directorate"],
    ["अण्डमान और निकोबार द्वीपसमूह","https://dcsca.andaman.gov.in/","https://db.and.nic.in/"],
    ["चण्डीगढ़","https://chdfood.gov.in/","https://chdfood.gov.in/"],
    ["दादरा और नगर हवेली तथा दमन और दीव",null,"https://nfsa.gov.in/portal/State_Food_Directorate"],
    ["राष्ट्रीय राजधानी क्षेत्र दिल्ली","https://www.pgms.delhi.gov.in/","https://delhi.gov.in/"],
    ["जम्मू और कश्मीर","https://feastjk.gov.in/","https://capdjammu.hpage.co.in/"],
    ["लद्दाख",null,"https://nfsa.gov.in/portal/State_Food_Directorate"],
    ["लक्षद्वीप","https://grams.pds.utl.gov.in/","https://nfsa.gov.in/portal/State_Food_Directorate"],
    ["पुदुचेरी","https://pdsswo.py.gov.in/","https://dcsca.puducherry.gov.in/"]
  ];
  const stateSelect = $("stateSelect");
  if (stateSelect) {
    const placeholder=document.createElement("option"); placeholder.value=""; placeholder.textContent="राज्य अथवा क्षेत्र चुनें"; placeholder.selected=true; stateSelect.appendChild(placeholder);
    regions.forEach((r,i) => {
      const option=document.createElement("option"); option.value=String(i); option.textContent=r[0]; stateSelect.appendChild(option);
    });
    const updateRegion = () => {
      if (stateSelect.value === "") {
        $("stateName").textContent="अपने क्षेत्र का चयन करें";
        $("stateDescription").textContent="राज्य चुनने पर उपलब्ध आधिकारिक शिकायत-मार्ग और विभागीय विवरण यहाँ दिखाई देंगे।";
        $("grievanceLink").href=directoryUrl; $("grievanceLink").textContent="राष्ट्रीय राज्य-निर्देशिका खोलें ↗";
        $("departmentLink").href=departmentDirectory; $("stateCaveat").textContent="सभी 28 राज्यों और 8 संघ राज्य क्षेत्रों के लिए राष्ट्रीय निर्देशिकाएँ उपलब्ध हैं।";
        return;
      }
      const [name, grievance, department] = regions[Number(stateSelect.value)];
      $("stateName").textContent=name;
      $("stateDescription").textContent=grievance
        ? "इस क्षेत्र के लिए राष्ट्रीय खाद्य सुरक्षा अधिनियम की आधिकारिक निर्देशिका में दिया गया राज्यीय शिकायत-मार्ग उपलब्ध है।"
        : "इस क्षेत्र का पृथक सीधा शिकायत-पता राष्ट्रीय निर्देशिका में स्पष्ट रूप से उपलब्ध नहीं मिला। नीचे दी गई मूल निर्देशिका से सही मार्ग चुनें।";
      $("grievanceLink").href=grievance || directoryUrl;
      $("grievanceLink").textContent=grievance ? "राज्यीय शिकायत-मार्ग खोलें ↗" : "राष्ट्रीय राज्य-निर्देशिका खोलें ↗";
      $("departmentLink").href=department || departmentDirectory;
      $("stateCaveat").textContent=grievance
        ? "यह बाहरी शासकीय पृष्ठ है। उसकी उपलब्धता, पात्रता और प्रक्रिया संबंधित विभाग के अधीन है।"
        : "इस क्षेत्र के लिए सीधा मार्ग सत्यापित नहीं है। राष्ट्रीय निर्देशिका में क्षेत्र चुनें; अनुमानित पता उपयोग न करें।";
    };
    stateSelect.addEventListener("change",updateRegion);
    updateRegion();
  }

  const complaintForm = $("complaintForm");
  if (complaintForm) {
    complaintForm.addEventListener("submit", e => {
      e.preventDefault();
      const val = id => $(id).value.trim();
      const name = val("personName") || "निवेदक";
      const date = val("incidentDate") ? new Date(val("incidentDate")+"T00:00:00").toLocaleDateString("hi-IN") : "________";
      const expected = val("expectedQty"), actual = val("actualQty");
      let difference = "";
      if (expected !== "" && actual !== "") {
        const gap = Number(expected)-Number(actual);
        difference = gap > 0 ? `निर्धारित मात्रा और प्राप्त मात्रा में ${fmt(gap)} किलोग्राम का अन्तर है।` :
          gap < 0 ? `प्राप्त मात्रा लिखी गई निर्धारित मात्रा से ${fmt(Math.abs(gap))} किलोग्राम अधिक है।` :
          "लिखी गई निर्धारित और प्राप्त मात्राएँ समान हैं।";
      }
      const lines = [
        "सेवा में,",
        "सम्बन्धित जिला खाद्य एवं आपूर्ति अधिकारी महोदय/महोदया,",
        val("districtName") ? `${val("districtName")} जनपद` : "सम्बन्धित जनपद",
        "",
        "विषय: सार्वजनिक अन्न-वितरण सम्बन्धी समस्या के निराकरण हेतु निवेदन।",
        "",
        "महोदय/महोदया,",
        `मैं ${name}, अपने अन्न-वितरण सम्बन्धी निम्न विषय की ओर आपका ध्यान आकर्षित करना चाहता/चाहती हूँ।`,
        `समस्या: ${val("issueType")}.`,
        `घटना की तिथि: ${date}.`,
        val("shopNumber") ? `उचित मूल्य की दुकान का क्रमांक: ${val("shopNumber")}.` : "",
        val("cardNumber") ? `अन्न-पत्र क्रमांक: ${val("cardNumber")}.` : "",
        expected !== "" ? `निर्धारित मात्रा: ${expected} किलोग्राम.` : "",
        actual !== "" ? `वास्तव में प्राप्त मात्रा: ${actual} किलोग्राम.` : "",
        difference,
        val("incidentDetails") ? `घटना का विवरण: ${val("incidentDetails")}` : "",
        "",
        "कृपया प्रस्तुत विषय की जाँच कर नियमानुसार आवश्यक कार्यवाही करने तथा मुझे की गई कार्यवाही की सूचना देने की कृपा करें। उपलब्ध पर्ची अथवा अन्य प्रमाण आवश्यकता पड़ने पर प्रस्तुत किए जा सकते हैं।",
        "",
        "धन्यवाद।",
        "",
        "भवदीय/भवदीया,",
        name,
        val("districtName") ? `${val("districtName")} जनपद` : "",
        `दिनांक: ${new Date().toLocaleDateString("hi-IN")}`
      ].filter(Boolean);
      $("generatedText").textContent=lines.join("\n");
      $("generatedWrap").hidden=false;
      $("generatedWrap").scrollIntoView({behavior:"smooth",block:"nearest"});
    });
    $("copyComplaint").addEventListener("click", async () => {
      const textToCopy=$("generatedText").textContent;
      try { await navigator.clipboard.writeText(textToCopy); toast("निवेदन की प्रति तैयार है।"); }
      catch { toast("प्रति नहीं बन सकी; नीचे का पाठ स्वयं चुनें।"); }
    });
  }

})();