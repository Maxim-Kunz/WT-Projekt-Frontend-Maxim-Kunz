<script setup>
import { ref } from 'vue'

const workouts = ref([
  { id: 1, name: 'Bankdrücken', sets: 3 },
  { id: 2, name: 'Kniebeugen', sets: 4 },
  { id: 3, name: 'Kreuzheben', sets: 3 }
])
</script>

<template>
  <div class="workout-list">
    <h2>Meine Workouts</h2>
    <ul>
      <li v-for="workout in workouts" :key="workout.id">
        {{ workout.name }} ({{ workout.sets }} Sätze)
      </li>
    </ul>
  </div>
</template>