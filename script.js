// --- KONFIGURASI DATABASE (GOOGLE SHEETS via SHEETY) ---
// Memasukkan URL Sheety yang diberikan pengguna
const SHEETY_API_URL = '[https://api.sheety.co/6bcfba2bdaa9f3e452efe6c93a181cce/xeoTopUp/coindanharga](https://api.sheety.co/6bcfba2bdaa9f3e452efe6c93a181cce/xeoTopUp/coindanharga)'; 

// State Aplikasi
let isAdmin = false;
let priceData = [];

// Data Dummy (Akan digunakan jika Sheety gagal dimuat)
const dummyData = [
            { id: 1, coin: "4.950", price: "Rp10.000" },
            { id: 2, coin: "9.910", price: "Rp20.000" },
            { id: 3, coin: "14.815", price: "Rp30.000" },
            { id: 4, coin: "19.753", price: "Rp40.000" },
            { id: 5, coin: "24.752", price: "Rp50.000" },
            { id: 6, coin: "29.702", price: "Rp60.000" },
            { id: 7, coin: "34.653", price: "Rp70.000" },
            { id: 8, coin: "39.603", price: "Rp80.000" },
            { id: 9, coin: "44.554", price: "Rp90.000" },

            { id: 10, coin: "49.505", price: "Rp100.000" },
            { id: 11, coin: "74.257", price: "Rp150.000" },
            { id: 12, coin: "99.010", price: "Rp200.000" },
            { id: 13, coin: "123.762", price: "Rp250.000" },
            { id: 14, coin: "148.515", price: "Rp300.000" },
            { id: 15, coin: "173.267", price: "Rp350.000" },
            { id: 16, coin: "198.020", price: "Rp400.000" },
            { id: 17, coin: "222.772", price: "Rp450.000" },
            { id: 18, coin: "247.525", price: "Rp500.000" },

            { id: 19, coin: "297.030", price: "Rp600.000" },
            { id: 20, coin: "346.535", price: "Rp700.000" },
            { id: 21, coin: "396.040", price: "Rp800.000" },
            { id: 22, coin: "445.545", price: "Rp900.000" },
            { id: 23, coin: "495.050", price: "Rp1.000.000" },
            { id: 24, coin: "990.100", price: "Rp2.000.000" },
            { id: 25, coin: "1.485.150", price: "Rp3.000.000" },
            { id: 26, coin: "1.980.198", price: "Rp4.000.000" },
            { id: 27, coin: "2.475.247", price: "Rp5.000.000" }
        ];


// --- FUNGSI PENGAMBILAN DATA ---
async function loadData() {
    try {
        const response = await fetch(SHEETY_API_URL);
        const json = await response.json();
        // Sheety mengembalikan data sesuai nama sheet. Nama sheet di URL adalah 'coindanharga'.
        priceData = json.coindanharga || []; 
        
        // Jika data dari sheet kosong, gunakan dummy data
        if(priceData.length === 0) {
            priceData = [...dummyData];
        }
    } catch (error) {
        console.error("Gagal mengambil data dari Google Sheets, menggunakan data lokal.", error);
        priceData = [...dummyData];
    }
    renderPrices();
}

// --- FUNGSI RENDER TAMPILAN ---
function renderPrices() {
    const container = document.getElementById('price-container');
    container.innerHTML = ''; 

    priceData.forEach(item => {
        const card = document.createElement('div');
        card.className = "gold-item flex items-center justify-between px-4 py-2 relative group";
        
        card.innerHTML = `
            <div class="text-[#f7d057] font-bold text-sm md:text-base z-10 w-1/3 text-left drop-shadow-md">
                ${item.coin}
            </div>
            <div class="z-10 w-1/3 flex justify-center text-yellow-400 text-xl drop-shadow-lg">
                <i class="fas fa-coins"></i>
            </div>
            <div class="text-white font-bold text-sm md:text-base z-10 w-1/3 text-right drop-shadow-md">
                ${item.price}
            </div>
            ${isAdmin ? `
                <div class="absolute -top-2 -right-2 z-20">
                    <button onclick="openEditModal(${item.id}, '${item.coin}', '${item.price}')" class="edit-btn" title="Edit Item">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                </div>
            ` : ''}
        `;
        container.appendChild(card);
    });
}

// --- FUNGSI ADMIN & MODAL ---
function openAdminModal() {
    document.getElementById('adminModal').style.display = 'flex';
    document.getElementById('loginError').classList.add('hidden');
    document.getElementById('adminPassword').value = '';
}

function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
}

function verifyAdmin() {
    const pwd = document.getElementById('adminPassword').value;
    if (pwd === 'admin123') {
        isAdmin = true;
        closeAdminModal();
        renderPrices();
        alert("Login Admin Berhasil!");
    } else {
        document.getElementById('loginError').classList.remove('hidden');
    }
}

function openEditModal(id, currentCoin, currentPrice) {
    document.getElementById('editId').value = id;
    document.getElementById('editCoin').value = currentCoin;
    document.getElementById('editPrice').value = currentPrice;
    document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

async function saveEdit() {
    const id = document.getElementById('editId').value;
    const newCoin = document.getElementById('editCoin').value;
    const newPrice = document.getElementById('editPrice').value;

    const index = priceData.findIndex(item => item.id == id);
    if (index !== -1) {
        priceData[index].coin = newCoin;
        priceData[index].price = newPrice;
    }

    try {
        // Melakukan request PUT ke URL Sheety dengan ID baris spesifik
        await fetch(`${SHEETY_API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            // Object key untuk body request harus sesuai dengan nama sheet (coindanharga)
            body: JSON.stringify({ coindanharga: { coin: newCoin, price: newPrice } })
        });
    } catch (error) {
        console.error("Gagal menyimpan ke Sheet:", error);
        alert("Gagal menyimpan ke Google Sheets! Pastikan izin Edit (PUT) sudah diaktifkan di Sheety Anda.");
    }

    closeEditModal();
    renderPrices();
}

// Inisialisasi ketika web pertama kali dibuka
window.onload = () => {
    loadData();
};
