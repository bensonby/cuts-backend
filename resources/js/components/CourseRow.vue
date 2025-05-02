<script setup>
import { toRaw } from 'vue';
const props = defineProps(['course', 'highlightCourse'])
const handleMouseover = () => {
  props.highlightCourse(toRaw(props.course));
};
</script>
<template>
  <tr class="border-b border-gray-400" @mouseover="handleMouseover()">
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
