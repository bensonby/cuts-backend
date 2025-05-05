<script setup>
const props = defineProps(['userCourses', 'highlightedPeriods'])
const summary = () => ({
  count: props.userCourses.length,
  units: props.userCourses.reduce((total, uc) => total + uc.course.unit, 0),
});
/* TODO: use correct way */
</script>
<template>
<div class="h-dvh w-full box-border relative">
  <div>
    2024-25 Term 1, {{ summary().count }} courses, {{ summary().units }} units
  </div>
  <div class="w-full flex table border-collapse">
    <div class="table-row">
      <div
        v-for="day in ['', 'M', 'T', 'W', 'H', 'F', 'S']"
        class="table-cell border border-gray-400 border-dashed align-middle text-center text-sm">
        {{ day }}
      </div>
    </div>
    <div class="table-row" v-for="period in 15">
      <div class="table-cell border border-gray-400 border-dashed w-8 align-middle text-center">
        <span class="text-sm">{{ period }}</span><br>
        <span class="text-xs text-gray-500">{{ period + 7 }}:30</span>
      </div>
      <div
        v-for="day in ['M', 'T', 'W', 'H', 'F', 'S']"
        class="table-cell border border-gray-400 border-dashed w-15/100"
        :style="props.highlightedPeriods.includes(`${day}${period}`) ? { /* 'border': '2px outset gray' */ 'box-shadow': '0 0 3px 3px orange' } : {}">
      </div>
    </div>
  </div>
</div>
</template>
