// ==UserScript==
// @name         IRCTC Automation Safari
// @namespace    irctc.mobile.autofill
// @version      2.3
// @description  Mobile Safari IRCTC autofill with always-visible button
// @match        *://*.irctc.co.in/*
// @updateURL    https://github.com/param659/IRCTC-SAFARI-SCRIPT/blob/main/content.user.js
// @downloadURL  https://github.com/param659/IRCTC-SAFARI-SCRIPT/blob/main/content.user.js   
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
'use strict';

console.log("IRCTC Autofill ALWAYS Loaded");

/* ================= CONFIG ================= */

const PASSENGERS = [
  { name:"Trilochan", age:"27", gender:"MALE", berth:"No Preference" },
  { name:"ABHISHEK", age:"27", gender:"MALE", berth:"No Preference" },
  { name:"RUDRA", age:"27", gender:"MALE", berth:"No Preference" },
  { name:"BHEEM", age:"27", gender:"MALE", berth:"No Preference" }
//   { name:"RAJ PATEL", age:"27", gender:"MALE", berth:"No Preference" },
//   { name:"NEELA", age:"27", gender:"MALE", berth:"No Preference" }
];

const CONTACT_NUMBER = "8329935109";
const AUTO_UPGRADE = true;
const CONFIRM_BERTH = true;
const PAYMENT_MODE = "CARD";  // UPI | CARD

/* ========================================== */

const sleep = ms => new Promise(r=>setTimeout(r,ms));

/* -------- STATUS -------- */
function status(t){
 let s=document.getElementById("af-status");
 if(!s){
   s=document.createElement("div");
   s.id="af-status";
   s.style="position:fixed;top:10px;left:50%;transform:translateX(-50%);background:black;color:white;padding:10px;border-radius:8px;z-index:999999;";
   document.body.appendChild(s);
 }
 s.innerText=t;
}

/* -------- SAFE CLICK -------- */
function safeClick(el){
 if(!el) return false;
 el.scrollIntoView({behavior:"smooth",block:"center"});
 el.dispatchEvent(new MouseEvent("mousedown",{bubbles:true}));
 el.dispatchEvent(new MouseEvent("mouseup",{bubbles:true}));
 el.dispatchEvent(new MouseEvent("click",{bubbles:true}));
 return true;
}

/* -------- ANGULAR INPUT -------- */
async function setValue(el,val){
 el.focus();
 el.value="";
 el.dispatchEvent(new Event("focus",{bubbles:true}));
 for(let c of val){
   el.value+=c;
   el.dispatchEvent(new Event("input",{bubbles:true}));
   await sleep(60);
 }
 el.dispatchEvent(new Event("change",{bubbles:true}));
}

/* -------- WAIT ADD PASSENGER -------- */
async function waitAddPassenger(){
 while(true){
   let btn=[...document.querySelectorAll("span")]
     .find(s=>s.textContent.trim()==="+ Add Passenger");
   if(btn) return btn.closest("a");
   await sleep(500);
 }
}

/* -------- ADD BLOCK -------- */
async function addPassenger(){
 let a=await waitAddPassenger();
 safeClick(a);
 await sleep(5);
}

/* -------- FILL ONE -------- */
/* -------- FILL ONE (INSTANT VERSION) -------- */
async function fillOne(p,i){
 let blocks=document.querySelectorAll("app-passenger");
 if(blocks.length<=i){
   await addPassenger();
 }
 let b=document.querySelectorAll("app-passenger")[i];
 
 // 🔥 INSTANT FILL - NO TYPING DELAYS
 const nameInput = b.querySelector('input[placeholder="Name"]');
 const ageInput = b.querySelector('input[placeholder="Age"]');
 
 if(nameInput) {
   nameInput.value = p.name;
   nameInput.dispatchEvent(new Event("input",{bubbles:true}));
   nameInput.dispatchEvent(new Event("change",{bubbles:true}));
 }
 
 if(ageInput) {
   ageInput.value = p.age;
   ageInput.dispatchEvent(new Event("input",{bubbles:true}));
   ageInput.dispatchEvent(new Event("change",{bubbles:true}));
 }

 // GENDER - instant select
 let g=b.querySelector('select[formcontrolname="passengerGender"]');
 if(g){
   [...g.options].forEach(o=>{
     if(o.text.toUpperCase()==p.gender) g.value=o.value;
   });
   g.dispatchEvent(new Event("change",{bubbles:true}));
 }

 // BERTH - instant select  
 let berth=b.querySelector('select[formcontrolname="passengerBerthChoice"]');
 if(berth){
   [...berth.options].forEach(o=>{
     if(o.text.toUpperCase()==p.berth) berth.value=o.value;
   });
   berth.dispatchEvent(new Event("change",{bubbles:true}));
 }
 
 status(`✅ Passenger ${i+1} filled instantly`);
}

