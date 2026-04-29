// 🔥 start
console.log("JS działa 🔥");
console.log("Aktualny nick:", localStorage.getItem("nick"));

// 👤 aktualny użytkownik
let aktualnyNick = localStorage.getItem("nick");

// pokaż nick
document.getElementById("user").innerText =
    "Zalogowany jako: " + aktualnyNick;


// 📅 pobieranie grafiku z bazy
async function pokazGrafik() {
    try {
        console.log("Pobieram grafik dla:", aktualnyNick);

        const res = await fetch("/grafik/" + aktualnyNick);
        const g = await res.json();

        console.log("Dane z bazy:", g);

        if (!g || !g.linia) {
            document.getElementById("linia").innerText = "Brak grafiku";
            document.getElementById("zmiana").innerText = "";
            document.getElementById("busImage").src = "";
            return;
        }

        document.getElementById("linia").innerText =
            "Linia: " + g.linia;

        document.getElementById("zmiana").innerText =
            "Zmiana: " + g.zmiana;

        if (g.autobus) {
            document.getElementById("busImage").src =
                "bus" + g.autobus + ".jpg";
        } else {
            document.getElementById("busImage").src = "";
        }

    } catch (e) {
        console.log("Błąd pobierania:", e);
    }
}


// ▶️ pokaż grafik
pokazGrafik();


// 📑 zakładki
function showTab(tab) {
    document.getElementById("home").style.display = "none";
    document.getElementById("grafik").style.display = "none";
    document.getElementById("admin").style.display = "none";

    document.getElementById(tab).style.display = "block";
}


// 🚪 wylogowanie
function logout() {
    localStorage.removeItem("nick");
    window.location.href = "index.html";
}


// 🛠️ zapis grafiku
async function zapiszGrafik() {
    console.log("klik zapis 🔥");

    const nick = document.getElementById("adminNick").value;
    const linia = document.getElementById("adminLinia").value;
    const zmiana = document.getElementById("adminZmiana").value;
    const autobus = document.getElementById("adminBus").value;

    try {
        const res = await fetch("/grafik", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nick,
                linia,
                zmiana,
                autobus
            })
        });

        const data = await res.json();

        console.log("ODPOWIEDŹ:", data);

        document.getElementById("adminStatus").innerText =
            "Zapisano w bazie 🔥";

        // odśwież grafik jeśli edytujesz siebie
        if (nick === aktualnyNick) {
            await pokazGrafik();
        }

    } catch (e) {
        console.log("Błąd zapisu:", e);
    }

    // wyczyść pola
    document.getElementById("adminNick").value = "";
    document.getElementById("adminLinia").value = "";
    document.getElementById("adminZmiana").value = "";
    document.getElementById("adminBus").value = "";
}