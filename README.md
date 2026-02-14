# Kitchen ERP - Demo Frontend (O'zbekcha)

Ushbu loyiha **Kitchen ERP** tizimining frontend qismi bo'lib, backendga ulanmagan holda ishlaydigan **DEMO** versiyasidir. Tizim to'liq brauzerda ishlaydi va barcha ma'lumotlar mock (soxta) ma'lumotlar asosida shakllantirilgan.

## 🚀 Loyihani ishga tushirish

Loyiha kompyuteringizda ishlashi uchun quyidagi qadamlarni bajaring:

1.  **Terminalni oching** va loyiha papkasiga kiring:
    ```bash
    cd demoFront
    ```

2.  **Kutubxonalarni o'rnating** (bir marta):
    ```bash
    npm install
    ```

3.  **Loyiha ishga tushiring**:
    ```bash
    npm run dev
    ```

4.  **Brauzerda oching**:
    Terminalda ko'rsatilgan manzilga kiring (odatda `http://localhost:5173`).

### 🔑 Kirish ma'lumotlari
Tizimga kirish uchun istalgan email va paroldan foydalanishingiz mumkin:
-   **Login**: `admin@kitchen.com`
-   **Parol**: `12345` (yoki xohlagan parolingiz)

---

## PDA (Bo'limlar va ularning vazifalari)

Loyiha quyidagi asosiy bo'limlardan iborat bo'lib, har biri oshxona boshqaruvining ma'lum bir qismini avtomatlashtirishga xizmat qiladi:

### 1. 📊 Dashboard (Bosh sahifa)
Bu bo'limda umumiy statistika va ko'rsatkichlar joylashgan.
-   **Kunlik/Oylik savdo**: Kirim va chiqimlar farqi.
-   **Buyurtmalar soni**: Bugungi faollik.
-   **Grafiklar**: Daromad va xarajatlar dinamikasi vizual ko'rinishda.

### 2. 📦 Mahsulotlar (Items)
Oshxonada ishlatiladigan barcha xom-ashyo va tovarlar ro'yxati.
-   **Yangi mahsulot qo'shish**: Nomi, o'lchov birligi (kg, litr, dona) va turini kiritish.
-   **Tahrirlash**: Mahsulot nomini yoki narxini o'zgartirish.
-   **Minimal qoldiq**: Qaysi mahsulot tugayotganini nazorat qilish uchun limit belgilash.

### 3. 🏭 Ombor (Stock)
Mahsulotlarning kirim va chiqim harakatlari.
-   **Qoldiqlar**: Real vaqt rejimida qaysi mahsulotdan qancha borligini ko'rish.
-   **Kirim qilish**: Bozorlik qilinganda omborga mahsulot kiritish (masalan: 50kg Guruch).
-   **Chiqim qilish**: Pishirish uchun mahsulot olish.
-   **Tarix**: Qachon, kim tomonidan, qancha mahsulot olinganligini ko'rish.

### 4. 💰 Kassa (Cash)
Moliyaviy oqimlar nazorati.
-   **Kirim/Chiqim**: Puldorlik va xarajatlarni qayd etish.
-   **Kategoriyalar**: Xarajatlarni turlarga bo'lish (masalan: Taksi, Mahsulot, Oylik).
-   **Balans**: Kassadagi joriy pul miqdori.

### 5. 👥 Xodimlar (Employees)
Ishchilar ro'yxati va ularning ma'lumotlari.
-   **Xodim qo'shish**: Ism, lavozim va oylik maoshini kiritish.
-   **Faollik**: Xodim ishlayotgani yoki bo'shaganligini belgilash.

### 6. 💸 Oyliklar (Salaries)
Xodimlarga ish haqi to'lash tizimi.
-   **Hisob-kitob**: Kimga qancha to'langanligi, avans va bonuslar.
-   **Jarima va Mukofot**: Oylikdan ushlash yoki qo'shimcha rag'batlantirish.
-   **Tarix**: O'tgan oylar bo'yicha to'lovlar tarixi.

### 7. 📈 Hisobotlar (Reports)
Tizimning chuqurlashtirilgan tahlili.
-   **Ombor hisoboti**: Qaysi mahsulot eng ko'p ishlatilyapti?
-   **Moliyaviy hisobot**: Qaysi oyda eng ko'p foyda ko'rildi?

---

## 🛠 Texnik Ma'lumotlar
-   **Frontend**: React, TypeScript, Vite
-   **UI**: TailwindCSS, Shadcn/UI
-   **State Management**: Zustand, TanStack Query
-   **Data**: Mock (soxta) ma'lumotlar `src/mocks` papkasida joylashgan.

> **Eslatma**: Ushbu demo versiyada ma'lumotlar brauzer xotirasida (RAM) vaqtincha saqlanadi. Sahifa yangilansa (refresh), kiritilgan yangi ma'lumotlar o'chib ketadi va dastlabki holatga qaytadi.