/* -------- CONTACT -------- */
/* -------- CONTACT (INSTANT) -------- */
async function fillContact(){
 let c=document.querySelector('input[placeholder="Passenger mobile number *"]');
 if(c && CONTACT_NUMBER) {
   c.value = CONTACT_NUMBER;
   c.dispatchEvent(new Event("input",{bubbles:true}));
   c.dispatchEvent(new Event("change",{bubbles:true}));
   status("✅ Contact filled instantly");
 }
}

/* --------confirm berth CHECKBOXES -------- */
function setCheck(id,val){
 let el=document.getElementById(id);
 if(!el) return;
 if(el.checked!==val) safeClick(el);
}

/* -------- INSURANCE OPT-OUT -------- */
/* -------- INSURANCE OPT-OUT (SPECIFIC) -------- */
function optOutInsurance() {
    // Direct match for your exact text
    let noInsuranceBtn = [
        // Most specific first
        ...document.querySelectorAll('label')
    ].find(label => 
        label.textContent.includes("No, I don't want travel insurance") ||
        label.textContent.includes("No, don't want") ||
        label.textContent.includes("don't want travel insurance")
    );
    
    if (noInsuranceBtn) {
        let radio = noInsuranceBtn.querySelector('input[type="radio"]');
        if (radio && !radio.checked) {
            safeClick(radio);
            status("✅ Travel Insurance: NO ✔");
            return true;
        }
    }
    
    // Fallback: find by value/partial text
    let fallback = document.querySelector('input[type="radio"]');
    [...document.querySelectorAll('label')].some(label => {
        if (label.textContent.includes("don't want travel insurance")) {
            let radio = label.querySelector('input[type="radio"]');
            if (radio) {
                safeClick(radio);
                status("✅ Travel Insurance: NO ✔");
                return true;
            }
        }
    });
    
    status("Insurance NO button: Searching...");
    return false;
}


/* -------- PAYMENT -------- */
function selectPayment(){
 if(PAYMENT_MODE==="UPI"){
   let upi=document.querySelector('label[for="2"] input');
   safeClick(upi);
 }
 if(PAYMENT_MODE==="CARD"){
   let card=document.querySelector('label[for="3"] input');
   safeClick(card);
 }
}


// ------------------------captcha function starts-----------------------------------


let captchaPromise = null;
let captchaSolved = false;

async function solveCaptchaTC() {
    if (captchaPromise || captchaSolved) return captchaPromise;
    
    captchaPromise = (async () => {
        status("⚡ Captcha solving...");
        
        const img = document.querySelector("img.captcha-img") || 
                   document.querySelector("div.captcha_div img") ||
                   document.querySelector("img[src*='captcha']") ||
                   [...document.images].find(img => img.src.includes('captcha'));
        
        if (!img) return null;
        
        const imageData = img.src.substring(img.src.indexOf(',') + 1);
        
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "https://api.apitruecaptcha.org/one/gettext", true);
            
            xhr.onload = () => {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    let text = data.result || data.data;
                    
                    if (text) {
                        text = text.replace(/[^a-zA-Z0-9=@]/g, "").slice(0,6);
                        status(`⚡ "${text}"`);
                        
                        // INSTANT INPUT
                        setTimeout(() => {
                            const input = document.querySelector("#captcha") || 
                                         document.querySelector("div.captcha_div input") ||
                                         document.querySelector('input[placeholder*="captcha"]');
                            if (input) {
                                input.value = text;
                                input.dispatchEvent(new Event("input", {bubbles: true}));
                                input.dispatchEvent(new Event("change", {bubbles: true}));
                                
                                // 🔥 AUTO-CONTINUE 100ms after input
                                setTimeout(() => {
                                    autoContinueAfterCaptcha();
                                }, 10);
                            }
                        }, 10);
                        
                        captchaSolved = true;
                        resolve(text);
                    } else {
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            };
            
            xhr.onerror = () => resolve(null);
            xhr.send(JSON.stringify({
                userid: "param@samssara.com",
                apikey: "rclOKemJfJ4hrSj3T9Ar",
                data: imageData
            }));
        });
    })();
    
    return captchaPromise;
}

// PRE-LOAD + AUTO-SOLVE ON PAGE CHANGE
let lastUrl = "";
setInterval(async () => {
    if (window.location.href.includes("reviewBooking") && 
        window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        captchaSolved = false; // Reset for new page
        status("🎯 reviewbooking - AUTO SOLVE");
        await solveCaptchaTC(); // Instant background solve
    }
}, 5); // Even faster polling

