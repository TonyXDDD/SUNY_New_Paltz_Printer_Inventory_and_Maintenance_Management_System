<template>
  <div class="dorms">
    <h1>Dormitories</h1>

    <!-- loading or error messages upon opening -->
    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error }}</div>

    <!-- printer groups -->
    <div class="cards">
      <div v-for="(printers, building) in groupedPrinters" :key="building">
        <!-- building sections -->
        <div class="building-header" @click="toggle(building)">
          {{ building }} {{ open[building] ? '▲' : '▼' }}
        </div>
        <!-- opens printer list -->
        <div v-if="open[building]" class="printer-list">
          <!-- printer information and formatting -->
          <div
            v-for="printer in printers"
            :key="printer.serial_number"
            :class="[
              'card',
              isLowToner(printer)
                ? 'warning'
                : (printer.is_error ? 'error' : 'ok')
            ]"
          >
            <h3>{{ printer.name }}</h3>
            <p><b>Location:</b> {{ printer.location }}</p>
            <p><b>Status:</b> {{ printer.status }}</p>
            <p><b>IP:</b> {{ printer.ip }}</p>
            <p><b>Pages:</b> {{ printer.page_count }}</p>

            <p>
              <b>Toner: </b>
              <span v-if="printer.black != null">Black: {{ printer.black }}% </span>
              <span v-if="printer.cyan != null">Cyan: {{ printer.cyan }}% </span>
              <span v-if="printer.magenta != null">Magenta: {{ printer.magenta }}% </span>
              <span v-if="printer.yellow != null">Yellow: {{ printer.yellow }}%</span>
            </p>
            
            <!-- button to open work history sidebar -->
            <button @click="openHistory(printer)">Work History</button>
          </div>

        </div>
      </div>
    </div>

    <div v-if="showHistory" class="history-overlay"></div>
    
    <!-- work history panel -->
    <div v-if="showHistory" class="history-panel">
      <div class="history-header">
        <h2>History for {{ selectedPrinter.name }}</h2>
        <button class="close-btn" @click="showHistory = false">✕</button>
      </div>

      <!-- add work history entry -->
      <div class="add-entry">
        <input v-model="newNote" placeholder="Enter work done..." />
        <button @click="submitHistory">Add</button>
      </div>

      <!-- formatting for work history entries -->
      <div class="history-content">
        <ul>
          <li v-for="h in history" :key="h.work_id" class="history-item">

            <div class="history-top">
              <b>{{ h.username }}</b>

              <div class="history-actions">
                <span @click="startEdit(h)">✏️</span>
                <span @click="deleteHistory(h.work_id)">✕</span>
              </div>
            </div>

            <!-- formatting change if editing entry -->
            <div v-if="editingId === h.work_id">
              <input v-model="editText" />
              <button @click="saveEdit(h.work_id)">Save</button>
            </div>

            <div v-else>
              {{ h.notes }}
            </div>
            
            <!-- creation timestamp -->
            <small>{{ new Date(h.created_at).toLocaleString() }}</small>

          </li>
        </ul>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { printers, loadPrinters } from '../stores/printers'
import { isLowToner } from '../utils/printerUtils'

const loading = ref(true)
const error = ref(null)

const open = ref({})
const selectedPrinter = ref(null)
const history = ref([])
const showHistory = ref(false)

const currentUser = ref(localStorage.getItem("user_id"))

const newNote = ref("")
const editingId = ref(null)
const editText = ref("")

//names of campus sections with their dorm buildings
const dormGroups = {
  "Academic Way": ["College Hall", "Shango Hall", "ShangoEOP", "Bouton Hall"],
  "Parker Quad": ["Capen Hall", "CapenEOP", "Scudder Hall", "Bliss Hall", "Gage Hall"],
  "Peregrine Suites": ["Awosting Hall", "Mohonk Hall", "Shawangunk Hall", "Ashokan Hall", "Minnewaska Hall"],
  "Southside Dorms": ["Ridgeview Hall", "Esopus Hall", "Lenape Hall"]
}

//loads printers upon mounting
onMounted(async () => {
  if (printers.value.length === 0) {
    await loadPrinters()
  }
  loading.value = false
})

//groups printers together based on if it is in a dorm
//building and where
const groupedPrinters = computed(() => {
  let groups = {}

  printers.value.forEach(p => {
    let found = false
    let groupName = ""

    for (let group in dormGroups) {
      for (let i = 0; i < dormGroups[group].length; i++) {
        if (p.location.includes(dormGroups[group][i])) {
          found = true
          groupName = group
        }
      }
    }

    if (!found) return

    if (!groups[groupName]) groups[groupName] = []
    groups[groupName].push(p)
  })

  let ordered = {}
  Object.keys(dormGroups).forEach(key => {
    if (groups[key]) ordered[key] = groups[key]
  })

  return ordered
})

//toggles building dropdown
function toggle(building) {
  open.value[building] = !open.value[building]
}

// open work history sidebar
async function openHistory(printer) {
  selectedPrinter.value = printer
  showHistory.value = true

  const res = await fetch(`http://localhost:4000/history/${printer.serial_number}`)
  history.value = await res.json()
}

// create work history entry
async function submitHistory() {
  if (!newNote.value) return

  await fetch('http://localhost:4000/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      printer_serial: selectedPrinter.value.serial_number,
      user_id: currentUser.value,
      notes: newNote.value
    })
  })

  newNote.value = ""
  openHistory(selectedPrinter.value)
}

// start edit of work history entry
function startEdit(h) {
  editingId.value = h.work_id
  editText.value = h.notes
}

// save edit for work history entry
async function saveEdit(id) {
  await fetch(`http://localhost:4000/history/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes: editText.value })
  })

  editingId.value = null
  openHistory(selectedPrinter.value)
}

// delete work history entry
async function deleteHistory(id) {
  await fetch(`http://localhost:4000/history/${id}`, {
    method: 'DELETE'
  })

  openHistory(selectedPrinter.value)
}
</script>