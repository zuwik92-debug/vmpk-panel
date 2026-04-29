const express = require("express");
const mongoose = require("mongoose");

const app = express();

// 🔥 TO MUSI BYĆ (obsługa JSON)
app.use(express.json());

// 📁 pliki strony
app.use(express.static("public"));


// 🔌 połączenie z bazą
mongoose.connect("mongodb://127.0.0.1:27017/vztm");


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
    const istnieje = await User.findOne({ nick: "admin" });

    if (!istnieje) {
        await User.create({
            nick: "admin",
            haslo: "1234",
            role: "admin"
        });
        console.log("Admin utworzony: admin / 1234");
    }
}


// 🔐 LOGIN (z bazy)
app.post("/login", async (req, res) => {
    const { nick, haslo } = req.body;

    const user = await User.findOne({ nick, haslo });

    if(user) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
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
    console.log("BODY:", req.body); // 🔍 debug

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


// 🚀 START SERWERA
app.listen(3000, async () => {
    console.log("Serwer działa 🔥 http://localhost:3000");
    await createTestUser();
});