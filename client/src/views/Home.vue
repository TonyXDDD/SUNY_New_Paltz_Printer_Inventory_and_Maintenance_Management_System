<template>
  <div class="home">
    <h1>Campus Map</h1>
    <h4>Click on a building to be re-directed</h4>

    <!-- contains map image and links based on clicking the buildings-->
    <div class="map-container">
      <img :src="map" class="map" />

      <!-- academic (STL, FAB, CSB, SIMILY, FOB, WH, JFT, HUM) hotspot -->
      <div class="hotspot academic"
          @click="goTo('academic')"
          style="top: 25%; left: 57%; width: 20%; height: 35%;">
      </div>

      <div class="hotspot academic"
        @click="goTo('academic')"
        style="top: 86% ; left: 85%; width: 3%; height: 3%">
      </div>

      <div class="hotspot academic"
        @click="goTo('academic')"
        style="top: 17% ; left: 85%; width: 5%; height: 3%">
      </div>

      <div class="hotspot academic"
        @click="goTo('academic')"
        style="top: 42% ; left: 93%; width: 0%; height: 3%">
      </div>

      <div class="hotspot academic"
        @click="goTo('academic')"
        style="top: 2% ; left: 88%; width: 0%; height: 3%">
      </div>

      <div class="hotspot academic"
          @click="goTo('academic')"
          style="top: 85%; left: 55%; width: 7%; height: 1%;">
      </div>

      <!-- dorm hotspots -->
      <div class="hotspot dorm"
          @click="goTo('dorms')"
          style="top: 10%; left: 2%; width: 20%; height: 55%;">
      </div>

      <div class="hotspot dorm"
          @click="goTo('dorms')"
          style="top: 42%; left: 32%; width: 24%; height: 40%;">
      </div>

      <div class="hotspot dorm"
        @click="goTo('dorms')"
        style="top: 75% ; left: 67%; width: 9%; height: 14%">
      </div>

      <div class="hotspot dorm"
        @click="goTo('dorms')"
        style="top: 60% ; left: 85%; width: 10%; height: 24%">
      </div>
    </div>

    <!-- site information -->
    <div class="info-section">
      <h2>About This Application</h2>
      <p>
        This application is an Inventory Management System designed for tracking
        printers, toner levels, and supply usage across campus buildings, specifically
        for the campus printing services.
      </p>

      <h3>What You Can Do:</h3>
      <ul>
        <li>View printers in academic buildings and dorms</li>
        <li>Monitor printer status and toner levels in real time</li>
        <li>Log and track maintenance using Work History</li>
        <li>Manage storage inventory such as toner and paper</li>
        <li>Quickly navigate buildings using the interactive campus map</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import map from '../assets/sunyNPcampusMap.png'

const router = useRouter()

//routes building links to other tabs in the site
function goTo(type) {
  if (type === 'academic') {
    router.push('/academic')
  } else if (type === 'dorms') {
    router.push('/dorms')
  }
}
</script>

<!-- stylesheet for home page -->
<style scoped>
.home {
  padding: 20px;
  text-align: center;
}

.map-container {
  position: relative;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.map {
  width: 100%;
  display: block;

  border: 3px solid #012242;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* clickable zones */
.hotspot {
  position: absolute;
  cursor: pointer;
  border-radius: 6px;
}

/* debug colors
.hotspot.academic {
  background: rgba(255, 0, 0, 0.2);
}

.hotspot.dorm {
  background: rgba(0, 0, 255, 0.2);
} */

.map {
  width: 100%;
  height: auto;
}

.info-section {
  max-width: 800px;
  margin: 30px auto;
  text-align: left;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.info-section h2 {
  margin-bottom: 10px;
}

.info-section h3 {
  margin-top: 15px;
  margin-bottom: 8px;
}

.info-section ul {
  padding-left: 20px;
}

.info-section li {
  margin-bottom: 6px;
}
</style>