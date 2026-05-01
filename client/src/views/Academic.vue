<template>
  <div class="academic">
    <h1>Academic Buildings</h1>

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
            
            <!-- button to open work history sidebar -->
            <button @click="openHistory(printer)">Work History</button>
          </div>

        </div>
      </div>
    </div>

    <!-- work history panel -->
    <div v-if="showHistory" class="history-panel">
      <div class="history-header">
        <h2>{{ selectedPrinter.name }}</h2>
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

//names of academic buildings
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

//groups printers together based on if it is in an academic
//building and where
const groupedPrinters = computed(() => {
  let groups = {}

  printers.value.forEach(p => {
    let isAcademic = false

    for (let i = 0; i < academicBuildings.length; i++) {
      if (p.location.includes(academicBuildings[i])) {
        isAcademic = true
      }
    }

    if (!isAcademic) return

    let name = p.location.split('(')[0].trim()

    if (!groups[name]) groups[name] = []
    groups[name].push(p)
  })

  let sorted = {}
  Object.keys(groups).sort().forEach(key => {
    sorted[key] = groups[key]
  })

  return sorted
})

//loads printers upon mounting
onMounted(async () => {
  try {
    if (printers.value.length === 0) {
      await loadPrinters()
    }
  } catch (e) {
    error.value = "couldn't load printers"
  }

  loading.value = false
})

//toggles building dropdown
function toggle(building) {
  open.value[building] = !open.value[building]
}

//opens work history sidebar
async function openHistory(printer) {
  selectedPrinter.value = printer
  showHistory.value = true

  const res = await fetch(`http://localhost:3000/history/${printer.serial_number}`)
  history.value = await res.json()
}

//create work history entry
async function submitHistory() {
  if (!newNote.value) return

  await fetch('http://localhost:3000/history', {
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

//edit work history entry
function startEdit(h) {
  editingId.value = h.work_id
  editText.value = h.notes
}

// save edit for work history entry
async function saveEdit(id) {
  await fetch(`http://localhost:3000/history/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes: editText.value })
  })

  editingId.value = null
  openHistory(selectedPrinter.value)
}

//delete work history entry
async function deleteHistory(id) {
  await fetch(`http://localhost:3000/history/${id}`, {
    method: 'DELETE'
  })

  openHistory(selectedPrinter.value)
}
</script>