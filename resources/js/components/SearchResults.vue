<script setup>
const props = defineProps(['courses', 'highlightCourse'])
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
    <tbody>
      <CourseRow
        v-for="course in courses"
        :key="course.id"
        :course="course"
        :highlightCourse="highlightCourse"
      />
    </tbody>
  </table>
</div>
</template>
