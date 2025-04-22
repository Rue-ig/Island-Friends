// Did You Know? Section
const facts = [
    "The Caribbean is home to over 700 species of birds, including the endangered Roseate Spoonbill and the majestic Frigatebird.",
    "Many Caribbean islands have unique ecosystems, with species that can only be found in those specific locations.",
    "Coral reefs in the Caribbean are some of the most diverse and vibrant in the world.",
    "Some Caribbean islands are home to endemic species, meaning they are found nowhere else on Earth.",
    "The Caribbean Sea is one of the largest saltwater seas and supports millions of marine creatures."
];

let currentFact = 0;

function showNextFact() {
    currentFact = (currentFact + 1) % facts.length;
    document.getElementById("fact").textContent = facts[currentFact];
}

// Functionality for Filter by Animal Type Function
let allAnimals = []; // to store all fetched records

function populateFilterTypes(records) {
    const filterSelect = document.getElementById('type-filter');
    const types = [...new Set(records.map(r => r.type).filter(Boolean))];

    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        filterSelect.appendChild(option);
    });
}

// Functionality for Filter by Country Function
function populateCountryFilter(records) {
    const filterSelect = document.getElementById('country-filter');
    const countryKeys = getCountryKeys(records);

    countryKeys.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        filterSelect.appendChild(option);
    });
}

function getCountryKeys(records) {
    const countryKeys = new Set();
    records.forEach(rec => {
        for (let key in rec) {
            if (["yes", "no"].includes(rec[key]) && key.length <= 5) {
                countryKeys.add(key);
            }
        }
    });
    return Array.from(countryKeys);
}

// Get Data from API
async function getData() {
    const url = 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLh-vRW6fxasGQMdqJGzo9NFWjegB-FMraDNUMUSFlRLaSMz_33hK6kiRY-0C0xNgob6w307ciFCz-bOWPZfovIwM-ky7y89iEFlB1FSuvjtmXXJx-rhgL9yHD6_c2LEUZ77VCKMJYTHdBkk85ThzbfoPeqTQSdmsmsodf9jWEdgmyPKrBqMU9cY9dyA0Fo1_3ogr-ZM7zgujNJ0A7Z6jswCyT-0BNi8zsPfOVwVnd06391J7qxG5icZjR90PhDxMDBebEXdCml7CfFCBKCz9XoLpPds6Zl12hdEcYJgavBVSw9jY5O0A5qGd_pilJSLzs01NBVZ&lib=MWE_QBjJXwXXD4bogbvGarrsOYE1fA0Zf';

    try {
        const response = await fetch(url);
        const data = await response.json();
        const records = data.records || data.data || [];

        allAnimals = records;
        populateFilterTypes(records);
        populateCountryFilter(records);
        renderFilteredGallery();

    } catch (error) {
        console.error('Failed to load data:', error);
        document.getElementById('gallery').textContent = 'Failed to load data.';
    }
}

function getCountriesFound(rec) {
    const countryMap = {
        "SVG": "Saint Vincent and the Grenadines",
        "DOM": "Dominica",
        "T&T": "Trinidad and Tobago",
        "JAM": "Jamaica",
        "GUY": "Guyana"
    };

    const foundIn = Object.keys(countryMap).filter(code => rec[code] === "yes");

    const fullNames = foundIn.map(code => countryMap[code]);

    return fullNames.length
        ? fullNames.join(", ")
        : "Not found in listed countries";
}

