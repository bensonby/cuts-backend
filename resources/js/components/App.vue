<script setup>
import { inject, ref } from 'vue';
import SearchPanel from './SearchPanel.vue';
import SearchResults from './SearchResults.vue';
const axios = inject('axios');
const courses = ref([]);

const searchSubject = (subject) => {
  axios.get(`/api/courses/2024/1/${subject}`).then(response => {
    courses.value = response.data;
  });
};
</script>
 
<template>
  <div class="grid grid-cols-[5%_30%_50%] h-dvh items-start">
    <SearchPanel :searchSubject="searchSubject" />
    <SearchResults :courses="courses" />
    <div>
    </div>
  </div>
</template>