function autoContinueAfterCaptcha() {
    const continueBtns = [...document.querySelectorAll("button, input[type='submit']")]
        .filter(b => b.textContent.trim().toUpperCase().includes("CONTINUE") || 
                    b.textContent.trim().toUpperCase().includes("SUBMIT"));
    
    if (continueBtns.length > 0) {
        safeClick(continueBtns[0]);
        status("✅ CAPTCHA + CONTINUE ✔");
        setTimeout(autoPayment, 100);  // Payment 1.5s after continue
    }
}


// ------------------------captcha function ends here-----------------------------

async function clickContinue(){
    while(true){
        
        
        let btn = [...document.querySelectorAll("button, input[type='submit']")]
            .find(b => b.textContent.trim().toUpperCase().includes("CONTINUE"));
        
        if (btn) {
            safeClick(btn);
            status("Continue Clicked ✔");
            // await waitForReviewBookingPage();
            return; 
        }
        
        await sleep(100);
    }
}

async function autoPayment() {
    status("💳 Waiting for payment...");
    
    while (!window.location.href.includes("bkgPaymentOptions")) {
        await sleep(10);
    }
    
    status("💳 Payment page - automating!");
    await sleep(10);
    
    // STEP 1: Bank selector

    let bankBtn = document.querySelector("#pay-type > span > div:nth-child(2) > div > span.pull-left.ng-star-inserted")||
                  document.querySelector("#pay-type > span > div:nth-child(2) > div > span:nth-child(1)");
    
    if (bankBtn) {
        safeClick(bankBtn);
        status("✅ E-wallet selected");
        await sleep(10);
    }
    
    // STEP 2: Pay button
    let payBtn = document.querySelector("#psgn-form > div.col-sm-9.col-xs-12.remove-padding > div.form-group.col-xs-12.border-all.dull-back > app-payment > div.row.body_div.text-center.ng-star-inserted > button.btn.btn-primary.hidden-xs.ng-star-inserted") ||
                document.querySelector("button.btn.btn-primary.hidden-xs") ||
                document.querySelector("#psgn-form button.btn-primary");
    
    if (payBtn) {
        safeClick(payBtn);
        status("✅ PAY clicked");
        await confirmewallet();
    } else {
        status("⚠️ Pay manual");
    }
}

async function confirmewallet() {
    while (!window.location.href.includes("ewallet-confirm")) {
        await sleep(10);
    }
    status("Ewallet confirm page - automating!");

    let payment=document.querySelector("#divMain > div > app-ewallet-confirm > div.col-xs-12.col-sm-6.border-all.col-sm-push-3 > div:nth-child(6) > div > div.pull-left > button"); 
    if (payment) {
        safeClick(payment);
        status("✅ Payment DONE ✔");
       
    }
    
}

/* ================= SEARCH CONFIG ================= */
const FROM_STATION = "DADAR - DDR (MUMBAI)";      // Change to your from station code
const TO_STATION = "BHUJ - BHUJ";         // Change to your to station code  
const TRAVEL_DATE = "04/03/2026"; // DD-MM-YYYY format
const QUOTA = "TATKAL";          // GENERAL, TATKAL, etc.


/* -------- DATE: CLICK → IGNORE PICKER → PASTE -------- */
async function setTravelDate(){
 let dateInput = document.querySelector('#jDate > span > input');
 if(!dateInput) return false;
 
 // 🔥 STEP 1: CLICK SELECTOR (datepicker appears)
 safeClick(dateInput);
 await sleep(800); // Give datepicker time to appear (but IGNORE it)
 
 // STEP 2: PASTE DATE DIRECTLY IN INPUT (override picker)
 dateInput.focus();
 dateInput.value = "";           // Clear any existing
 dateInput.value = TRAVEL_DATE;  // Paste date
 dateInput.setSelectionRange(0, 999); // Select all for realistic paste
 
 // 🔥 MANUAL-STYLE EVENTS (exactly like human paste)
 dateInput.dispatchEvent(new KeyboardEvent('keydown', {key: 'v', ctrlKey: true, bubbles: true}));
 dateInput.dispatchEvent(new Event('paste', {bubbles: true}));
 dateInput.dispatchEvent(new Event('input', {bubbles: true}));
 dateInput.dispatchEvent(new Event('change', {bubbles: true}));
 
 status(`✅ Date pasted: ${TRAVEL_DATE}`);
 await sleep(500);
 return true;
}

