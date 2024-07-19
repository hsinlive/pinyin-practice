<template>
    <div class="flex flex-col h-screen bg-gray-100 p-2">
        <h1 class="text-xl font-bold text-center text-gray-800 mb-6">繁體拼音輸入練習</h1>

        <div class="flex-shrink-0 flex items-center justify-center mb-6 w-full">
            <div class="bg-white p-4 rounded-lg shadow-md text-center w-full">
                <div class="flex justify-center py-4 items-center space-x-2 w-full">
                    <span v-for="(char, index) in displayChars" :key="index" class="text-3xl relative"
                        :class="getCharClass(currentIndex + index - 3)">
                        {{ char }}
                        <span
                            class="absolute left-1/2 transform -translate-x-1/2 -top-6 text-xs text-gray-600 transition-opacity duration-300 whitespace-nowrap"
                            :class="{ 'opacity-100': shouldShowPinyin(currentIndex + index - 3), 'opacity-0': !shouldShowPinyin(currentIndex + index - 3) }">
                            {{ getPinyin(char) }}
                        </span>
                    </span>
                </div>
            </div>
        </div>

        <div class="flex-shrink-0 mb-4 relative">
            <input v-model="inputValue" @keydown="handleInput" type="text"
                class="w-full text-lg p-4 pr-20 border rounded-lg focus:outline-none transition-colors duration-300"
                :class="[inputBorderColor]" :placeholder="inputPlaceholder" />
            <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                {{ currentIndex + 1 }}/{{ currentArticle?.length || 0 }}
            </span>
        </div>

        <div class="flex-shrink-0 flex items-center justify-between mb-4 space-x-2">
            <div class="flex items-center">
                <span class="mr-2 text-sm text-gray-600">提示</span>
                <button @click="toggleHint"
                    class="relative w-12 h-6 rounded-full focus:outline-none transition-colors duration-300"
                    :class="hintEnabled ? 'bg-green-500' : 'bg-gray-300'">
                    <span
                        class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transform transition-transform duration-300 ease-in-out"
                        :class="hintEnabled ? 'translate-x-6' : 'translate-x-0'"></span>
                </button>
            </div>
            <button @click="nextArticle"
                class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 focus:outline-none text-sm">
                下一篇文章
            </button>
        </div>

        <p class="text-xs text-gray-600 text-center">提示：輸入錯誤時會顯示正確答案</p>
    </div>
</template>

<style scoped>
.highlight-char {
    @apply bg-yellow-200 rounded-lg transition-all duration-300 ease-in-out;
    box-shadow: 0 0 10px rgba(255, 193, 7, 0.5);
}
</style>

<script setup>
import { computed } from 'vue'
import { usePinyinPractice } from '../composables/usePinyinPractice'

const {
    currentArticle,
    currentIndex,
    hintEnabled,
    inputValue,
    toggleHint,
    getPinyin,
    nextArticle,
    inputBorderColor,
    inputPlaceholder,
    handleInput,
    getCharClass,
    shouldShowPinyin
} = usePinyinPractice()

const displayChars = computed(() => {
    const article = currentArticle.value || ''
    const index = currentIndex.value
    const chars = []
    for (let i = 0; i < 7; i++) {
        const charIndex = index + i - 3
        if (charIndex >= 0 && charIndex < article.length) {
            chars.push(article[charIndex])
        } else {
            chars.push('　') // 使用全角空格
        }
    }
    return chars
})
</script>