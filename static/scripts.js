let currentPage = 1;        // Current page of the table being displayed
let recordsPerPage = 20;    // Default value for display
let fetchLimit = 100;       // Default value for fetching
let totalRecords = 0;       // Total records fetched from the server
let currentData = [];       // Data fetched from the server
let allSites = [];          // All sites available in the database
let allBrands = [];         // All brands available in the database
let allSubdepartments = []; // All subdepartments available in the database

async function fetchSites() {
    const response = await fetch('/sites');
    const data = await response.json();
    allSites = data.sites;
    populateSitesDropdown();
    console.log('Sites fetched');
}

async function fetchBrands(site) {
    const response = await fetch(`/brands?site=${site}`);
    const data = await response.json();
    allBrands = data.brands;
    populateBrandsDropdown();
    console.log('Brands fetched');
}

async function fetchSubdepartments(site, brand) {
    const response = await fetch(`/subdepartments?site=${site}&brand=${brand}`);
    const data = await response.json();
    allSubdepartments = data.subdepartments;
    populateSubdepartmentsDropdown();
    console.log('Subdepartments fetched');
}

function populateSitesDropdown() {
    const siteSelect = document.getElementById('site-select');
    siteSelect.innerHTML = '<option value="">Select Site</option>'; // Clear previous options
    allSites.forEach(site => {
        const option = document.createElement('option');
        option.value = site;
        option.textContent = site;
        siteSelect.appendChild(option);
    });
    console.log('Sites dropdown populated');
}

function populateBrandsDropdown() {
    const brandSearchContainer = document.getElementById('brand-search-container');
    const brandSuggestions = document.getElementById('brand-suggestions');
    brandSuggestions.innerHTML = ''; // Clear previous suggestions
    brandSearchContainer.classList.remove('hidden'); // Show brand search
    console.log('Brand search container shown');
}

function populateSubdepartmentsDropdown() {
    const subdeptSelect = document.getElementById('subdept-select');
    subdeptSelect.innerHTML = '<option value="">Select subdept</option>'; // Add default unselected option
    allSubdepartments.forEach(subdept => {
        const option = document.createElement('option');
        option.value = subdept;
        option.textContent = subdept;
        subdeptSelect.appendChild(option);
    });
    document.getElementById('subdept-search-container').classList.remove('hidden'); // Show subdepartment search

    // Add event listener to trigger searchData() when a subdepartment is selected
    subdeptSelect.addEventListener('change', selectSubdept);
    console.log('Subdepartment dropdown populated');
}

function filterBrands() {
    const searchInput = document.getElementById('brand-search-input').value.toLowerCase();
    const suggestionsContainer = document.getElementById('brand-suggestions');
    suggestionsContainer.innerHTML = ''; // Clear previous suggestions

    if (searchInput) {
        const filteredBrands = allBrands.filter(brand => brand.toLowerCase().includes(searchInput));
        filteredBrands.forEach(brand => {
            const suggestion = document.createElement('div');
            suggestion.className = 'autocomplete-suggestion';
            suggestion.textContent = brand;
            suggestion.onclick = () => selectBrand(brand);
            suggestionsContainer.appendChild(suggestion);
        });
    }
    console.log('Brand suggestions filtered');
}

function selectSite() {
    const site = document.getElementById('site-select').value;
    if (site) {
        fetchBrands(site); // Fetch brands based on selected site
        resetBrandAndSubdept(); // Reset brand and subdepartment selections
    } else {
        document.getElementById('brand-search-container').classList.add('hidden'); // Hide brand search
        document.getElementById('subdept-search-container').classList.add('hidden'); // Hide subdepartment search
    }
    console.log('Site selected');
}

function resetBrandAndSubdept() {
    document.getElementById('brand-search-input').value = ''; // Clear brand input
    document.getElementById('brand-suggestions').innerHTML = ''; // Clear brand suggestions
    document.getElementById('subdept-select').innerHTML = '<option value="">Select subdept</option>'; // Clear subdepartment dropdown
    document.getElementById('brand-search-container').classList.add('hidden'); // Hide brand search
    document.getElementById('subdept-search-container').classList.add('hidden'); // Hide subdepartment search
    console.log('Brand and subdepartment reset');
}

function selectBrand(brand) {
    const site = document.getElementById('site-select').value;
    document.getElementById('brand-search-input').value = brand;
    document.getElementById('brand-suggestions').innerHTML = ''; // Clear suggestions
    fetchSubdepartments(site, brand); // Fetch subdepartments based on selected site and brand
    console.log('Brand selected');
}

function selectSubdept() {
    searchData(); // Trigger search with the selected subdepartment
    console.log('Subdepartment selected');
}

async function searchData() {
    const site = document.getElementById('site-select').value;
    console.log(site);
    const brand = document.getElementById('brand-search-input').value;
    console.log(brand);
    const subdept = document.getElementById('subdept-select').value;
    console.log(subdept);
    const response = await fetch(`/search?site=${encodeURIComponent(site)}&brand=${encodeURIComponent(brand)}&subdept=${encodeURIComponent(subdept)}`);
    const data = await response.json();
    currentData = data.results;
    console.log(currentData);
    totalRecords = currentData.length;
    document.getElementById('total-records').textContent = `${totalRecords} products`;
    
    // Update slider to reflect total records fetched
    const slider = document.getElementById('records-slider');
    const countLabel = document.getElementById('records-count');
    slider.max = totalRecords;
    slider.value = totalRecords;
    countLabel.textContent = totalRecords;

    displayPage(1); // Ensure the table is populated immediately after fetching data

    // Show the table and pagination container
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('pagination-container').classList.remove('hidden');
    console.log('Search results retrieved');
}

function displayPage(page) {
    currentPage = page;
    const start = (page - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    const paginatedData = currentData.slice(start, end);
    const resultsBody = document.getElementById('results-body');
    resultsBody.innerHTML = ''; // Clear existing rows

    paginatedData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.SiteID}</td>
            <td>${row.SubDepartmentNumber}</td>
            <td>${row.SubDepartmentName}</td>
            <td>${row.ProductID}</td>
            <td>${row.ColorID}</td>
            <td>${row.SizeID}</td>
            <td>${row.VariantID}</td>
        `;
        resultsBody.appendChild(tr);
    });

    document.getElementById('prev-button').disabled = currentPage === 1;
    document.getElementById('next-button').disabled = end >= totalRecords;
    document.getElementById('record-range').textContent = `${start + 1}-${Math.min(end, totalRecords)}`;
    console.log(`Displaying page ${page}`);
}

function getRandomSubset(array, size) {
    const shuffled = array.slice(0);
    let i = array.length;
    let temp, index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
    console.log('Random subset generated');
}

function nextPage() {
    if ((currentPage * recordsPerPage) < totalRecords) {
        displayPage(currentPage + 1);
    }
    console.log('Next page displayed');
}

function prevPage() {
    if (currentPage > 1) {
        displayPage(currentPage - 1);
    }
    console.log('Previous page displayed');
}

function updateRecordsCount() {
    const slider = document.getElementById('records-slider');
    const countLabel = document.getElementById('records-count');
    fetchLimit = parseInt(slider.value);
    countLabel.textContent = fetchLimit;
    console.log('Records count updated');
}

function copyVariantIds() {
    const variantIds = getRandomSubset(currentData, fetchLimit).map(row => row.VariantID).join(', ');
    navigator.clipboard.writeText(variantIds).then(() => {
        alert('Variant IDs copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
    console.log('Variant IDs copied');
}

// Initial load
fetchSites();