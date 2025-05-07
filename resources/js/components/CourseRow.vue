<script setup>
import { toRaw } from 'vue';
const props = defineProps([
  'course',
  'highlightCourse',
  'addCourse',
  'removeCourse',
  'added',
  'hasCollision',
])
const handleMouseover = () => {
  props.highlightCourse(toRaw(props.course));
};
const handleClick = () => {
  if (props.added) {
    props.removeCourse(toRaw(props.course));
  } else {
    props.addCourse(toRaw(props.course));
  }
};
const hasTsa = (course) => {
  return course.periods.filter(p => p.day == 'Z' || p.start == 0).length > 0;
};
</script>
<template>
  <tr
    class="border-b border-gray-400 hover:bg-gray-200"
    :class="{ 'bg-orange-300': added }"
    @mouseover="handleMouseover()"
    @click="handleClick()"
  >
    <td class="p-1 align-top w-25">{{ course.coursecode }}</td>
    <td class="p-1 align-top">{{ course.coursename }}</td>
    <td class="p-1 text-center align-top w-9">{{ course.unit }}</td>
    <td class="py-1 text-center align-top">
      <div
        v-if="hasTsa(course)"
        class="text-[10px] bg-blue-200 p-0.5"
        title="Contains periods with teacher-student arrangement"
      >
        TSA
      </div>
    </td>
    <td class="py-0.5 text-center align-top">
      <div
        v-if="hasCollision"
        class="text-sm text-red-500"
        title="Course clash"
      >⚠</div>
    </td>
    <!--{{ course.coursenamec }}
    {{ course.updated_at }}
    {{ course.periods }}
    {{ course.professors }}
    -->
  </tr>
</template>
