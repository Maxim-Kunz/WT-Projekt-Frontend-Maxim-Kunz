<script setup>
import { ref, onMounted } from 'vue'

const workouts = ref([])
const newName = ref('')
const newSets = ref(0)
const errorMessage = ref('')
const isDarkMode = ref(false)
// Neue Variable für den Ladezustand
const isLoading = ref(false)

const baseUrl = import.meta.env.VITE_BACKEND_URL
const endpoint = `${baseUrl}/workouts`

// Hilfsfunktion, um das Datum (YYYY-MM-DD) in ein deutsches Format (DD.MM.YYYY) zu wandeln
const formatDate = (dateString) => {
  if (!dateString) return ''
  const [year, month, day] = dateString.split('-')
  return `${day}.${month}.${year}`
}

// 1. Daten laden (GET)
const loadWorkouts = () => {
  isLoading.value = true // Ladesymbol aktivieren
  fetch(endpoint)
      .then(response => response.json())
      .then(result => workouts.value = result)
      .catch(error => console.error('Fehler beim Laden:', error))
      .finally(() => isLoading.value = false) // Ladesymbol deaktivieren
}

// 2. Daten speichern (POST) inkl. Validierung
const addWorkout = () => {
  if (newName.value.trim() === '') {
    errorMessage.value = 'Bitte gib den Namen der Übung ein.'
    return
  }
  if (newSets.value <= 0) {
    errorMessage.value = 'Die Anzahl der Sätze muss größer als 0 sein.'
    return
  }
  errorMessage.value = ''

  const workoutData = {
    name: newName.value.trim(),
    sets: parseInt(newSets.value)
    // Das Datum wird automatisch im Backend gesetzt!
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

// 3. Daten löschen (DELETE)
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

// 4. Dark Mode Toggle
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
}

onMounted(loadWorkouts)
</script>

<template>
  <div :class="['app-wrapper', { 'dark-mode': isDarkMode }]">
    <div class="container">
      <header class="header">
        <h1>💪 Workout Tracker</h1>
        <button @click="toggleDarkMode" class="theme-btn">
          {{ isDarkMode ? '☀️ Light' : '🌙 Dark' }}
        </button>
      </header>

      <div class="add-form">
        <input v-model="newName" placeholder="Übung (z.B. Bankdrücken)" />
        <input v-model="newSets" type="number" placeholder="Sätze" min="1" />
        <button @click="addWorkout" class="add-btn">Hinzufügen</button>
      </div>

      <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

      <hr />

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

/* Formular Flexbox */
.add-form {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

input {
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 1rem;
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
</style>