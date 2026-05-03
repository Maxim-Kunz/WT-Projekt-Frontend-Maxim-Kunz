<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from 'chart.js'
import { Line } from 'vue-chartjs'

// Chart.js global registrieren
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement)

const workouts = ref([])
const newName = ref('')
const newSets = ref(0)
const errorMessage = ref('')
const isDarkMode = ref(false)
const isLoading = ref(false)
const newDate = ref(new Date().toISOString().split('T')[0])
const showInfoModal = ref(true)

const baseUrl = import.meta.env.VITE_BACKEND_URL
const endpoint = `${baseUrl}/workouts`
const openInfoModal = () => { showInfoModal.value = true }
const closeInfoModal = () => { showInfoModal.value = false }

// Hilfsfunktion: Datum formatieren
const formatDate = (dateString) => {
  if (!dateString) return ''
  const [year, month, day] = dateString.split('-')
  return `${day}.${month}.${year}`
}

// Daten laden
const loadWorkouts = () => {
  isLoading.value = true
  fetch(endpoint)
      .then(response => response.json())
      .then(result => workouts.value = result)
      .catch(error => console.error('Fehler beim Laden:', error))
      .finally(() => isLoading.value = false)
}

// Daten speichern
const addWorkout = () => {
  if (newName.value.trim() === '') {
    errorMessage.value = 'Bitte gib den Namen der Übung ein.'
    return
  }
  if (newSets.value <= 0) {
    errorMessage.value = 'Die Anzahl der Sätze muss größer als 0 sein.'
    return
  }
  if (!newDate.value) {
    errorMessage.value = 'Bitte wähle ein Datum aus.'
    return
  }
  errorMessage.value = ''

  const workoutData = {
    name: newName.value.trim(),
    sets: parseInt(newSets.value),
    date: newDate.value
  }

  isLoading.value = true
  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workoutData)
  })
      .then(response => {
        if (response.ok) {
          newName.value = ''
          newSets.value = 0
          loadWorkouts()
        }
      })
      .catch(error => console.error('Fehler beim Speichern:', error))
      .finally(() => isLoading.value = false)
}

// Daten löschen
const deleteWorkout = (id) => {
  isLoading.value = true
  fetch(`${endpoint}/${id}`, {
    method: 'DELETE'
  })
      .then(response => {
        if (response.ok) {
          loadWorkouts()
        }
      })
      .catch(error => console.error('Fehler beim Löschen:', error))
      .finally(() => isLoading.value = false)
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
}

// Dropdown-Vorschläge
const uniqueExercises = computed(() => {
  const names = workouts.value.map(w => w.name)
  return [...new Set(names)]
})

// --- Statistiken (Insights) ---

// 1. Gesamtzahl aller jemals gemachten Sätze
const totalSets = computed(() => {
  return workouts.value.reduce((sum, workout) => sum + workout.sets, 0)
})

// 2. Aktivster Trainingstag (Tag mit den meisten Sätzen)
const mostActiveDay = computed(() => {
  if (workouts.value.length === 0) return null

  // Gruppieren der Sätze pro Datum (wie beim Chart)
  const setsPerDay = workouts.value.reduce((acc, workout) => {
    if (!workout.date) return acc
    acc[workout.date] = (acc[workout.date] || 0) + workout.sets
    return acc
  }, {})

  // Das Datum mit dem höchsten Wert finden
  let maxSets = 0
  let bestDate = null
  for (const [date, sets] of Object.entries(setsPerDay)) {
    if (sets > maxSets) {
      maxSets = sets
      bestDate = date
    }
  }

  return bestDate ? { date: formatDate(bestDate), sets: maxSets } : null
})

// 3. Lieblingsübung (Übung mit den meisten absolvierten Sätzen insgesamt)
const favoriteExercise = computed(() => {
  if (workouts.value.length === 0) return null

  // Sätze pro Übungsname aufsummieren
  const setsPerExercise = workouts.value.reduce((acc, workout) => {
    acc[workout.name] = (acc[workout.name] || 0) + workout.sets
    return acc
  }, {})

  // Die Übung mit dem höchsten Wert finden
  let maxSets = 0
  let bestExercise = null
  for (const [name, sets] of Object.entries(setsPerExercise)) {
    if (sets > maxSets) {
      maxSets = sets
      bestExercise = name
    }
  }

  return bestExercise ? { name: bestExercise, sets: maxSets } : null
})