/* -------- SMART QUOTA SELECTOR -------- */
async function selectQuota(){
 let quotaTrigger = document.querySelector('#journeyQuota > div > div.ui-dropdown-label-container.ng-tns-c76-11 > span');
 if(!quotaTrigger) return false;
 
 safeClick(quotaTrigger.closest('.ui-dropdown'));
 await sleep(500); // Dropdown open time
 
 // 🔥 SMART SEARCH - finds EXACT quota text match
 let quotaOptions = document.querySelectorAll('.ui-dropdown-panel .ui-dropdown-item, .ui-dropdown-panel li');
 for(let option of quotaOptions){
   let text = option.textContent.trim().toUpperCase();
   if(text.includes(QUOTA.toUpperCase())){
     safeClick(option);
     await sleep(300);
     status(`✅ Quota: ${text}`);
     return true;
   }
 }
 
 // Fallback: first available option
 if(quotaOptions[0]){
   safeClick(quotaOptions[0]);
   status("✅ Quota: First available");
   return true;
 }
 
 return false;
}

/* -------- AUTO SEARCH TRAINS -------- */
async function autoSearchTrains(){
 status("🔍 Auto-searching trains...");
 
 // FROM station (instant fill)
 let fromInput = document.querySelector('#origin > span > input');
 if(fromInput){
   fromInput.value = FROM_STATION;  // e.g. "NDLS"
   fromInput.dispatchEvent(new Event("input",{bubbles:true}));
   fromInput.dispatchEvent(new Event("change",{bubbles:true}));
   await sleep(500); // Wait for autocomplete
 }

 // TO station
 let toInput = document.querySelector('#destination > span > input');
 if(toInput){
   toInput.value = TO_STATION;     // e.g. "BPL"
   toInput.dispatchEvent(new Event("input",{bubbles:true}));
   toInput.dispatchEvent(new Event("change",{bubbles:true}));
   await sleep(500);
 }

 // 🔥 DATE - CLICK FIRST
 await setTravelDate();

 // QUOTA - SMART SELECTION
await selectQuota();
   
  

 // SEARCH button
 
 let searchBtn = [document.querySelector("button, input[type='submit']")]
            .find(b => b.textContent.trim().includes("Search Trains"));
 if(searchBtn){
   safeClick(searchBtn);
   status("✅ Search clicked - waiting for trains...");
   return true;
 }
 
 status("❌ Search button not found");
 return false;
}



/* -------- MAIN -------- */
/* -------- MAIN (PARALLEL FILLING) -------- */
async function start(){


     status("🚀 FULL AUTO starting...");
 
 // 🔥 STEP 0: SEARCH TRAINS FIRST
 await autoSearchTrains();
 await sleep(3000); // Wait for train results


 status("⚡ Parallel passenger fill starting...");
 
 // STEP 1: Add ALL passengers FIRST (sequential - unavoidable)
 status("Adding all passenger blocks...");
 for(let i=0; i<PASSENGERS.length; i++){
   let blocks=document.querySelectorAll("app-passenger");
   if(blocks.length <= i){
     await addPassenger();
   }
 }
 
 // STEP 2: FILL ALL PARALLEL (BOTH AT ONCE!)
 status("🔥 Filling ALL passengers PARALLEL...");
 await Promise.all(
   PASSENGERS.map((p, i) => fillOne(p, i))
 );
 
 status("✅ ALL PASSENGERS FILLED!");
 
 // Continue rest...
 await fillContact();
 setCheck("autoUpgradation",AUTO_UPGRADE);
 setCheck("confirmberths",CONFIRM_BERTH);
 optOutInsurance();
 selectPayment();
 
 status("Clicking Continue...");
 await clickContinue();
}

/* -------- ONE-TIME BUTTON + AUTO-HIDE -------- */
let autofillStarted = false;

function createBtn(){
 if(autofillStarted || document.getElementById("af-btn")) return;

 let b=document.createElement("div");
 b.id="af-btn";
 b.innerText="🚆 START AUTOFILL";
 b.style="position:fixed;bottom:25px;left:50%;transform:translateX(-50%);background:#1a73e8;color:white;padding:16px 26px;border-radius:30px;font-size:16px;z-index:999999;cursor:pointer;";
 
 b.onclick=()=>{
   autofillStarted = true;  // Prevent restart
   b.remove();              // Complete removal
   start();
 };
 
 document.body.appendChild(b);
}

/* -------- OBSERVER TO KEEP BUTTON ALWAYS -------- */
function ensureButton(){
 createBtn();
 
 const observer = new MutationObserver(()=>{
   if(!autofillStarted && !document.getElementById("af-btn")){
     createBtn();
   }
 });
 observer.observe(document.body,{childList:true,subtree:true});
}

ensureButton();

})();
