/* =========================
   CURSOR GLOW EFFECT
========================= */

const glow = document.getElementById("glow");

document.addEventListener("mousemove", (e) => {

    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";

});

/* =========================
   HERO TYPING EFFECT
========================= */

const text = "THE FUTURE OF DIGITAL STORIES STARTS HERE";

let i = 0;

function typingEffect() {

    if (i < text.length) {

        document.getElementById("typingText").innerHTML += text.charAt(i);

        i++;

        setTimeout(typingEffect, 70);

    }

}

typingEffect();

/* =========================
   ACTIVE NAVBAR
========================= */

const navLinks = document.querySelectorAll(".nav-links a");

navLinks.forEach(link => {

    link.addEventListener("click", () => {

        document
            .querySelector(".nav-links a.active")
            .classList.remove("active");

        link.classList.add("active");

    });

});

/* =========================
   SCROLL REVEAL ANIMATION
========================= */

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

        }

    });

}, {
    threshold: 0.2
});

document.querySelectorAll(".hidden").forEach(el => {

    observer.observe(el);

});

/* =========================
   3D CARD HOVER EFFECT
========================= */

document.querySelectorAll(".card").forEach(card => {

    card.addEventListener("mousemove", (e) => {

        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / 35) * -1;
        const rotateY = (x - centerX) / 35;

        card.style.transition = "0.1s";

        card.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(-12px)
      scale(1.02)
    `;

    });

    card.addEventListener("mouseleave", () => {

        card.style.transition = "0.5s";

        card.style.transform = `
      perspective(1000px)
      rotateX(0deg)
      rotateY(0deg)
      translateY(0px)
      scale(1)
    `;

    });

});

/* =========================
   HERO BUTTON MAGNET EFFECT
========================= */

document.querySelectorAll(".hero-btn").forEach(btn => {

    btn.addEventListener("mousemove", (e) => {

        const rect = btn.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (btn.classList.contains("primary")) {

            btn.style.background = `
        radial-gradient(circle at ${x}px ${y}px,
        rgba(255,255,255,0.35),
        transparent 60%),
        linear-gradient(135deg,#7b61ff,#ff4fd8)
      `;

        }

    });

    btn.addEventListener("mouseleave", () => {

        if (btn.classList.contains("primary")) {

            btn.style.background =
                "linear-gradient(135deg,#7b61ff,#ff4fd8)";

        }

    });

});

/* =========================
   SEARCH FILTER
========================= */

const searchInput = document.querySelector(".search");

searchInput.addEventListener("keyup", () => {

    const value = searchInput.value.toLowerCase();

    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {

        const text = card.innerText.toLowerCase();

        if (text.includes(value)) {

            card.style.display = "block";

        } else {

            card.style.display = "none";

        }

    });

});

/* =========================
   CATEGORY FILTER
========================= */

const tabs = document.querySelectorAll(".tab");
const cards = document.querySelectorAll(".card");

tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        document.querySelector(".tab.active")
            .classList.remove("active");

        tab.classList.add("active");

        const category = tab.innerText.toLowerCase();

        cards.forEach(card => {

            const badge = card.querySelector(".badge")
                .innerText.toLowerCase();

            if (category === "all") {

                card.style.display = "block";

            } else if (badge.includes(category)) {

                card.style.display = "block";

            } else {

                card.style.display = "none";

            }

        });

    });

});

/* =========================
   NEWSLETTER BUTTON
========================= */

const subscribeBtn = document.querySelector(".news-form button");

subscribeBtn.addEventListener("click", () => {

    const email = document.querySelector(".news-form input").value;

    if (email === "") {

        alert("Please enter your email!");

    } else {

        alert("Subscribed Successfully 🚀");

        document.querySelector(".news-form input").value = "";

    }

});

/* =========================
   PARALLAX HERO EFFECT
========================= */

window.addEventListener("scroll", () => {

    const scrollY = window.scrollY;

    document.querySelector(".hero").style.transform =
        `translateY(${scrollY * 0.15}px)`;

});

/* =========================
   AUTO COUNTER ANIMATION
========================= */

const counters = document.querySelectorAll(".stat-box h2");

counters.forEach(counter => {

    const updateCounter = () => {

        const target = +counter.innerText.replace("+", "").replace("K", "000");

        const current = +counter.getAttribute("data-count") || 0;

        const increment = target / 60;

        if (current < target) {

            const value = Math.ceil(current + increment);

            counter.setAttribute("data-count", value);

            if (counter.innerText.includes("K")) {

                counter.innerText = Math.floor(value / 1000) + "K+";

            } else {

                counter.innerText = value + "+";

            }

            setTimeout(updateCounter, 30);

        }

    };

    updateCounter();

});

/* =========================
   SCROLL TO TOP BUTTON
========================= */

const topBtn = document.createElement("button");

topBtn.innerHTML = "↑";

topBtn.style.position = "fixed";
topBtn.style.bottom = "30px";
topBtn.style.right = "30px";
topBtn.style.width = "55px";
topBtn.style.height = "55px";
topBtn.style.border = "none";
topBtn.style.borderRadius = "50%";
topBtn.style.background =
    "linear-gradient(135deg,#7b61ff,#ff4fd8)";
topBtn.style.color = "white";
topBtn.style.fontSize = "22px";
topBtn.style.cursor = "pointer";
topBtn.style.display = "none";
topBtn.style.zIndex = "999";
topBtn.style.boxShadow =
    "0 10px 30px rgba(123,97,255,0.4)";

document.body.appendChild(topBtn);

window.addEventListener("scroll", () => {

    if (window.scrollY > 500) {

        topBtn.style.display = "block";

    } else {

        topBtn.style.display = "none";

    }

});

topBtn.addEventListener("click", () => {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

/* =========================
   PAGE LOADER
========================= */

window.addEventListener("load", () => {

    document.body.style.opacity = "1";

});

/* =========================
   CONSOLE MESSAGE
========================= */

console.log(`
🚀 YRONEX FUTURISTIC BLOG
Designed with HTML CSS JS
Premium UI Experience Loaded
`);