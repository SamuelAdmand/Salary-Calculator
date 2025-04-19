console.log("dynamic_script.js loading...");

// --- Pay Matrix Data ---
const PAY_MATRIX = {
    '1': [18000, 18500, 19100, 19700, 20300, 20900, 21500, 22100, 22800, 23500, 24200, 24900, 25600, 26400, 27200, 28000, 28800, 29700],
    '2': [19900, 20500, 21100, 21700, 22400, 23100, 23800, 24500, 25200, 26000, 26800, 27600, 28400, 29300, 30200, 31100, 32000, 33000],
    '3': [21700, 22400, 23100, 23800, 24500, 25200, 26000, 26800, 27600, 28400, 29300, 30200, 31100, 32000, 33000, 34000, 35000, 36100],
    '4': [25500, 26300, 27100, 27900, 28700, 29600, 30500, 31400, 32300, 33300, 34300, 35300, 36400, 37500, 38600, 39800, 41000, 42200],
    '5': [29200, 30100, 31000, 31900, 32900, 33900, 34900, 35900, 37000, 38100, 39200, 40400, 41600, 42800, 44100, 45400, 46800, 48200],
    '6': [35400, 36500, 37600, 38700, 39900, 41100, 42300, 43600, 44900, 46200, 47600, 49000, 50500, 52000, 53600, 55200, 56900, 58600],
    '7': [44900, 46200, 47600, 49000, 50500, 52000, 53600, 55200, 56900, 58600, 60400, 62200, 64100, 66000, 68000, 70000, 72100, 74300],
    '8': [47600, 49000, 50500, 52000, 53600, 55200, 56900, 58600, 60400, 62200, 64100, 66000, 68000, 70000, 72100, 74300, 76500, 78800],
    '9': [53100, 54700, 56300, 58000, 59700, 61500, 63300, 65200, 67200, 69200, 71300, 73400, 75600, 77900, 80200, 82600, 85100, 87700],
    '10': [56100, 57800, 59500, 61300, 63100, 65000, 67000, 69000, 71100, 73200, 75400, 77700, 80000, 82400, 84900, 87400, 90000],
    '11': [61300, 63100, 65000, 67000, 69000, 71100, 73200, 75400, 77700, 80000, 82400, 84900, 87400, 90000, 92700, 95500, 98400],
    '12': [67700, 69700, 71800, 74000, 76200, 78500, 80900, 83300, 85800, 88400, 91100, 93800, 96600, 99500, 102500],
    '13': [78800, 81200, 83600, 86100, 88700, 91400, 94100, 96900, 99800, 102800, 105900, 109100],
};

// --- Rates ---
const HRA_RATES = { 'X': 0.30, 'Y': 0.20, 'Z': 0.10, 'None': 0 };
const TA_RATES = {
    '1': { 'Higher': 1350, 'Other': 900 }, '2': { 'Higher': 1350, 'Other': 900 },
    '3': { 'Higher': 3600, 'Other': 1800 }, '4': { 'Higher': 3600, 'Other': 1800 },
    '5': { 'Higher': 3600, 'Other': 1800 }, '6': { 'Higher': 3600, 'Other': 1800 },
    '7': { 'Higher': 3600, 'Other': 1800 }, '8': { 'Higher': 3600, 'Other': 1800 },
    '9': { 'Higher': 7200, 'Other': 3600 }, '10': { 'Higher': 7200, 'Other': 3600 },
    '11': { 'Higher': 7200, 'Other': 3600 }, '12': { 'Higher': 7200, 'Other': 3600 },
    '13': { 'Higher': 7200, 'Other': 3600 },
};

// --- DOM Elements ---
let payLevelSelect, basicPayContainer, daPercentageInput, hraCitySelect, taCitySelect, applyNPS, applyCGHS,
    otherAllowancesContainer, addAllowanceBtn, addAllowanceInputArea,
    otherDeductionsContainer, addDeductionBtn, addDeductionInputArea,
    saveImageBtn;

