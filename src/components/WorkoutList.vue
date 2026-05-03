<script setup>
import { ref, onMounted } from 'vue'

const workouts = ref([])
const newName = ref('')
const newSets = ref(0)

const baseUrl = import.meta.env.VITE_BACKEND_URL
const endpoint = `${baseUrl}/workouts`

// 1. Daten laden (GET)
const loadWorkouts = () => {
  fetch(endpoint)
      .then(response => response.json())
      .then(result => workouts.value = result)
      .catch(error => console.error('Fehler beim Laden:', error))
}

// 2. Daten speichern (POST)
const addWorkout = () => {
  const workoutData = {
    name: newName.value,
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

onMounted(loadWorkouts)
</script>

<template>
  <div class="workout-list">
    <h2>Workout Tracker (M4)</h2>

    <!-- Formular zum Hinzufügen -->
    <div class="add-form">
      <input v-model="newName" placeholder="Übung (z.B. Bankdrücken)" />
      <input v-model="newSets" type="number" placeholder="Sätze" />
      <button @click="addWorkout">Hinzufügen</button>
    </div>

    <hr />

    <ul v-if="workouts.length > 0">
      <li v-for="workout in workouts" :key="workout.id">
        <strong>{{ workout.name }}</strong>: {{ workout.sets }} Sätze
      </li>
    </ul>
    <p v-else>Noch keine Workouts in der Datenbank vorhanden.</p>
  </div>
</template>

<style scoped>
.add-form { margin-bottom: 20px; display: flex; gap: 10px; }
input { padding: 5px; }
button { background-color: #42b983; color: white; border: none; padding: 5px 15px; cursor: pointer; }
</style>