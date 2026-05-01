<template>
  <div class="supply-log">

    <!-- toner section -->
    <div class="section">
      <div class="section-header">
        <h3>Toner</h3>
        <button class="add-btn" @click="showTonerForm = !showTonerForm">
          {{ showTonerForm ? 'Cancel' : '+ Add' }}
        </button>
      </div>

      <!-- toner form -->
      <div v-if="showTonerForm" class="add-form">
        <select v-model="newToner.model">
          <option value="">Select model...</option>
          <option v-for="m in tonerModels" :key="m" :value="m">{{ m }}</option>
        </select>
        <input v-model.number="newToner.quantity" type="number" min="0" placeholder="Qty" />
        <button class="submit-btn" @click="submitToner">Submit</button>
        <span v-if="tonerMsg" class="msg">{{ tonerMsg }}</span>
      </div>

      <!-- entry description-->
      <table v-if="tonerLog.length">
        <thead>
          <tr><th>Model</th><th>Count</th><th>Counted By</th><th>Date</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="e in tonerLog" :key="e.log_id">
            <td>{{ e.toner_model }}</td>
            <td>{{ e.quantity }}</td>
            <td>{{ e.counted_by }}</td>
            <td>{{ formatDate(e.counted_at) }}</td>
            <td><button class="del-btn" @click="deleteToner(e.log_id)">✕</button></td>
          </tr>
        </tbody>
        <!-- stock totals based on entered information -->
        <tfoot>
          <tr v-for="(total, model) in tonerTotals" :key="model">
            <td colspan="5"><strong>Total {{ model }}: {{ total }}</strong></td>
          </tr>
        </tfoot>
      </table>
      <!-- display for if there are no entries-->
      <p v-else class="empty">No toner entries yet.</p>
    </div>

    <!-- paper section -->
    <div class="section">
      <div class="section-header">
        <h3>Paper</h3>
        <button class="add-btn" @click="showPaperForm = !showPaperForm">
          {{ showPaperForm ? 'Cancel' : '✏️ Edit' }}
        </button>
      </div>

      <!-- paper form -->
      <div v-if="showPaperForm" class="add-form">
        <input v-model.number="newPaper.quantity" type="number" min="0" placeholder="Boxes" />
        <button class="submit-btn" @click="submitPaper">Submit</button>
        <span v-if="paperMsg" class="msg">{{ paperMsg }}</span>
      </div>
      <!-- entry description -->
      <table v-if="paperLog.length">
        <thead>
          <tr><th>Count (boxes)</th><th>Counted By</th><th>Date</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="e in paperLog" :key="e.log_id">
            <td>{{ e.quantity }}</td>
            <td>{{ e.counted_by }}</td>
            <td>{{ formatDate(e.counted_at) }}</td>
            <td><button class="del-btn" @click="deletePaper(e.log_id)">✕</button></td>
          </tr>
        </tbody>
        <!-- stock totals based on entered information -->
        <tfoot>
          <tr><td colspan="4"><strong>Total Boxes: {{ paperTotal }}</strong></td></tr>
        </tfoot>
      </table>
      <!-- display for if there are no entries-->
      <p v-else class="empty">No paper entries yet.</p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({ location: Object, user: Object });

//toner models
const tonerModels = [
  '650A BLK', '650A Cyan', '650A Mag', '650A Yel',
  '507X BLK', '507A Cyan', '507A Mag', '507A Yel',
  '90X', '81X', '37X', '25X', '14X', '87A', '89A', '64X'
];

//setting empty variables for future use
const tonerLog = ref([]);
const paperLog = ref([]);
const newToner = ref({ model: '', quantity: 0 });
const newPaper = ref({ quantity: 0 });
const tonerMsg = ref('');
const paperMsg = ref('');
const showTonerForm = ref(false);
const showPaperForm = ref(false);

//fetch toner and paper data
onMounted(() => {
  fetchToner();
  fetchPaper();
});