// --- Global variable to store latest calculation data ---
let latestCalculationData = null;

// --- Helper Functions ---
function getElementValue(id, isNumeric = true) { const element = document.getElementById(id); if (!element) return isNumeric ? 0 : ''; if (element.type === 'checkbox') return element.checked; const value = element.value; if (element.tagName === 'SELECT' && value === '') return isNumeric ? 0 : ''; return isNumeric ? (parseFloat(value) || 0) : value; }
function isElementChecked(id) { const element = document.getElementById(id); return element ? element.checked : false; }
function setElementHTML(id, value) { const element = document.getElementById(id); if (element) { if (typeof value === 'number') { element.innerHTML = Math.round(value).toLocaleString(); } else { element.innerHTML = value; } } else { console.warn(`setElementHTML: Element ID '${id}' not found.`); } }
function clearResults() { console.log("Clearing results display and dynamic rows."); setElementHTML('infoPayLevel', '--'); setElementHTML('outBasicPay', '0'); setElementHTML('outDA', '0'); setElementHTML('outHRA', '0'); setElementHTML('outTA', '0'); setElementHTML('outOtherAllowancesTotal', '0'); setElementHTML('outGrossSalary', '0'); setElementHTML('outNPS', '0'); setElementHTML('outCGHS', '0'); setElementHTML('outOtherDeductionsTotal', '0'); setElementHTML('outTotalDeductions', '0'); setElementHTML('outNetSalary', '0'); if (otherAllowancesContainer) otherAllowancesContainer.innerHTML = ''; if (otherDeductionsContainer) otherDeductionsContainer.innerHTML = ''; if (addAllowanceInputArea) addAllowanceInputArea.innerHTML = ''; if (addDeductionInputArea) addDeductionInputArea.innerHTML = ''; if (addAllowanceInputArea) addAllowanceInputArea.classList.remove('visible'); if (addDeductionInputArea) addDeductionInputArea.classList.remove('visible'); latestCalculationData = null; }

// --- Dynamic Row/Entry Functions ---
function showTemporaryInputRow(areaContainer, typePrefix) { console.log(`Showing temporary input for ${typePrefix}`); areaContainer.innerHTML = ''; areaContainer.classList.add('visible'); const row = document.createElement('div'); row.className = 'temporary-input-row'; const labelInput = document.createElement('input'); labelInput.type = 'text'; labelInput.placeholder = `${typePrefix === 'allowance' ? 'Allowance' : 'Deduction'} Name`; labelInput.className = `item-label`; row.appendChild(labelInput); const amountInput = document.createElement('input'); amountInput.type = 'number'; amountInput.placeholder = 'Amount'; amountInput.value = ''; amountInput.step = 'any'; amountInput.className = `item-amount`; row.appendChild(amountInput); const addBtn = document.createElement('button'); addBtn.textContent = 'Add'; addBtn.className = 'finalize-add-btn'; addBtn.onclick = (event) => finalizeDynamicEntry(event, typePrefix); row.appendChild(addBtn); const cancelBtn = document.createElement('button'); cancelBtn.textContent = 'Cancel'; cancelBtn.className = 'cancel-add-btn'; cancelBtn.onclick = () => { areaContainer.innerHTML = ''; areaContainer.classList.remove('visible'); }; row.appendChild(cancelBtn); areaContainer.appendChild(row); labelInput.focus(); }
function finalizeDynamicEntry(event, typePrefix) { const tempRow = event.target.closest('.temporary-input-row'); const labelInput = tempRow.querySelector('.item-label'); const amountInput = tempRow.querySelector('.item-amount'); const displayContainer = (typePrefix === 'allowance') ? otherAllowancesContainer : otherDeductionsContainer; const inputAreaContainer = (typePrefix === 'allowance') ? addAllowanceInputArea : addDeductionInputArea; const itemName = labelInput.value.trim(); const itemAmount = parseFloat(amountInput.value) || 0; if (!itemName) { alert(`Please enter a name for the ${typePrefix}.`); labelInput.focus(); return; } if (itemAmount <= 0) { alert("Please enter a positive amount."); amountInput.focus(); return; } const displayRow = document.createElement('div'); displayRow.className = 'result-row dynamic-display-row'; displayRow.dataset.amount = itemAmount; displayRow.dataset.name = itemName; const nameSpan = document.createElement('span'); nameSpan.textContent = itemName; displayRow.appendChild(nameSpan); const amountSpan = document.createElement('span'); amountSpan.textContent = Math.round(itemAmount).toLocaleString(); displayRow.appendChild(amountSpan); const removeBtn = document.createElement('button'); removeBtn.textContent = 'Remove'; removeBtn.className = 'remove-btn'; removeBtn.onclick = () => { displayRow.remove(); calculateSalary(); }; displayRow.appendChild(removeBtn); displayContainer.appendChild(displayRow); inputAreaContainer.innerHTML = ''; inputAreaContainer.classList.remove('visible'); calculateSalary(); }

