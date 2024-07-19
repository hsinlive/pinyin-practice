<template>
  <PinyinPracticeDesktop v-if="!isMobile" />
  <PinyinPracticeMobile v-else />
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import PinyinPracticeDesktop from './PinyinPracticeDesktop.vue'
import PinyinPracticeMobile from './PinyinPracticeMobile.vue'

export default {
  components: {
    PinyinPracticeDesktop,
    PinyinPracticeMobile,
  },
  setup() {
    const isMobile = ref(false)

    const checkMobile = () => {
      isMobile.value = window.innerWidth < 640
    }

    onMounted(() => {
      checkMobile()
      window.addEventListener('resize', checkMobile)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', checkMobile)
    })

    return { isMobile }
  }
}
</script>