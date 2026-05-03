<script setup>
import { ref, onMounted } from 'vue'

const workouts = ref([])
const newName = ref('')
const newSets = ref(0)
const errorMessage = ref('')
const isDarkMode = ref(false)

const baseUrl = import.meta.env.VITE_BACKEND_URL
const endpoint = `${baseUrl}/workouts`

// 1. Daten laden (GET)
const loadWorkouts = () => {
  fetch(endpoint)
      .then(response => response.json())
      .then(result => workouts.value = result)
      .catch(error => console.error('Fehler beim Laden:', error))
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
  }

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
}

// 3. Daten löschen (DELETE)
const deleteWorkout = (id) => {
  fetch(`${endpoint}/${id}`, {
    method: 'DELETE'
  })
      .then(response => {
        if (response.ok) {
          loadWorkouts()
        }
      })
      .catch(error => console.error('Fehler beim Löschen:', error))
}

// 4. Dark Mode Toggle
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
}

onMounted(loadWorkouts)
</script>

<template>
  <div :class="['app-wrapper', { 'dark-mode': isDarkMode }]">
    <h2>Workout Tracker (M4)</h2>

    <button @click="toggleDarkMode" class="theme-btn">
      {{ isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode' }}
    </button>


    <div class="add-form">
      <input v-model="newName" placeholder="Übung (z.B. Bankdrücken)" />
      <input v-model="newSets" type="number" placeholder="Sätze" />
      <button @click="addWorkout" class="add-btn">Hinzufügen</button>
    </div>

    <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

    <hr />

    <ul v-if="workouts.length > 0">
      <li v-for="workout in workouts" :key="workout.id">
        <strong>{{ workout.name }}</strong>: {{ workout.sets }} Sätze
        <button @click="deleteWorkout(workout.id)" class="delete-btn">Löschen</button>
      </li>
    </ul>
    <p v-else>Noch keine Workouts in der Datenbank vorhanden.</p>
  </div>
</template>

<style scoped>
.app-wrapper {
  padding: 20px;
  min-height: 100vh;
  transition: background-color 0.3s, color 0.3s;
}

.add-form { margin-bottom: 10px; display: flex; gap: 10px; }
input { padding: 5px; border-radius: 4px; border: 1px solid #ccc; }
button { padding: 5px 15px; cursor: pointer; border: none; border-radius: 4px; font-weight: bold; }

.add-btn { background-color: #42b983; color: white; }
.delete-btn { background-color: #ff4757; color: white; margin-left: 15px; padding: 3px 8px; font-size: 0.8em; }
.theme-btn { margin-bottom: 20px; background-color: #333; color: white; }
.error-msg { color: #ff4757; font-size: 0.9em; margin-top: 0; font-weight: bold; }

li { margin-bottom: 15px; }


.dark-mode {
  background-color: #1a1a1a;
  color: #f5f5f5;
}
.dark-mode input {
  background-color: #333;
  color: white;
  border-color: #555;
}
.dark-mode .theme-btn {
  background-color: #f5f5f5;
  color: #333;
}
</style>