// --- CGHS Rate Calculation ---
function getCGHSRate(level) { const numericLevel = parseInt(level); if (isNaN(numericLevel) || numericLevel < 1) return 0; if (numericLevel <= 5) return 250; if (numericLevel === 6) return 450; if (numericLevel <= 11) return 650; return 1000; }

// --- Core Logic ---
function populatePayLevels() { console.log("Attempting to populate pay levels..."); if (!payLevelSelect) { console.error("FATAL in populatePayLevels: payLevelSelect element is null!"); return; } while (payLevelSelect.options.length > 1) { payLevelSelect.remove(1); } if (!PAY_MATRIX || typeof PAY_MATRIX !== 'object') { console.error("PAY_MATRIX is invalid or not an object!"); return; } console.log("PAY_MATRIX type:", typeof PAY_MATRIX); const levels = Object.keys(PAY_MATRIX); console.log("Pay Matrix Levels found:", levels); console.log("Number of levels found:", levels.length); if (!levels || levels.length === 0) { console.warn("No levels found in PAY_MATRIX object or object is invalid. Loop will not run."); return; } levels.sort((a, b) => parseInt(a) - parseInt(b)); levels.forEach(level => { console.log("Adding option for level:", level); const option = document.createElement('option'); option.value = level; option.textContent = `Level ${level}`; try { payLevelSelect.appendChild(option); console.log(" -> Successfully appended level:", level); } catch (e) { console.error(" -> Error appending level:", level, e); } }); console.log("Finished populating pay levels function."); }
function updateBasicPayOptions() { console.log("Updating basic pay options..."); if (!payLevelSelect || !basicPayContainer) return; const selectedLevel = payLevelSelect.value; basicPayContainer.innerHTML = ''; const label = document.createElement('label'); label.setAttribute('for', 'basicPaySelect'); label.textContent = 'Select Basic Pay (Cell):'; basicPayContainer.appendChild(label); const select = document.createElement('select'); select.id = 'basicPaySelect'; if (selectedLevel && PAY_MATRIX[selectedLevel]) { const basicPays = PAY_MATRIX[selectedLevel]; const defaultOption = document.createElement('option'); defaultOption.value = ''; defaultOption.textContent = '-- Select Basic Pay --'; select.appendChild(defaultOption); basicPays.forEach((pay, index) => { const option = document.createElement('option'); option.value = pay; option.textContent = `${pay.toLocaleString()} (Cell ${index + 1})`; select.appendChild(option); }); select.addEventListener('change', calculateSalary); } else { select.disabled = true; const placeholderOption = document.createElement('option'); placeholderOption.textContent = selectedLevel ? '-- Invalid Level --' : '-- Select Pay Level First --'; select.appendChild(placeholderOption); } basicPayContainer.appendChild(select); setElementHTML('infoPayLevel', selectedLevel ? `${selectedLevel}` : '--'); calculateSalary(); }
function calculateSalary() { console.log("Calculating salary..."); const selectedLevel = getElementValue('payLevelSelect', false); const basicPay = getElementValue('basicPaySelect'); const daPercentage = getElementValue('daPercentage'); const hraCity = getElementValue('hraCitySelect', false); const taCity = getElementValue('taCitySelect', false); const npsApplicable = isElementChecked('applyNPS'); const cghsApplicable = isElementChecked('applyCGHS'); let otherAllowances = []; document.querySelectorAll('#otherAllowancesContainer .result-row').forEach(row => { otherAllowances.push({ name: row.dataset.name || 'Other Allowance', amount: parseFloat(row.dataset.amount) || 0 }); }); const otherAllowancesTotal = otherAllowances.reduce((sum, item) => sum + item.amount, 0); let otherDeductions = []; document.querySelectorAll('#otherDeductionsContainer .result-row').forEach(row => { otherDeductions.push({ name: row.dataset.name || 'Other Deduction', amount: parseFloat(row.dataset.amount) || 0 }); }); const otherDeductionsTotal = otherDeductions.reduce((sum, item) => sum + item.amount, 0); console.log(`Inputs - Level: ${selectedLevel || 'None'}, Basic: ${basicPay}, DA %: ${daPercentage}, HRA: ${hraCity}, TA: ${taCity}, NPS: ${npsApplicable}, CGHS: ${cghsApplicable}, OthAllow: ${otherAllowancesTotal}, OthDed: ${otherDeductionsTotal}`); setElementHTML('outOtherAllowancesTotal', otherAllowancesTotal); setElementHTML('outOtherDeductionsTotal', otherDeductionsTotal); if (!basicPay || !selectedLevel) { console.log("Calculation skipped: Basic pay or level not selected/valid."); setElementHTML('infoPayLevel', selectedLevel || '--'); setElementHTML('outBasicPay', basicPay || '0'); setElementHTML('outDA', '0'); setElementHTML('outHRA', '0'); setElementHTML('outTA', '0'); setElementHTML('outGrossSalary', '0'); setElementHTML('outNPS', '0'); setElementHTML('outCGHS', '0'); setElementHTML('outTotalDeductions', otherDeductionsTotal); setElementHTML('outNetSalary', '0'); latestCalculationData = null; return; } setElementHTML('infoPayLevel', selectedLevel); setElementHTML('outBasicPay', basicPay); const payLevelStr = selectedLevel; const hraRate = HRA_RATES[hraCity] ?? 0; const taBase = TA_RATES[payLevelStr]?.[taCity] ?? 0; const daAmount = basicPay * (daPercentage / 100); const hraAmount = basicPay * hraRate; const daOnTA = taBase * (daPercentage / 100); const taAmount = taBase + daOnTA; const grossSalary = basicPay + daAmount + hraAmount + taAmount + otherAllowancesTotal; let totalDeductions = 0; let npsAmount = 0; let cghsAmount = 0; if (npsApplicable) { npsAmount = (basicPay + daAmount) * 0.10; totalDeductions += npsAmount; } if (cghsApplicable) { cghsAmount = getCGHSRate(selectedLevel); totalDeductions += cghsAmount; } totalDeductions += otherDeductionsTotal; const netSalary = grossSalary - totalDeductions; console.log(`Calculated - Gross: ${grossSalary.toFixed(2)}, Total Ded: ${totalDeductions.toFixed(2)}, Net: ${netSalary.toFixed(2)}`); setElementHTML('outDA', daAmount); setElementHTML('outHRA', hraAmount); setElementHTML('outTA', taAmount); setElementHTML('outGrossSalary', grossSalary); setElementHTML('outNPS', npsAmount); setElementHTML('outCGHS', cghsAmount); setElementHTML('outTotalDeductions', totalDeductions); setElementHTML('outNetSalary', netSalary); latestCalculationData = { level: selectedLevel, basic: basicPay, da: daAmount, hra: hraAmount, ta: taAmount, otherAllowances: otherAllowances, gross: grossSalary, nps: npsAmount, cghs: cghsAmount, otherDeductions: otherDeductions, totalDeductions: totalDeductions, net: netSalary }; }

