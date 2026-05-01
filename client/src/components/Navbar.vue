<template>
    <div>
        <nav>
            <div class="nav-brand">
                <img src="../assets/newpaltz_logo_dark.jpg" class="nav-logo">
            </div>

            <div class="nav-links">

                <!-- Navbar links, main pages are protected from non-logged in users -->
                <RouterLink to="/">Home</RouterLink>
                <a @click="goProtected('/Academic')">Academic Buildings</a>
                <a @click="goProtected('/Dorms')">Dormitories</a>
                <a @click="goProtected('/Storage')">Storage</a>

                <!-- problem printer notif tab (only appears once logged in) -->
                <div class="warning-wrapper" v-if="username && problemPrinters.length > 0">
                    <div class="warning-icon" @click="togglePanel">
                        ⚠️ {{ problemPrinters.length }}
                    </div>

                    <div v-if="showPanel" class="warning-panel">
                        <h3>Printers with Issues</h3>

                        <!-- printer information formatting for problem printer tab -->
                        <!-- on click, go to the tab the printer is located-->
                        <div class="warning-list">
                            <div 
                                v-for="p in problemPrinters" 
                                :key="p.serial_number"
                                :class="getSeverityClass(p)"
                                @click="goToPrinter(p)"
                            >
                                <b>{{ p.name }}</b>
                                <p>{{ p.location }}</p>
                                <span class="tag">
                                    {{ getStatus(p) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- diplays username if logged in and logout button -->
                <span v-if="username" class="user">
                    Logged in as <b>{{ username }}</b>
                </span>

                <button v-if="username" @click="logout" class="logout-btn">
                    Logout
                </button>

                <!-- displays login button if user is not logged in -->
                <RouterLink v-else to="/Auth">Login</RouterLink>

            </div>
        </nav>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { printers, loadPrinters } from '../stores/printers'

const router = useRouter()
const username = ref(null)
const showPanel = ref(false)

//if a username exists on the local system (user is logged in), 
//then load printer information
onMounted(async () => {
    username.value = localStorage.getItem("username")

    if (username.value) {
        await loadPrinters()
    }
})

//filter printers based on if they are online, have an error,
//or are low on any color toner
const problemPrinters = computed(() => {
    return printers.value.filter(p =>
        p.is_error ||
        p.status?.toLowerCase().includes("offline") ||
        (p.black != null && p.black <= 3) ||
        (p.cyan != null && p.cyan <= 3) ||
        (p.magenta != null && p.magenta <= 3) ||
        (p.yellow != null && p.yellow <= 3)
    )
})

//toggles the visibility of a panel 
// (used for clicking on the problem printer tab)
function togglePanel() {
    showPanel.value = !showPanel.value
}

//returns the status of a problem printer 
function getStatus(p) {
    if (p.is_error || p.status?.toLowerCase().includes("offline")) {
        return "ERROR"
    }
    return "LOW TONER"
}

//returns the severity of the warning for a printer, whether its offline or not
function getSeverityClass(p) {
    if (p.is_error || p.status?.toLowerCase().includes("offline")) {
        return "error-item"
    }
    return "warning-item"
}

//on click function, looks at the location of the printer,
//routes to correct page according to the location
function goToPrinter(p) {
    showPanel.value = false

    const academicBuildings = [
        "Engineering and Innovation Hub",
        "Peregrine Dining Hall",
        "Louis and Mildred Resnick Hall",
        "Smiley Art Building",
        "Wooster Hall",
        "Atrium",
        "Academic College Hall",
        "Coykendall Science Building",
        "Lecture Center",
        "Science Hall",
        "Humanities",
        "Old Main",
        "Old Library",
        "Van den Berg Hall"
    ]

    for (let i = 0; i < academicBuildings.length; i++) {
        if (p.location.includes(academicBuildings[i])) {
            router.push('/Academic')
            return
        }
    }

    const dormKeywords = ["Hall", "EOP", "Suites", "Quad"]

    for (let i = 0; i < dormKeywords.length; i++) {
        if (p.location.includes(dormKeywords[i])) {
            router.push('/Dorms')
            return
        }
    }

    router.push('/Storage')
}

//on logout, clears the local storage/current user 
//and returns to the main page of the site
function logout() {
    localStorage.clear()
    window.location.href = "/"
}

//protects the site from unauthroized/non-logged-in users,
//reroutes on each link to the login page
function goProtected(path) {
    const user = localStorage.getItem("user_id")
    if (!user) router.push('/Auth')
    else router.push(path)
}
</script>
