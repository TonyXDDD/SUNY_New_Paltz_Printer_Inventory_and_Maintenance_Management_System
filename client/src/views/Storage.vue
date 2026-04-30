<template>
  <div class="storage">
    <h1>Supply Inventory</h1>

    <div class="tabs">
      <button :class="{ active: activeTab === 'academic' }" @click="activeTab = 'academic'">Academic Buildings</button>
      <button :class="{ active: activeTab === 'dorm' }" @click="activeTab = 'dorm'">Dorms</button>
      <button :class="{ active: activeTab === 'storage' }" @click="activeTab = 'storage'">Storage</button>
    </div>

    <div v-if="activeTab === 'academic'">
      <div v-for="loc in academicLocations" :key="loc.location_id" class="location-block">
        <div class="location-header" @click="toggle(loc.location_id)">
          {{ loc.name }} {{ openLocations.includes(loc.location_id) ? '▲' : '▼' }}
        </div>
        <div v-if="openLocations.includes(loc.location_id)" class="location-body">
          <SupplySection :location="loc" :user="user" />
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'dorm'">
      <div v-for="(locs, group) in dormGroups" :key="group" class="dorm-group">
        <h2 class="group-header">{{ group }}</h2>
        <div v-for="loc in locs" :key="loc.location_id" class="location-block">
          <div class="location-header" @click="toggle(loc.location_id)">
            {{ loc.name }} {{ openLocations.includes(loc.location_id) ? '▲' : '▼' }}
          </div>
          <div v-if="openLocations.includes(loc.location_id)" class="location-body">
            <SupplySection :location="loc" :user="user" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'storage'">
      <div v-for="loc in storageLocations" :key="loc.location_id" class="location-block">
        <div class="location-header" @click="toggle(loc.location_id)">
          {{ loc.name }} {{ openLocations.includes(loc.location_id) ? '▲' : '▼' }}
        </div>
        <div v-if="openLocations.includes(loc.location_id)" class="location-body">
          <SupplySection :location="loc" :user="user" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import SupplySection from '../components/SupplySection.vue';

const props = defineProps({ user: Object });

const activeTab = ref('academic');
const locations = ref([]);
const openLocations = ref([]);

onMounted(async () => {
  const res = await fetch('http://localhost:3000/locations');
  locations.value = await res.json();
});

const academicLocations = computed(() => locations.value.filter(l => l.type === 'academic'));
const storageLocations = computed(() => locations.value.filter(l => l.type === 'storage'));
const dormGroups = computed(() => {
  return locations.value.filter(l => l.type === 'dorm').reduce((groups, loc) => {
    const g = loc.group_name || 'Other';
    if (!groups[g]) groups[g] = [];
    groups[g].push(loc);
    return groups;
  }, {});
});

function toggle(id) {
  if (openLocations.value.includes(id)) {
    openLocations.value = openLocations.value.filter(i => i !== id);
  } else {
    openLocations.value.push(id);
  }
}
</script>

<style scoped>
.storage { padding: 20px; }

h1 { margin-bottom: 16px; }

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tabs button {
  padding: 8px 18px;
  border: none;
  border-radius: 6px;
  background: #0d2149;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.tabs button.active { background: #6c3bff; }

.group-header {
  font-size: 16px;
  color: #aaa;
  margin: 16px 0 8px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 4px;
}

.location-block {
  margin-bottom: 8px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
}

.location-header {
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 600;
  user-select: none;
}

.location-header:hover { background: #f5f5f5; }

.location-body {
  padding: 16px;
  border-top: 1px solid #ddd;
}
</style>