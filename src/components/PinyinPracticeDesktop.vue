<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100 p-2 sm:p-5">
    <div class="bg-white p-4 sm:p-8 rounded-lg shadow-md w-full max-w-md sm:max-w-4xl">
      <h1 class="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6 sm:mb-8">繁體拼音輸入練習</h1>

      <div class="mb-6 sm:mb-8 bg-gray-50 py-10 px-3 sm:px-8 rounded-lg shadow-inner">
        <div class="flex flex-col items-center space-y-6 sm:space-y-8">
          <div v-for="(line, lineIndex) in articleLines" :key="lineIndex" class="flex justify-center flex-wrap">
            <div v-for="(char, charIndex) in line" :key="charIndex"
              class="inline-block text-center mx-1 sm:mx-1.5 w-16 sm:w-20 relative mb-8 sm:mb-0"
              :class="getCharClass(lineIndex * (isSmallScreen ? 4 : 8) + charIndex)">
              <span
                class="absolute left-1/2 transform -translate-x-1/2 -top-6 text-base sm:text-sm text-gray-600 transition-opacity duration-300 whitespace-nowrap"
                :class="{ 'opacity-100': shouldShowPinyin(lineIndex * (isSmallScreen ? 3 : 8) + charIndex), 'opacity-0': !shouldShowPinyin(lineIndex * (isSmallScreen ? 3 : 8) + charIndex) }">
                {{ getPinyin(char) }}
              </span>
              <span class="text-4xl sm:text-3xl">{{ char }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
        <div class="flex items-center justify-between sm:justify-start sm:w-auto">
          <span class="mr-2 text-base sm:text-sm text-gray-600">提示</span>
          <button @click="toggleHint"
            class="relative w-14 h-7 sm:w-12 sm:h-6 rounded-full focus:outline-none transition-colors duration-300"
            :class="hintEnabled ? 'bg-green-500' : 'bg-gray-300'">
            <span
              class="absolute left-1 top-1 w-5 h-5 sm:w-4 sm:h-4 bg-white rounded-full transform transition-transform duration-300 ease-in-out"
              :class="hintEnabled ? 'translate-x-7 sm:translate-x-6' : 'translate-x-0'"></span>
          </button>
        </div>

        <div class="flex-grow relative">
          <input v-model="inputValue" @keydown="handleInput" type="text"
            class="w-full text-lg p-4 pr-20 border rounded-lg focus:outline-none transition-colors duration-300"
            :class="[inputBorderColor]" :placeholder="inputPlaceholder" />
          <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
            {{ currentIndex }}/{{ currentArticle.length }}
          </span>
        </div>

        <button @click="nextArticle"
          class="w-full sm:w-auto bg-blue-500 text-white px-4 py-4 sm:py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300 focus:outline-none">
          下一篇文章
        </button>
      </div>

      <p class="text-sm text-gray-600 text-center">提示：輸入錯誤時會顯示正確答案</p>
    </div>
  </div>
</template>

<style scoped>
.highlight-char {
  @apply bg-yellow-200 rounded-lg transition-all duration-300 ease-in-out;
  box-shadow: 0 0 10px rgba(255, 193, 7, 0.5);
}
</style>

<script>
import { usePinyinPractice } from '../composables/usePinyinPractice'

export default {
  setup() {
    return usePinyinPractice()
  }
}
</script>