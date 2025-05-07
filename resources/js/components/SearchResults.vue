<script setup>
const props = defineProps([
  'courses',
  'highlightCourse',
  'addCourse',
  'removeCourse',
  'userCourses',
])
import CourseRow from './CourseRow.vue';

const checkCollision = (userCourses, course) => {
  if (userCourses.map(uc => uc.course.id).includes(course.id)) return false;
  return userCourses.filter((uc) => {
    return uc.userPeriods.filter((up) => {
      if (!up.necessity) return false;
      return course.periods.filter((p) => {
        return p.day == up.period.day && p.end >= up.period.start && p.start <= up.period.end;
      }).length > 0;
    }).length > 0;
  }).length > 0;
};
</script>
<template>
<div id="search-results" class="h-dvh overflow-y-scroll overflow-x-hidden box-border px-2">
  <table id="search-results" class="w-1/1 max-w-1/1 table-auto text-xs">
    <thead>
      <tr>
        <th class="p-1 text-left">Code</th>
        <th class="p-1 text-left">Name</th>
        <th class="p-1">Unit</th>
        <th class="w-7"></th>
        <th class="w-5"></th>
      </tr>
    </thead>
    <tbody @mouseleave="highlightCourse(null)">
      <CourseRow
        v-for="course in courses"
        :key="course.id"
        :course="course"
        :highlightCourse="highlightCourse"
        :addCourse="addCourse"
        :removeCourse="removeCourse"
        :added="userCourses.map(uc => uc.course.id).includes(course.id)"
        :hasCollision="checkCollision(props.userCourses, course)"
      />
    </tbody>
  </table>
</div>
</template>
