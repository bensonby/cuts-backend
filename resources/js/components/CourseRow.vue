<script setup>
defineProps(['course'])
</script>
<template>
  <tr class="border-b border-gray-400">
    <td class="p-1 align-top w-25">{{ course.coursecode }}</td>
    <td class="p-1 align-top">{{ course.coursename }}</td>
    <td class="p-1 text-center align-top w-9">{{ course.unit }}</td>
    <!--{{ course.coursenamec }}
    {{ course.updated_at }}
    {{ course.periods }}
    {{ course.professors }}
    -->
  </tr>
</template>
