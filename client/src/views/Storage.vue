<template>
  <div class="storage">
    <h1>Supply Inventory</h1>

    <!-- page specific sub-tabs -->
    <div class="tabs">
      <button :class="{ active: activeTab === 'academic' }" @click="activeTab = 'academic'">Academic Buildings</button>
      <button :class="{ active: activeTab === 'dorm' }" @click="activeTab = 'dorm'">Dorms</button>
      <button :class="{ active: activeTab === 'storage' }" @click="activeTab = 'storage'">Storage</button>
    </div>

    <!-- formatting for academic tab -->
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

    <!-- formatting for dorm tab -->
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

    <!-- formatting for storage tab -->
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

//sets the default tab to academic 
const activeTab = ref('academic');
const locations = ref([]);
const openLocations = ref([]);

//fetched location data on mount
onMounted(async () => {
  const res = await fetch('http://localhost:3000/locations');
  locations.value = await res.json();
});

//computes and filters the data for each location
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

//toggle function for each tab
function toggle(id) {
  if (openLocations.value.includes(id)) {
    openLocations.value = openLocations.value.filter(i => i !== id);
  } else {
    openLocations.value.push(id);
  }
}
</script>