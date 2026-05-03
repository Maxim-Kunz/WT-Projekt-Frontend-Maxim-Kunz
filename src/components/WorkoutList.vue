<script setup>
import { ref, onMounted } from 'vue'

const workouts = ref([])

const loadWorkouts = () => {
  const baseUrl = import.meta.env.VITE_BACKEND_URL
  const endpoint = `${baseUrl}/workouts`

  const requestOptions = {
    method: 'GET',
    redirect: 'follow'
  }

  fetch(endpoint, requestOptions)
      .then(response => {
        if (!response.ok) throw new Error('Netzwerk-Fehler beim Fetch')
        return response.json()
      })
      .then(result => {
        workouts.value = result
      })
      .catch(error => console.error('Fehler:', error))
}

onMounted(() => {
  loadWorkouts()
})
</script>

<template>
  <div class="workout-list">
    <h2>Meine Workouts aus der Cloud</h2>
    <ul v-if="workouts.length > 0">
      <li v-for="workout in workouts" :key="workout.exerciseName">
        {{ workout.exerciseName }} ({{ workout.sets }} Sätze)
      </li>
    </ul>
    <p v-else>Lade Workouts vom Server...</p>
  </div>
</template>