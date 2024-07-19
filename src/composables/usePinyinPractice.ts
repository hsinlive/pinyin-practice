import { ref, computed, onMounted, watch } from "vue";
import articles from "../data/articles";

export function usePinyinPractice() {
  const currentArticle = ref("");
  const currentIndex = ref(0);
  const pinyinData = ref({});
  const hintEnabled = ref(true);
  const inputValue = ref("");
  const inputPlaceholder = ref("請輸入拼音，按 Enter 確認");
  const inputBorderColor = ref("border-blue-300");
  const showPinyin = ref(false);
  const isSmallScreen = ref(false);
  let hintTimer = null;

  const articleLines = computed(() => {
    const charsPerLine = isSmallScreen.value ? 4 : 8;
    return (
      currentArticle.value.match(new RegExp(`.{1,${charsPerLine}}`, "g")) || []
    );
  });

  const getRandomArticle = () => {
    return articles[Math.floor(Math.random() * articles.length)];
  };

  const isPunctuation = (char) => {
    return /[，。、？！：；（）《》「」『』【】—…・]/u.test(char);
  };

  const moveToNextChar = () => {
    do {
      currentIndex.value++;
    } while (
      currentIndex.value < currentArticle.value.length &&
      isPunctuation(currentArticle.value[currentIndex.value])
    );
  };

  const updateDisplay = () => {
    if (currentIndex.value >= currentArticle.value.length) {
      nextArticle();
      return;
    }

    inputValue.value = "";
    inputPlaceholder.value = "請輸入拼音，按 Enter 確認";
    showPinyin.value = false;

    if (isPunctuation(currentArticle.value[currentIndex.value])) {
      moveToNextChar();
    }

    resetHintTimer();
  };

  const resetHintTimer = () => {
    if (hintTimer) {
      clearTimeout(hintTimer);
    }
    showPinyin.value = false;
    if (hintEnabled.value) {
      hintTimer = setTimeout(() => {
        showPinyin.value = true;
      }, 1000);
    }
  };

  const removeTone = (pinyin) => {
    return pinyin.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const checkInput = () => {
    const targetChar = currentArticle.value[currentIndex.value];
    const correctPinyins = pinyinData.value[targetChar];

    if (!correctPinyins) {
      console.error("找不到對應的拼音數據");
      alert("無法驗證拼音，請跳過此字符。");
      moveToNextChar();
      updateDisplay();
      return;
    }

    if (inputValue.value === "") {
      showAnswer(correctPinyins);
      return;
    }

    const inputPinyinWithoutTone = removeTone(
      inputValue.value.trim().toLowerCase(),
    );
    const isCorrect = correctPinyins.some(
      (p) => removeTone(p) === inputPinyinWithoutTone,
    );

    if (isCorrect) {
      inputBorderColor.value = "border-green-500";
      setTimeout(() => {
        moveToNextChar();
        updateDisplay();
      }, 500);
    } else {
      showAnswer(correctPinyins);
    }
  };

  const showAnswer = (correctPinyins) => {
    inputBorderColor.value = "border-red-500";
    inputValue.value = correctPinyins.join(", ");
    showPinyin.value = true;

    setTimeout(() => {
      inputBorderColor.value = "border-blue-300";
      inputValue.value = "";
      inputPlaceholder.value = "請再次嘗試輸入拼音";
    }, 2000);
  };

  const handleInput = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      checkInput();
    } else {
      showPinyin.value = false;
      resetHintTimer();
    }
  };

  const toggleHint = () => {
    hintEnabled.value = !hintEnabled.value;
    if (!hintEnabled.value) {
      showPinyin.value = false;
      if (hintTimer) {
        clearTimeout(hintTimer);
      }
    } else {
      resetHintTimer();
    }
  };

  const shouldShowPinyin = (index) => {
    if (index === currentIndex.value) {
      return showPinyin.value;
    } else if (index < currentIndex.value) {
      return hintEnabled.value;
    } else {
      return false;
    }
  };

  const getCharClass = (index) => {
    if (index < currentIndex.value) return "text-green-500";
    if (index === currentIndex.value) return "highlight-char";
    return "";
  };

  const getPinyin = (char) => {
    return pinyinData.value[char] ? pinyinData.value[char][0] : "";
  };

  const nextArticle = () => {
    currentArticle.value = getRandomArticle();
    currentIndex.value = 0;
    updateDisplay();
  };

  const fetchPinyinData = async () => {
    try {
      const response = await fetch(
        "https://api.github.com/repos/mozillazg/pinyin-data/contents/pinyin.txt",
      );
      const data = await response.json();
      const content = atob(data.content);
      pinyinData.value = parsePinyinData(content);
      console.log("拼音數據已成功加載");
      nextArticle();
    } catch (error) {
      console.error("無法獲取拼音數據:", error);
      alert("無法獲取拼音數據，請刷新頁面重試。");
    }
  };

  const parsePinyinData = (rawContent) => {
    const utf8Decoder = new TextDecoder("utf-8");
    const decodedContent = utf8Decoder.decode(
      new Uint8Array(rawContent.split("").map((c) => c.charCodeAt(0))),
    );
    const lines = decodedContent.split("\n");
    return lines.reduce((data, line) => {
      if (line.startsWith("U+") && line.includes(":")) {
        const [codePoint, rest] = line.split(":");
        const [pinyins] = rest.split("#").map((s) => s.trim());
        const char = String.fromCodePoint(parseInt(codePoint.slice(2), 16));
        data[char] = pinyins.split(",").map((p) => p.trim());
      }
      return data;
    }, {});
  };

  onMounted(() => {
    isSmallScreen.value = window.innerWidth < 640;
    fetchPinyinData();
    window.addEventListener("resize", () => {
      isSmallScreen.value = window.innerWidth < 640;
    });
  });

  watch([currentArticle, currentIndex], () => {
    updateDisplay();
  });

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
    isSmallScreen,
    checkInput,
  };
}
