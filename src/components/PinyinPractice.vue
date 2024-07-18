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
import { ref, computed, onMounted, watch } from 'vue'

const articles = [
  "清溪流水潺潺響，山花爛漫映日光。",
  "夕陽西下山河靜，青黛連天雲影生。",
  "湖邊花開映水清，芳草萋萋鳥鳴聲。",
]

export default {
  setup() {
    const currentArticle = ref('')
    const currentIndex = ref(0)
    const pinyinData = ref({})
    const hintEnabled = ref(true)
    const inputValue = ref('')
    const inputPlaceholder = ref('請輸入拼音，按 Enter 確認')
    const inputBorderColor = ref('border-blue-300')
    const showPinyin = ref(false)
    const isSmallScreen = ref(false)
    let hintTimer = null

    const articleLines = computed(() => {
      const charsPerLine = isSmallScreen.value ? 4 : 8
      return currentArticle.value.match(new RegExp(`.{1,${charsPerLine}}`, 'g')) || []
    })

    const getRandomArticle = () => {
      return articles[Math.floor(Math.random() * articles.length)]
    }

    const isPunctuation = (char) => {
      return /[，。、？！：；（）《》「」『』【】—…・]/u.test(char)
    }

    const moveToNextChar = () => {
      do {
        currentIndex.value++
      } while (
        currentIndex.value < currentArticle.value.length &&
        isPunctuation(currentArticle.value[currentIndex.value])
      )
    }

    const updateDisplay = () => {
      if (currentIndex.value >= currentArticle.value.length) {
        nextArticle()
        return
      }

      inputValue.value = ''
      inputPlaceholder.value = '請輸入拼音，按 Enter 確認'
      showPinyin.value = false

      if (isPunctuation(currentArticle.value[currentIndex.value])) {
        moveToNextChar()
      }

      resetHintTimer()
    }

    const resetHintTimer = () => {
      if (hintTimer) {
        clearTimeout(hintTimer)
      }
      showPinyin.value = false
      if (hintEnabled.value) {
        hintTimer = setTimeout(() => {
          showPinyin.value = true
        }, 1000)
      }
    }

    const removeTone = (pinyin) => {
      return pinyin.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    }

    const checkInput = () => {
      const targetChar = currentArticle.value[currentIndex.value]
      const correctPinyins = pinyinData.value[targetChar]

      if (!correctPinyins) {
        console.error("找不到對應的拼音數據")
        alert("無法驗證拼音，請跳過此字符。")
        moveToNextChar()
        updateDisplay()
        return
      }

      if (inputValue.value === "") {
        showAnswer(correctPinyins)
        return
      }

      const inputPinyinWithoutTone = removeTone(inputValue.value.trim().toLowerCase())
      const isCorrect = correctPinyins.some(
        (p) => removeTone(p) === inputPinyinWithoutTone
      )

      if (isCorrect) {
        inputBorderColor.value = 'border-green-500'
        setTimeout(() => {
          moveToNextChar()
          updateDisplay()
        }, 500)
      } else {
        showAnswer(correctPinyins)
      }
    }

    const showAnswer = (correctPinyins) => {
      inputBorderColor.value = 'border-red-500'
      inputValue.value = correctPinyins.join(", ")
      showPinyin.value = true

      setTimeout(() => {
        inputBorderColor.value = 'border-blue-300'
        inputValue.value = ''
        inputPlaceholder.value = '請再次嘗試輸入拼音'
      }, 2000)
    }

    const handleInput = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        checkInput()
      } else {
        showPinyin.value = false
        resetHintTimer()
      }
    }

    const toggleHint = () => {
      hintEnabled.value = !hintEnabled.value
      if (!hintEnabled.value) {
        showPinyin.value = false
        if (hintTimer) {
          clearTimeout(hintTimer)
        }
      } else {
        resetHintTimer()
      }
    }

    const shouldShowPinyin = (index) => {
      if (index === currentIndex.value) {
        return showPinyin.value
      } else if (index < currentIndex.value) {
        return hintEnabled.value
      } else {
        return false
      }
    }

    const getCharClass = (index) => {
      if (index < currentIndex.value) return 'text-green-500'
      if (index === currentIndex.value) return 'highlight-char'
      return ''
    }

    const getPinyin = (char) => {
      return pinyinData.value[char] ? pinyinData.value[char][0] : ''
    }

    const nextArticle = () => {
      currentArticle.value = getRandomArticle()
      currentIndex.value = 0
      updateDisplay()
    }

    const fetchPinyinData = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/repos/mozillazg/pinyin-data/contents/pinyin.txt"
        )
        const data = await response.json()
        const content = atob(data.content)
        pinyinData.value = parsePinyinData(content)
        console.log("拼音數據已成功加載")
        nextArticle()
      } catch (error) {
        console.error("無法獲取拼音數據:", error)
        alert("無法獲取拼音數據，請刷新頁面重試。")
      }
    }

    const parsePinyinData = (rawContent) => {
      const utf8Decoder = new TextDecoder("utf-8")
      const decodedContent = utf8Decoder.decode(
        new Uint8Array(rawContent.split("").map((c) => c.charCodeAt(0)))
      )
      const lines = decodedContent.split("\n")
      return lines.reduce((data, line) => {
        if (line.startsWith("U+") && line.includes(":")) {
          const [codePoint, rest] = line.split(":")
          const [pinyins] = rest.split("#").map((s) => s.trim())
          const char = String.fromCodePoint(parseInt(codePoint.slice(2), 16))
          data[char] = pinyins.split(",").map((p) => p.trim())
        }
        return data
      }, {})
    }

    onMounted(() => {
      isSmallScreen.value = window.innerWidth < 640
      fetchPinyinData()
      window.addEventListener('resize', () => {
        isSmallScreen.value = window.innerWidth < 640
      })
    })

    watch([currentArticle, currentIndex], () => {
      updateDisplay()
    })

    return {
      currentArticle,
      currentIndex,
      inputValue,
      inputPlaceholder,
      inputBorderColor,
      hintEnabled,
      showPinyin,
      handleInput,
      toggleHint,
      getCharClass,
      getPinyin,
      nextArticle,
      shouldShowPinyin,
      articleLines,
      isSmallScreen
    }
  }
}
</script>