// --- Generate and Save Image Function (Increased Spacing) ---
function saveCalculationAsImage() {
    if (!latestCalculationData) { alert("Please perform a calculation first before saving."); return; }
    console.log("Generating salary report image...");

    // --- Define Canvas Properties ---
    const canvasWidth = 600; const leftMargin = 30; const rightMargin = 30; const contentWidth = canvasWidth - leftMargin - rightMargin; const col1X = leftMargin; const col2X = canvasWidth - rightMargin; let currentY = 0; const lineHeight = 28;
    const sectionSpacing = 25; // Increased section spacing
    const subsectionSpacing = 10; // Spacing before totals
    const titleFontSize = 24; const headingFontSize = 18; const labelFontSize = 14; const valueFontSize = 14;

    // Estimate canvas height dynamically
    let estimatedHeight = 100; // Initial padding + title
    estimatedHeight += 7 * lineHeight; // Basic allowances + gross
    estimatedHeight += 5 * lineHeight; // Basic deductions + total + net
    estimatedHeight += latestCalculationData.otherAllowances.length * lineHeight;
    estimatedHeight += latestCalculationData.otherDeductions.length * lineHeight;
    estimatedHeight += 4 * sectionSpacing; // Increased total section spacing

    const canvas = document.createElement('canvas'); canvas.width = canvasWidth; canvas.height = estimatedHeight; const ctx = canvas.getContext('2d');

    // --- Start Drawing ---
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    currentY += 40; ctx.font = `bold ${titleFontSize}px Arial`; ctx.fillStyle = '#2c3e50'; ctx.textAlign = 'center'; ctx.fillText('Salary Calculation Summary', canvas.width / 2, currentY);
    currentY += titleFontSize + sectionSpacing; // Space after Title

    // Helper function to draw a row
    function drawRow(label, value, isBold = false, isTotal = false) { currentY += lineHeight; ctx.font = `${isBold ? 'bold ' : ''}${labelFontSize}px Arial`; ctx.fillStyle = '#555'; ctx.textAlign = 'left'; ctx.fillText(label, col1X, currentY); ctx.font = `${isBold || isTotal ? 'bold ' : ''}${valueFontSize}px Arial`; ctx.fillStyle = isTotal ? '#c0392b' : '#2c3e50'; ctx.textAlign = 'right'; ctx.fillText(Math.round(value).toLocaleString(), col2X, currentY); }

    // --- Earnings Section ---
    ctx.font = `bold ${headingFontSize}px Arial`; ctx.fillStyle = '#34495e'; ctx.textAlign = 'left'; ctx.fillText('Earnings', col1X, currentY);
    currentY += headingFontSize / 2 + subsectionSpacing; // Space after heading

    drawRow('Pay Level:', latestCalculationData.level); ctx.fillText(latestCalculationData.level, col2X, currentY);
    drawRow('Basic Pay:', latestCalculationData.basic);
    drawRow('DA (Dearness Allowance):', latestCalculationData.da);
    drawRow('HRA (House Rent Allowance):', latestCalculationData.hra);
    drawRow('TA (Travelling Allowance):', latestCalculationData.ta);
    latestCalculationData.otherAllowances.forEach(item => { drawRow(`${item.name}:`, item.amount); });
    currentY += subsectionSpacing; // Space before gross
    drawRow('Gross Salary:', latestCalculationData.gross, true);
    currentY += sectionSpacing * 1.5; // *** INCREASED SPACE after Gross Salary ***

    // --- Deductions Section ---
    ctx.font = `bold ${headingFontSize}px Arial`; ctx.fillStyle = '#34495e'; ctx.textAlign = 'left'; ctx.fillText('Deductions', col1X, currentY);
    currentY += headingFontSize / 2 + subsectionSpacing; // Space after heading

    if (latestCalculationData.nps > 0) drawRow('NPS Contribution:', latestCalculationData.nps);
    if (latestCalculationData.cghs > 0) drawRow('CGHS Contribution:', latestCalculationData.cghs);
    latestCalculationData.otherDeductions.forEach(item => { drawRow(`${item.name}:`, item.amount); });
    currentY += subsectionSpacing; // Space before total deductions
    drawRow('Total Deductions:', latestCalculationData.totalDeductions, true);
    currentY += sectionSpacing; // Space after Total Deductions

    // --- Net Salary ---
    drawRow('Net Salary:', latestCalculationData.net, true, true);

    // --- Finish Drawing & Download ---
    console.log("Drawing complete. Generating image URL...");
    try { const imageDataUrl = canvas.toDataURL('image/png'); const link = document.createElement('a'); link.href = imageDataUrl; link.download = `salary_report_level_${latestCalculationData.level}_basic_${latestCalculationData.basic}.png`; document.body.appendChild(link); link.click(); document.body.removeChild(link); console.log("Image download triggered."); } catch (e) { console.error("Error generating or downloading image:", e); alert("Sorry, an error occurred while generating or downloading the image."); }
}


