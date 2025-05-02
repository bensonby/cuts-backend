<script setup>
const props = defineProps(['highlightedPeriods'])
</script>
<template>
<div class="h-dvh w-full box-border relative">
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
        :class="{ 'border-orange-500 border-solid border-w-2': props.highlightedPeriods.includes(`${day}${period}`) }">
      </div>
    </div>
  </div>
</div>
</template>
