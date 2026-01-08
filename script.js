// Firebase Kütüphanelerini İçe Aktarıyoruz
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// -----------------------------------------------------------
// 1. BURAYI BİRAZDAN DOLDURACAĞIZ (Firebase Ayarları)
// -----------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDP0FFbZ2GtJEFVlDqkFu7yYzSKbhY35CI",
  authDomain: "zureani-b9b6d.firebaseapp.com",
  projectId: "zureani-b9b6d",
  storageBucket: "zureani-b9b6d.firebasestorage.app",
  messagingSenderId: "707624209414",
  appId: "1:707624209414:web:944088ab6e6e7c71420787",
  measurementId: "G-LSX054G5TT"
};

// Firebase'i Başlat
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

// -----------------------------------------------------------
// 2. FOTOĞRAF YÜKLEME MANTIĞI
// -----------------------------------------------------------
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');

// Butona basınca gizli dosya seçiciyi aç
uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

// Dosya seçilince çalışacak fonksiyon
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // KURAL: 5MB'dan büyükse uyarı ver
    if (file.size > 5 * 1024 * 1024) {
        alert("Fotoğraf çok büyük! Lütfen 5MB altı bir fotoğraf seç.");
        return;
    }

    try {
        // Yükleniyor efekti ver
        uploadBtn.textContent = "YÜKLENİYOR...";
        uploadBtn.classList.add("uploading");

        // 1. Dosyayı Storage'a yükle
        // Dosya isminin önüne tarih ekliyoruz ki aynı isimli dosyalar karışmasın
        const fileName = new Date().getTime() + "-" + file.name;
        const storageRef = ref(storage, "fotograflar/" + fileName);
        
        await uploadBytes(storageRef, file);

        // 2. Yüklenen dosyanın linkini al
        const downloadURL = await getDownloadURL(storageRef);

        // 3. Linki veritabanına kaydet
        await addDoc(collection(db, "galeri"), {
            url: downloadURL,
            tarih: new Date(),
            isim: "Site Ziyaretçisi" // İstersen buraya isim sorma kutusu da ekleriz
        });

        alert("Fotoğraf başarıyla yüklendi!");

    } catch (error) {
        console.error("Hata:", error);
        alert("Bir hata oluştu: " + error.message);
    } finally {
        // Butonu eski haline getir
        uploadBtn.textContent = "FOTOĞRAF EKLE +";
        uploadBtn.classList.remove("uploading");
        fileInput.value = ""; // Seçimi temizle
    }
});

// -----------------------------------------------------------
// 3. FOTOĞRAFLARI EKRA CKEKME (CANLI)
// -----------------------------------------------------------
const galleryGrid = document.querySelector('.gallery-grid');

// Veritabanını sürekli dinle (Yeni foto gelince sayfa yenilenmeden düşer)
const q = query(collection(db, "galeri"), orderBy("tarih", "desc"));

onSnapshot(q, (snapshot) => {
    // Önce HTML'deki sabit fotolar kalsın istiyorsan burayı iyi ayarla.
    // Eğer sadece yüklenenler görünsün istersen: galleryGrid.innerHTML = "";
    
    // Biz senin manuel eklediklerinin ÜSTÜNE ekleyelim (ya da altına)
    // Şimdilik sadece yeni gelenleri konsola yazdıralım, çalışıp çalışmadığını görelim
    
    snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            const data = change.doc.data();
            fotoEkleArayuze(data.url, galleryGrid.children.length + 1);
        }
    });
});

function fotoEkleArayuze(resimUrl, sira) {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    
    div.innerHTML = `
        <img src="${resimUrl}" alt="Yüklenen Foto">
        <div class="item-info">
            <span>${sira}</span>
            <p>Yeni Yüklenen Anı</p>
        </div>
    `;

    // En başa ekle (prepend) veya sona ekle (append)
    galleryGrid.prepend(div); 
}