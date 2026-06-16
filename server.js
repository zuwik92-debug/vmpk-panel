const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());
app.use(express.static("public"));

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

// 🖼️ MODEL USTAWIEŃ (Dla dynamicznego tła)
const Settings = mongoose.model("Settings", {
    key: String,
    value: String
});

// 🧪 tworzy admina i domyślne tło
async function initDatabase() {
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

        // Domyślne tło, dopóki nie wrzucisz swojego
        const tloIstnieje = await Settings.findOne({ key: "bg_image" });
        if (!tloIstnieje) {
            await Settings.create({
                key: "bg_image",
                value: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000"
            });
        }
    } catch (error) {
        console.error("Błąd podczas inicjalizacji bazy:", error);
    }
}

// 🔐 LOGIN
app.post("/login", async (req, res) => {
    const { nick, haslo } = req.body;
    const user = await User.findOne({ nick, haslo });

    if(user) {
        res.json({ success: true, role: user.role || "user" });
    } else {
        res.json({ success: false });
    }
});

// 🖼️ POBIERZ AKTUALNE TŁO
app.get("/api/get-bg", async (req, res) => {
    const bg = await Settings.findOne({ key: "bg_image" });
    res.json({ url: bg ? bg.value : "" });
});

// 🛠️ ZMIANA TŁA (Tylko dla admina)
app.post("/api/set-bg", async (req, res) => {
    const { url } = req.body;
    await Settings.findOneAndUpdate({ key: "bg_image" }, { value: url }, { upsert: true });
    res.json({ success: true });
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
    await initDatabase();
});