//fetch toner information and store it in the log
async function fetchToner() {
  try {
    const res = await fetch(`http://localhost:3000/toner/${props.location.location_id}`);
    tonerLog.value = await res.json();
  } catch (e) { console.error(e); }
}

//fetch paper information and store it in the log
async function fetchPaper() {
  try {
    const res = await fetch(`http://localhost:3000/paper/${props.location.location_id}`);
    paperLog.value = await res.json();
  } catch (e) { console.error(e); }
}

//submits a new entry in the toner log and displays
async function submitToner() {
  if (!newToner.value.model || newToner.value.quantity < 0) {
    tonerMsg.value = 'Select a model and enter a quantity.';
    return;
  }
  const res = await fetch('http://localhost:3000/toner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location_id: props.location.location_id,
      toner_model: newToner.value.model,
      quantity: newToner.value.quantity,
      user_id: props.user?.user_id
    })
  });
  if (res.ok) {
    tonerMsg.value = 'Saved!';
    newToner.value = { model: '', quantity: 0 };
    showTonerForm.value = false;
    fetchToner();
    setTimeout(() => tonerMsg.value = '', 3000);
  } else {
    tonerMsg.value = 'Error saving.';
  }
}

//submits a new entry in the paper log and displays
async function submitPaper() {
  if (newPaper.value.quantity < 0) {
    paperMsg.value = 'Enter a valid quantity.';
    return;
  }
  const res = await fetch('http://localhost:3000/paper', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location_id: props.location.location_id,
      quantity: newPaper.value.quantity,
      user_id: props.user?.user_id
    })
  });
  if (res.ok) {
    paperMsg.value = 'Saved!';
    newPaper.value = { quantity: 0 };
    showPaperForm.value = false;
    fetchPaper();
    setTimeout(() => paperMsg.value = '', 3000);
  } else {
    paperMsg.value = 'Error saving.';
  }
}

//deletes an entry from the toner log
async function deleteToner(log_id) {
  await fetch(`http://localhost:3000/toner/${log_id}`, { method: 'DELETE' });
  fetchToner();
}

//deletes an entry from the paper log
async function deletePaper(log_id) {
  await fetch(`http://localhost:3000/paper/${log_id}`, { method: 'DELETE' });
  fetchPaper();
}

//computates the toner stock total for each model of printer
//based on each entry
const tonerTotals = computed(() =>
  tonerLog.value.reduce((acc, e) => {
    acc[e.toner_model] = (acc[e.toner_model] || 0) + e.quantity;
    return acc;
  }, {})
);

//computates the paper box stock total for each location
//based on each entry
const paperTotal = computed(() => paperLog.value.reduce((sum, e) => sum + e.quantity, 0));

//formats the date for the storage entries
function formatDate(dt) {
  return new Date(dt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
</script>

<!-- stylesheet for the template -->
<style scoped>
.supply-log { display: flex; flex-direction: column; gap: 24px; }

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.section-header h3 {
  font-size: 13px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
}

.add-btn {
  background: #0d2149;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.add-btn:hover { background: #6c3bff; }

.add-form {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 6px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin-bottom: 8px;
}

th {
  text-align: left;
  padding: 8px;
  background: #f0f0f0;
  color: #555;
  border-bottom: 1px solid #ddd;
}

td {
  padding: 8px;
  border-bottom: 1px solid #eee;
}

tfoot td {
  padding-top: 10px;
  color: #6c3bff;
  border-bottom: none;
  font-size: 13px;
}

.empty { color: #aaa; font-size: 13px; }

select, input {
  border: 1px solid #ccc;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

input { width: 100px; }

.submit-btn {
  background: #6c3bff;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.submit-btn:hover { background: #5a2ee0; }

.del-btn {
  background: transparent;
  border: none;
  color: #cc0000;
  cursor: pointer;
  font-size: 14px;
  padding: 2px 6px;
}

.del-btn:hover { color: #ff0000; }

.msg { font-size: 13px; color: #6c3bff; }
</style>