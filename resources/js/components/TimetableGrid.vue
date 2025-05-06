<script setup>
import { ref } from 'vue';
import * as ColorUtils from '../util/color';
const props = defineProps([
  'userCourses',
  'highlightedPeriods',
  'editPeriodNecessity',
])
const summary = () => ({
  count: props.userCourses.length,
  units: props.userCourses.reduce((total, uc) => total + uc.course.unit, 0),
});
/* TODO: use correct way */
const showPeriodInfo = ref({
  courseId: null,
  day: null,
  period: null,
});
const handleMouseoverPeriod = (userCourse, day, period) => {
  showPeriodInfo.value = {
    courseId: userCourse.course.id,
    day: day,
    period: period,
  };
};
const handleMouseleavePeriod = () => {
  showPeriodInfo.value = {
    courseId: null,
    day: null,
    period: null,
  };
};
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
        class="relative table-cell border border-gray-400 border-dashed w-15/100 align-middle"
        :style="props.highlightedPeriods.includes(`${day}${period}`) ? { 'box-shadow': '0 0 3px 3px orange' } : {}">
        <div
          v-if="userCourses.filter(uc => uc.course.periods.filter(p => p.day == day && p.start <= period && p.end >= period).length > 0).length == 0"
          class="flex absolute top-0 bottom-0 left-0 right-0 opacity-30 justify-center items-center"
        >
          {{ day }}{{ period }}
        </div>
        <template v-for="uc in userCourses">
          <div
            @mouseover="handleMouseoverPeriod(uc, day, period)"
            @mouseleave="handleMouseleavePeriod()"
            v-if="uc.course.periods.filter(p => p.day == day && p.start <= period && p.end >= period).length > 0"
            class="relative mx-2 my-1 py-0.5 text-xs text-center"
            :class="{ 'line-through': uc.userPeriods.filter(up => up.period.day == day && up.period.start <= period && up.period.end >= period && up.necessity).length == 0 }"
            :style="{
              'background-color': '#' + uc.color,
              'color': '#' + ColorUtils.fgFromBg(uc.color),
            }"
          >
            {{ uc.course.coursecode }}
            <div
              v-if="showPeriodInfo['courseId'] == uc.course.id && showPeriodInfo['day'] == day && showPeriodInfo['period'] == period"
              class="absolute z-10 border-2 bg-white text-black top-4.5 w-80 px-2 pt-1 pb-2 text-left"
              :class="{
                'left-0.25': !['H', 'F', 'S'].includes(day),
                'right-0.25': ['H', 'F', 'S'].includes(day),
              }"
              :style="{
                'box-shadow': `0 0 2px 2px #${uc.color}`,
                'border-color': '#' + uc.color,
                'background-color': '#' + ColorUtils.arrayToRgb(ColorUtils.hslToRgb(
                    ColorUtils.rgbToHsl(uc.color)[0],
                    ColorUtils.rgbToHsl(uc.color)[1],
                    ColorUtils.rgbToHsl(uc.color)[2] / 4 + 0.75,
                )),
              }"
            >
              <p class="text-sm">{{ uc.course.coursecode }}</p>
              <p class="text-xs">{{ uc.course.coursename }}</p>
              <p class="mb-2">{{ uc.course.coursenamec }}</p>
              <div class="max-h-50 overflow-y-auto">
                <div v-for="up in uc.userPeriods" class="my-1">
                  <input
                    type="checkbox"
                    class="inline-block align-top mr-1 h-3.5"
                    :checked="up.necessity"
                    @input="evt => editPeriodNecessity(uc.course.id, up.period.id, evt.target.checked)"
                  />
                  <p class="inline-block mt-0 text-xs/3.5">
                  {{ up.period.day }}{{ up.period.start }}{{ up.period.end != up.period.start ? '-' + up.period.end : '' }}
                  @ {{ up.period.venue }} ({{ up.period.type }})<br>
                  <span class="text-gray-500">
                    Quota: {{ up.period.quota }}, {{ up.period.lang }}
                  </span>
                  </p>
                </div>
              </div>
              <p class="mt-2 whitespace-pre">{{ uc.course.professors.map(p => p.name).join('\n') }}</p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</div>
</template>
