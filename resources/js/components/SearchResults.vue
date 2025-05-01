<script setup>
defineProps(['courses'])
import CourseRow from './CourseRow.vue';
</script>
<template>
  <table id="search-results" class="w-1/1 max-w-1/1 table-auto text-xs m-3">
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
      />
    </tbody>
  </table>
</template>
