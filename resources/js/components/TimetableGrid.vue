<script setup>
import * as ColorUtils from '../util/color';
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
    <div
      v-for="period in 15"
      class="table-row"
      :class="{ 'bg-gray-200': period >= 11 }"
    >
      <div class="table-cell border border-gray-400 border-dashed w-8 align-middle text-center">
        <div class="text-sm">{{ period }}</div>
        <div class="text-xs text-gray-500">{{ period + 7 }}:30</div>
      </div>
      <div
        v-for="day in ['M', 'T', 'W', 'H', 'F', 'S']"
        class="table-cell border border-gray-400 border-dashed w-15/100"
        :style="props.highlightedPeriods.includes(`${day}${period}`) ? { /* 'border': '2px outset gray' */ 'box-shadow': '0 0 3px 3px orange' } : {}">
        <template v-for="uc in userCourses">
          <div
              v-if="uc.course.periods.filter(p => p.day == day && p.start <= period && p.end >= period).length > 0"
            :style="{
              'background-color': '#' + uc.color,
              'color': '#' + ColorUtils.fgFromBg(uc.color),
              'opacity': uc.course.coursecode.substr(4, 1) == '1' ? 0.3 : 1,
            }"
            class="mx-2 my-1 py-0.5 text-xs text-center"
          >
            {{ uc.course.coursecode }}
          </div>
        </template>
      </div>
    </div>
  </div>
</div>
</template>