// --- Initial Setup ---
window.onload = () => { console.log("Window loaded. Running setup..."); payLevelSelect = document.getElementById('payLevelSelect'); basicPayContainer = document.getElementById('basicPayContainer'); daPercentageInput = document.getElementById('daPercentage'); hraCitySelect = document.getElementById('hraCitySelect'); taCitySelect = document.getElementById('taCitySelect'); applyNPS = document.getElementById('applyNPS'); applyCGHS = document.getElementById('applyCGHS'); otherAllowancesContainer = document.getElementById('otherAllowancesContainer'); addAllowanceBtn = document.getElementById('addAllowanceBtn'); addAllowanceInputArea = document.getElementById('addAllowanceInputArea'); otherDeductionsContainer = document.getElementById('otherDeductionsContainer'); addDeductionBtn = document.getElementById('addDeductionBtn'); addDeductionInputArea = document.getElementById('addDeductionInputArea'); saveImageBtn = document.getElementById('saveImageBtn'); const requiredElements = [ payLevelSelect, basicPayContainer, daPercentageInput, hraCitySelect, taCitySelect, applyNPS, applyCGHS, otherAllowancesContainer, addAllowanceBtn, addAllowanceInputArea, otherDeductionsContainer, addDeductionBtn, addDeductionInputArea, saveImageBtn ]; if (requiredElements.some(el => !el)) { console.error("CRITICAL ERROR: One or more essential HTML elements not found. Check element IDs."); alert("Error: Calculator elements missing. Please check HTML IDs."); return; } console.log("Populating pay levels..."); populatePayLevels(); payLevelSelect.addEventListener('change', updateBasicPayOptions); daPercentageInput.addEventListener('input', calculateSalary); hraCitySelect.addEventListener('change', calculateSalary); taCitySelect.addEventListener('change', calculateSalary); applyNPS.addEventListener('change', calculateSalary); applyCGHS.addEventListener('change', calculateSalary); addAllowanceBtn.addEventListener('click', () => showTemporaryInputRow(addAllowanceInputArea, 'allowance')); addDeductionBtn.addEventListener('click', () => showTemporaryInputRow(addDeductionInputArea, 'deduction')); saveImageBtn.addEventListener('click', saveCalculationAsImage); console.log("Event listeners added."); clearResults(); console.log("Calculator setup complete."); };

console.log("dynamic_script.js parsed.");
