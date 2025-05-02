<script setup>
const props = defineProps(['searchSubject'])
import { inject, ref, onMounted } from 'vue';
const axios = inject('axios');

const coursecodes = ref({});
const subjects = ref([]);
const selectedLetter = ref('');
const showSubjects = ref(false);

onMounted(() => {
  axios.get('/api/coursecodes/2024/1').then(response => {
    coursecodes.value = response.data;
  });
});

const hideSubjects = () => {
  showSubjects.value = null;
  selectedLetter.value = '';
};

const selectLetter = (letter) => {
  const firstLetters = Object.entries(coursecodes.value).map(x => x[0]);
  const index = firstLetters.indexOf(letter);
  subjects.value = coursecodes.value[letter];
  const subjectLength = Object.keys(subjects.value).length;
  showSubjects.value = true;
  selectedLetter.value = letter;
};

const search = (key) => {
  hideSubjects();
  props.searchSubject(key);
};

</script>
<template>
  <div/>
  <div id="search-panel" class="bg-orange-500 fixed w-1/20">
    <div id="first-letter" class="relative">
      <div class="relative" v-for="(_, letter) in coursecodes">
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 h-1/26 w-full"
          :key="letter"
          @mouseover="selectLetter(letter)">
          {{ letter }}
        </button>
        <div
          id="subjects"
          v-if="selectedLetter == letter"
          @mouseleave="hideSubjects()"
          class="absolute left-full bg-blue-500 top-0 w-60"
        >
          <button
            class="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 text-sm w-20"
            v-for="(__, key) in subjects"
            :key="key"
            @click="search(key)">
            {{ key }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
