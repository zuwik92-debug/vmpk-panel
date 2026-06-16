const express = require("express");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use(fileUpload()); // 🔥 Włączamy obsługę wgrywania plików

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vztm";

mongoose.connect(MONGO_URI)
    .then(() => console.log("Połączono z MongoDB! 🔌"))
    .catch(err => console.error("Błąd połączenia z bazą danych:", err));

// 👤 MODEL USERA
const User = mongoose.model("User", {
    nick: String,
    haslo: String,
    linia: String,
    zmiana: String,
    autobus: String,
    role: String
});

// 🧪 tworzy admina (tylko raz)
async function createTestUser() {
    try {
        const istnieje = await User.findOne({ nick: "admin" });
        if (!istnieje) {
            await User.create({
                nick: "admin",
                haslo: "1234",
                role: "admin"
            });
            console.log("Admin utworzony: admin / 1234");
        }
    } catch (error) {
        console.error("Błąd podczas tworzenia admina:", error);
    }
}

// 🔐 LOGIN
app.post("/login", async (req, res) => {
    const { nick, haslo } = req.body;
    const user = await User.findOne({ nick, haslo });

    if(user) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// 🖼️ WGLEDNY ENDPOINT DO AP-LOUDU ZDJĘCIA (Zapisuje jako public/tlo.jpg)
app.post("/upload-bg", (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ success: false, message: "Nie wybrano pliku." });
    }

    const tloPlik = req.files.tlo;
    const sciezkaZapisu = path.join(__dirname, "public", "tlo.jpg");

    tloPlik.mv(sciezkaZapisu, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Błąd zapisu pliku." });
        }
        res.json({ success: true });
    });
});

// 📊 POBIERZ GRAFIK
app.get("/grafik/:nick", async (req, res) => {
    const user = await User.findOne({ nick: req.params.nick });
    if(!user) return res.json(null);
    res.json({
        linia: user.linia,
        zmiana: user.zmiana,
        autobus: user.autobus
    });
});

// 🛠️ ZAPIS GRAFIKU
app.post("/grafik", async (req, res) => {
    const { nick, linia, zmiana, autobus } = req.body;
    let user = await User.findOne({ nick });

    if(!user) {
        user = new User({ nick, haslo: "1234" });
    }

    user.linia = linia;
    user.zmiana = zmiana;
    user.autobus = autobus;

    await user.save();
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Serwer działa 🔥 Port: ${PORT}`);
    await createTestUser();
});
