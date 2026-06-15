const express = require("express");
const mongoose = require("mongoose");

const app = express();

// 🔥 Obsługa formatu JSON (wymagane do komunikacji z frontendem)
app.use(express.json());

// 📁 Serwowanie plików statycznych strony (HTML, CSS, JS z folderu public)
app.use(express.static("public"));


// 🔌 Połączenie z bazą danych
// Pobiera adres ze zmiennej MONGO_URI na Renderze. Jeśli jej nie ma (lokalnie), łączy z localhost.
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vztm";

mongoose.connect(MONGO_URI)
    .then(() => console.log("Połączono z MongoDB! 🔌"))
    .catch(err => console.error("Błąd połączenia z bazą danych:", err));


// 👤 MODEL UŻYTKOWNIKA (Struktura danych w bazie)
const User = mongoose.model("User", {
    nick: String,
    haslo: String,
    linia: String,
    zmiana: String,
    autobus: String,
    role: String
});


// 🧪 Funkcja tworząca konto administratora (uruchamia się tylko raz przy starcie, jeśli nie istnieje)
async function createTestUser() {
    try {
        const istnieje = await User.findOne({ nick: "admin" });

        if (!istnieje) {
            await User.create({
                nick: "admin",
                haslo: "1234",
                role: "admin"
            });
            console.log("Admin utworzony domyślnie: admin / 1234");
        }
    } catch (error) {
        console.error("Błąd podczas sprawdzania/tworzenia admina:", error);
    }
}


// 🔐 LOGOWANIE
app.post("/login", async (req, res) => {
    const { nick, haslo } = req.body;

    const user = await User.findOne({ nick, haslo });

    if(user) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});


// 📊 POBIERANIE GRAFIKU DLA UŻYTKOWNIKA
app.get("/grafik/:nick", async (req, res) => {
    const user = await User.findOne({ nick: req.params.nick });

    if(!user) return res.json(null);

    res.json({
        linia: user.linia,
        zmiana: user.zmiana,
        autobus: user.autobus
    });
});


// 🛠️ ZAPIS I AKTUALIZACJA GRAFIKU
app.post("/grafik", async (req, res) => {
    console.log("Otrzymane dane (BODY):", req.body); // 🔍 debugowanie w konsoli

    const { nick, linia, zmiana, autobus } = req.body;

    let user = await User.findOne({ nick });

    // Jeśli użytkownik nie istnieje w bazie, utwórz go z domyślnym hasłem
    if(!user) {
        user = new User({ nick, haslo: "1234" });
    }

    user.linia = linia;
    user.zmiana = zmiana;
    user.autobus = autobus;

    await user.save();

    res.json({ success: true });
});


// 🚀 START SERWERA
// Dynamiczny port przydzielany przez hosting Render lub domyślny port 3000 do testów lokalnych
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`Serwer działa poprawnie na porcie: ${PORT} 🔥`);
    await createTestUser();
});
