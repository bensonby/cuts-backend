<script setup>
const props = defineProps([
  'courses',
  'highlightCourse',
  'addCourse',
  'removeCourse',
  'userCourses',
])
import CourseRow from './CourseRow.vue';
</script>
<template>
<div class="h-dvh overflow-y-scroll overflow-x-hidden box-border">
  <table id="search-results" class="w-1/1 max-w-1/1 table-auto text-xs">
    <thead>
      <tr>
        <th class="p-1 text-left">Code</th>
        <th class="p-1 text-left">Name</th>
        <th class="p-1">Unit</th>
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
      />
    </tbody>
  </table>
</div>
</template>
