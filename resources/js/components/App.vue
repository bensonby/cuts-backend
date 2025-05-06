<script setup>
import { inject, ref } from 'vue';
import SearchPanel from './SearchPanel.vue';
import SearchResults from './SearchResults.vue';
import TimetableGrid from './TimetableGrid.vue';
import * as ColorUtils from '../util/color';
const axios = inject('axios');
const courses = ref([]);
const highlightedPeriods = ref([]);
const userCourses = ref([]);

const searchSubject = (subject) => {
  axios.get(`/api/courses/2024/1/${subject}`).then(response => {
    courses.value = response.data;
  });
};

const highlightCourse = (course) => {
  if (!course) {
    highlightedPeriods.value = [];
    return ;
  }
  const periods = [];
  for (const period of course.periods) {
    if (period.day == 'Z') {
      continue;
    }
    for (let p = period.start; p <= period.end; p++) {
      periods.push(period.day + p);
    }
  }
  highlightedPeriods.value = periods;
};

const addCourse = (course) => {
  const color = ColorUtils.randomColor(userCourses.value, course);
  userCourses.value = [
    ...userCourses.value,
    {
      color: color,
      course: course,
      userPeriods: course.periods.map(p => ({
        period: p,
        necessity: true,
      })),
    },
  ];
};
const removeCourse = (course) => {
  userCourses.value = userCourses.value.filter(uc => uc.course.id != course.id);
};

const editPeriodNecessity = (courseId, periodId, necessity) => {
  userCourses.value = userCourses.value.map((uc) => {
    if (uc.course.id != courseId) return uc;
    return {
      ...uc,
      userPeriods: uc.userPeriods.map((up) => {
        if (up.period.id != periodId) return up;
        return {
          ...up,
          necessity,
        };
      }),
    };
  });
};
</script>
 
<template>
  <div class="grid grid-cols-[5%_30%_60%] h-dvh items-start">
    <SearchPanel :searchSubject="searchSubject" />
    <SearchResults
      :courses="courses"
      :highlightCourse="highlightCourse"
      :addCourse="addCourse"
      :removeCourse="removeCourse"
      :userCourses="userCourses"
    />
    <TimetableGrid
      :userCourses="userCourses"
      :highlightedPeriods="highlightedPeriods"
      :editPeriodNecessity="editPeriodNecessity"
    />
  </div>
</template>