// Render Filtered Gallery
function renderFilteredGallery() {
    const typeValue = document.getElementById('type-filter').value;
    const countryValue = document.getElementById('country-filter').value;

    const filtered = allAnimals.filter(rec => {
        const typeMatch = typeValue === 'all' || rec.type === typeValue;
        const countryMatch = countryValue === 'all' || rec[countryValue] === "yes";
        return typeMatch && countryMatch;
    });

    const gallery = document.getElementById('gallery');
    const loadingMessage = document.getElementById('loading-message');
    let html = '';

    filtered.forEach((rec, index) => {
        const countries = getCountriesFound(rec);
        html += `
        <div class="card" style="--delay: ${index * 0.1}s; text-align: left;">
            <img src="${rec.Image}" alt="${rec["Common Name"] || 'Wildlife'}" loading="lazy">
            <h3>${rec["Common Name"]}</h3>
            <p><strong>Scientific Name:</strong> ${rec["Scientific Name"]}</p>
            ${rec["Local Name"] ? `<p><strong>Local Name:</strong> ${rec["Local Name"]}</p>` : ''}
            <p><strong>Description:</strong> ${rec["Description"]}</p>
            <p><strong>Type:</strong> ${rec["type"]}</p>
            <p><strong>Found in:</strong> ${countries}</p>
            <button class="fav-btn" onclick="addToFavourites(${JSON.stringify(rec).replace(/"/g, '&quot;')})">⭐ Favorite</button>
        </div>
        `;
    });

    gallery.innerHTML = html;

    if (loadingMessage) {
        loadingMessage.style.display = 'none';
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = 'notification';
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize Firebase favorites functionality
// Replace the initializeFirebase function with this:
async function initializeFirebase() {
    const { auth, db } = await import('./firebaseConfig.js');
    const { 
        addDoc, 
        collection, 
        serverTimestamp 
    } = await import("https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js");

    window.addToFavourites = async function(animalData) {
        const user = auth.currentUser;
        if (!user) {
            alert('Please sign in to add favorites');
            window.location.href = 'index.html';
            return;
        }

        try {
            await addDoc(collection(db, 'users', user.uid, 'favorites'), {
                commonName: animalData["Common Name"],
                scientificName: animalData["Scientific Name"] || '',
                description: animalData["Description"] || '',
                type: animalData["type"] || '',
                image: animalData["Image"] || '',
                localName: animalData["Local Name"] || '',
                countriesFound: getCountriesFound(animalData),
                createdAt: serverTimestamp()
            });
            showNotification('Added to favorites!');
        } catch (error) {
            console.error("Error adding favorite:", error);
            showNotification('Failed to add favorite');
        }
    };
}

// Slideshow functionality
let slideIndex = 1;

async function loadSlideshow() {
    const loadingMessage = document.getElementById("slideshow-loading-message");
    const slideshow = document.getElementById("slideshow-container");
    const dots = document.getElementById("dot-container");

    if (loadingMessage) loadingMessage.style.display = "block";

    try {
        const res = await fetch('https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLjNcpsaLC8dAhmiiiWiUE_p6SGY1sz40C06nVyaEImgdWl6Uy0CypTRbcNHK_y6nl1ySAt4iltsEYIUhLZy90Lx_4bB5BXhPEC2obQ1VCATbo-ow2Chd89tbxCGWEuw-mBXNUmc5gQXfICDiZN93J_dBGvQsuhie1SLhytc_5AO-F8N6LLjg2dxfb881ptcl3mqEv2HcuwormjdA80Srds2VINRGykvSTu2MJuKwK5m-AXUt7ExCYWMMwmo7iCf_ABaWG5Uw065qywIfUURTzklkeUzd2ZRFjMrYHV_gAIK0Im4RbB9iNjgRTEjovgj5S8W0Dug&lib=MWE_QBjJXwXXD4bogbvGarrsOYE1fA0Zf');
        const data = await res.json();
        const records = data.records || data.data || [];

        slideshow.innerHTML = '';
        dots.innerHTML = '';

        records.forEach((rec, i) => {
            slideshow.innerHTML += `
            <div class="mySlides fade">
                <img src="${rec.Image}" alt="${rec["Common Name"]}" loading="lazy">
                <div class="slide-text-overlay">
                <h3>Can You Guess?</h3>
                <p>${rec["Description"]}</p>
                </div>
            </div>
            `;

            dots.innerHTML += `<span class="dot" onclick="currentSlide(${i + 1})"></span>`;
        });

        showSlides(1);
    } catch (err) {
        console.error('Failed to load slideshow data:', err);
        slideshow.innerHTML = '<p style="text-align: center; color: red;">Failed to load slideshow data.</p>';
    } finally {
        if (loadingMessage) loadingMessage.style.display = "none";
    }
}

function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    const slides = document.getElementsByClassName("mySlides");
    const dots = document.getElementsByClassName("dot");
    
    if (slides.length === 0) return;
    
    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    slides[slideIndex - 1].style.display = "block";
    if (dots.length > 0) dots[slideIndex - 1].className += " active";
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    getData();
    initializeFirebase();
    loadSlideshow();
    
    // Set interval for automatic slideshow
    setInterval(() => plusSlides(1), 5000);
    
    // Event listeners for filters
    document.getElementById('type-filter').addEventListener('change', renderFilteredGallery);
    document.getElementById('country-filter').addEventListener('change', renderFilteredGallery);
});