// Datenaufbereitung für Chart.js
const chartData = computed(() => {
  const aggregatedData = workouts.value.reduce((acc, workout) => {
    if(!workout.date) return acc;

    if (!acc[workout.date]) {
      acc[workout.date] = 0
    }
    acc[workout.date] += workout.sets
    return acc
  }, {})

  const sortedDates = Object.keys(aggregatedData).sort()
  const labels = sortedDates.map(date => formatDate(date))
  const dataPoints = sortedDates.map(date => aggregatedData[date])

  return {
    labels: labels,
    datasets: [
      {
        label: 'Gesamtsätze',
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
        data: dataPoints,
        tension: 0.3
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
}

onMounted(loadWorkouts)
</script>

<template>
  <div :class="['app-wrapper', { 'dark-mode': isDarkMode }]">
    <div class="container">
      <header class="header">
        <h1>💪 Workout Tracker</h1>
        <div class="header-actions">
          <button @click="openInfoModal" class="info-btn" title="Info">ℹ️</button>
          <button @click="toggleDarkMode" class="theme-btn">
            {{ isDarkMode ? '☀️ Light' : '🌙 Dark' }}
          </button>
        </div>
      </header>

      <div class="add-form">
        <input v-model="newDate" type="date" class="date-input" />
        <input v-model="newName" list="exercise-suggestions" placeholder="Übung (z.B. Bankdrücken)" />
        <datalist id="exercise-suggestions">
          <option v-for="name in uniqueExercises" :key="name" :value="name"></option>
        </datalist>
        <input v-model="newSets" type="number" placeholder="Sätze" min="1" />
        <button @click="addWorkout" class="add-btn">Hinzufügen</button>
      </div>

      <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

      <hr />
      <!-- Chart-Bereich -->
      <div v-if="workouts.length > 0" class="chart-container">
        <h3>📈 Trainingsverlauf</h3>
        <!-- Line Chart aus vue-chartjs -->
        <Line :data="chartData" :options="chartOptions" />
      </div>

      <!-- NEU: Statistik-Bereich -->
      <div v-if="workouts.length > 0" class="stats-container">
        <h3>🏆 Deine Meilensteine</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">💯</span>
            <span class="stat-title">Gesamtsätze</span>
            <span class="stat-value">{{ totalSets }}</span>
          </div>

          <div class="stat-card" v-if="mostActiveDay">
            <span class="stat-icon">🔥</span>
            <span class="stat-title">Stärkster Tag</span>
            <span class="stat-value">{{ mostActiveDay.sets }} Sätze</span>
            <span class="stat-subtext">am {{ mostActiveDay.date }}</span>
          </div>

          <div class="stat-card" v-if="favoriteExercise">
            <span class="stat-icon">⭐</span>
            <span class="stat-title">Lieblingsübung</span>
            <span class="stat-value">{{ favoriteExercise.name }}</span>
            <span class="stat-subtext">{{ favoriteExercise.sets }} Sätze</span>
          </div>
        </div>
      </div>

      <!-- Ladesymbol -->
      <div v-if="isLoading" class="loading-spinner">
        🏋️‍♂️ Ich trainiere etwas, solange es lädt...
      </div>

      <!-- Workout Liste -->
      <ul v-else-if="workouts.length > 0" class="workout-list">
        <li v-for="workout in workouts" :key="workout.id" class="workout-item">
          <div class="workout-info">
            <span class="workout-name">{{ workout.name }}</span>
            <span class="workout-sets">{{ workout.sets }} Sätze</span>
            <!-- Anzeige des Datums -->
            <span class="workout-date" v-if="workout.date">({{ formatDate(workout.date) }})</span>
          </div>
          <button @click="deleteWorkout(workout.id)" class="delete-btn">Löschen</button>
        </li>
      </ul>
      <p v-else class="empty-state">Noch keine Workouts in der Datenbank vorhanden. Leg los! 💪</p>
    </div>
    <!-- Info Modal (Overlay) -->
    <div v-if="showInfoModal" class="modal-overlay" @click.self="closeInfoModal">
      <div class="modal-content">
        <h2>🏋️‍♂️ Willkommen!</h2>
        <p>Dies ist dein persönliches Workout-Logbuch.</p>
        <p>Hier kannst du deine täglichen Übungen tracken, Sätze eintragen und deinen Fortschritt chronologisch im Graphen verfolgen.</p>
        <button @click="closeInfoModal" class="close-btn">Alles klar!</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Basis-Styling */
.app-wrapper {
  min-height: 100vh;
  background-color: #f4f7f6;
  color: #333;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  transition: background-color 0.3s, color 0.3s;
}

.chart-container {
  position: relative;
  margin-top: 30px;
  margin-bottom: 40px;
  height: 250px;
}

.chart-container h3 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 10px;
}
.dark-mode .chart-container h3 {
  color: #e0e0e0;
}

/* Der weiße Container (Box-Modell) */
.container {
  background: white;
  width: 100%;
  max-width: 600px;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  transition: background-color 0.3s;
}

/* Header Flexbox */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #2c3e50;
}

/* --- Header Actions --- */
.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.info-btn {
  background: none;
  border: 1px solid #ccc;
  font-size: 1.2rem;
  padding: 5px 12px;
  border-radius: 50%;
  color: #333;
}
.info-btn:hover {
  background-color: #eee;
}

/* --- Modal Overlay & Content --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Stellt sicher, dass das Fenster ganz vorne liegt */
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  animation: popIn 0.3s ease-out; /* Kleine Animation fürs Erscheinen */
}

.modal-content h2 {
  margin-top: 0;
  color: #2c3e50;
}

.close-btn {
  margin-top: 20px;
  background-color: #4CAF50;
  color: white;
  width: 100%;
}
.close-btn:hover {
  background-color: #45a049;
}

/* Animation fürs Modal */
@keyframes popIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* --- Dark Mode Anpassungen für das Modal --- */
.dark-mode .modal-content {
  background-color: #1e1e1e;
  color: #e0e0e0;
}
.dark-mode .modal-content h2 {
  color: #e0e0e0;
}
.dark-mode .info-btn {
  border-color: #555;
}
.dark-mode .info-btn:hover {
  background-color: #333;
}

/* Formular Flexbox */
.add-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.date-input {
  max-width: 130px;
}

input {
  flex: 1;
  min-width: 0;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 1rem;
}

input[type="number"] {
  max-width: 80px;
}

button {
  padding: 10px 15px;
  cursor: pointer;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  font-size: 1rem;
  transition: transform 0.1s, background-color 0.2s;
}

button:active {
  transform: scale(0.98);
}

.add-btn { background-color: #4CAF50; color: white; }
.add-btn:hover { background-color: #45a049; }

.delete-btn { background-color: #ff4757; color: white; font-size: 0.85rem; padding: 6px 12px; }
.delete-btn:hover { background-color: #ff2a3d; }

.theme-btn { background-color: #f0f0f0; color: #333; }
.theme-btn:hover { background-color: #e0e0e0; }

.error-msg { color: #ff4757; font-size: 0.9rem; font-weight: bold; margin-bottom: 15px;}

/* Listen-Styling */
.workout-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.workout-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #fdfdfd;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
}

.workout-info {
  display: flex;
  flex-direction: column;
}

.workout-name { font-weight: bold; font-size: 1.1rem; }
.workout-sets { color: #666; font-size: 0.9rem; margin-top: 4px; }
.workout-date { color: #999; font-size: 0.8rem; font-style: italic; margin-top: 2px;}

.loading-spinner {
  text-align: center;
  font-size: 1.2rem;
  padding: 20px;
  color: #4CAF50;
  font-weight: bold;
}

.empty-state { text-align: center; color: #777; font-style: italic; }

/* Dark Mode Anpassungen */
.dark-mode { background-color: #121212; color: #e0e0e0; }
.dark-mode .container { background-color: #1e1e1e; box-shadow: 0 8px 16px rgba(0,0,0,0.5); }
.dark-mode .header h1 { color: #e0e0e0; }
.dark-mode input { background-color: #2c2c2c; color: white; border-color: #444; }
.dark-mode .workout-item { background-color: #2a2a2a; border-color: #333; }
.dark-mode .workout-sets { color: #aaa; }
.dark-mode .workout-date { color: #777; }
.dark-mode .theme-btn { background-color: #333; color: white; }
.dark-mode .theme-btn:hover { background-color: #444; }

/* --- Statistik-Bereich --- */
.stats-container {
  margin-top: 40px;
  margin-bottom: 20px;
}

.stats-container h3 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 15px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #e9ecef;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 5px;
}

.stat-title {
  font-size: 0.85rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: bold;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
  margin-top: 5px;
}

.stat-subtext {
  font-size: 0.8rem;
  color: #95a5a6;
  margin-top: 2px;
}

/* Dark Mode für Statistiken */
.dark-mode .stats-container h3 {
  color: #e0e0e0;
}
.dark-mode .stat-card {
  background: #2a2a2a;
  border-color: #333;
}
.dark-mode .stat-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}
.dark-mode .stat-title,
.dark-mode .stat-subtext {
  color: #aaa;
}
.dark-mode .stat-value {
  color: #e0e0e0;
}

</style>