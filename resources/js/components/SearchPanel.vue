<script setup>
const props = defineProps(['searchSubject'])
import { inject, ref, onMounted } from 'vue';
const axios = inject('axios');

const coursecodes = ref({});
const subjects = ref([]);
const showSubjects = ref(false);
const subjectStyles = ref({});

onMounted(() => {
  axios.get('/api/coursecodes/2024/1').then(response => {
    coursecodes.value = response.data;
  });
});

const hideSubjects = () => {
  showSubjects.value = false;
};

const selectLetter = (letter) => {
  const firstLetters = Object.entries(coursecodes.value).map(x => x[0]);
  const index = firstLetters.indexOf(letter);
  subjects.value = coursecodes.value[letter];
  subjectStyles.value = {
    top: index == 0 ? 0 : (index == firstLetters.length - 1 ? null : ((index / firstLetters.length) * 100 - 3) + '%'),
    bottom: index == firstLetters.length - 1 ? 0 : null,
  };
  showSubjects.value = true;
};

const search = (key) => {
  showSubjects.value = false;
  props.searchSubject(key);
};

</script>
<template>
  <div/>
  <div
    id="subjects"
    v-if="showSubjects"
    @mouseleave="hideSubjects()"
    class="absolute left-1/20 w-100 bg-blue-500 min-h-1/10 align-middle px-2"
    :style="subjectStyles"
  >
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white py-2 w-1/7 text-sm"
      v-for="(_, key) in subjects"
      :key="key"
      @click="search(key)">
      {{ key }}
    </button>
  </div>
  <div id="search-panel" class="bg-orange-500 h-full fixed w-1/20">
    <div id="first-letter" class="relative flex flex-col h-full">
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 flex-1 grow"
        v-for="(_, key) in coursecodes"
        :key="key"
        @mouseover="selectLetter(key)">
        {{ key }}
      </button>
    </div>
  </div>
</template>
