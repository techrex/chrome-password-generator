<template>
  <div class="relative p-4 w-full">
    <!-- 固定高度的上半部分 -->
    <div class="space-y-4">
      <h1 class="text-xl font-bold">高强度随机密码生成器</h1>

      <div class="space-y-4">
        <div class="grid gap-2">
          <label class="text-sm font-medium">密码长度</label>
          <input
            type="number"
            v-model="length"
            min="1"
            max="64"
            class="w-full px-3 py-2 border rounded-md max-w-full"
          />
        </div>

        <div class="grid gap-2">
          <label class="text-sm font-medium">生成数量</label>
          <input
            type="number"
            v-model="count"
            min="1"
            max="10"
            class="w-full px-3 py-2 border rounded-md max-w-full"
          />
        </div>

        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            id="uppercase"
            v-model="includeUpperCase"
            class="w-4 h-4"
          />
          <label for="uppercase" class="text-sm font-medium">包含大写字母</label>
        </div>

        <div class="grid gap-2">
          <label class="text-sm font-medium">特殊字符</label>
          <input
            type="text"
            v-model="specialChars"
            placeholder="例如: !@#$%^&*"
            class="w-full px-3 py-2 border rounded-md max-w-full"
          />
        </div>

        <div class="grid gap-2">
          <label class="text-sm font-medium">需要排除的字符</label>
          <input
            type="text"
            v-model="excludeChars"
            placeholder="例如: iIl1o0O"
            class="w-full px-3 py-2 border rounded-md max-w-full"
          />
        </div>

        <button
          @click="generatePassword"
          class="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 max-w-full"
        >
          生成密码
        </button>
      </div>
    </div>

    <!-- 错误信息显示 -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform -translate-y-4 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-4 opacity-0"
    >
      <div v-if="error"
           class="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
        {{ error }}
      </div>
    </Transition>

    <!-- 密码列表 -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform -translate-y-4 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-4 opacity-0"
    >
      <div v-if="passwords.length"
           ref="passwordListRef"
           class="mt-4 rounded-md border border-gray-200">
        <div v-for="(password, index) in passwords"
             :key="index"
             class="group p-3 bg-gray-50 border-b last:border-b-0 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
             @click="copyToClipboard(password, index)">
          <div class="flex justify-between items-center">
            <span class="font-mono select-all">{{ password }}</span>
            <span class="flex items-center space-x-1 text-blue-600 group-hover:text-blue-700 px-2 py-1">
              <span>{{ isCopied === index ? '已复制' : '点击复制' }}</span>
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { generatePasswords, PasswordGeneratorError } from '../utils/passwordGenerator'

const length = ref(16)
const count = ref(8)
const includeUpperCase = ref(true)
const specialChars = ref('!@#$%^&*')
const excludeChars = ref('iIl1o0O')
const passwords = ref<string[]>([])
const error = ref('')
const isCopied = ref<number | null>(null)
const passwordListRef = ref<HTMLElement | null>(null)

const generatePassword = async () => {
  try {
    // 输入验证
    if (length.value < 8) {
      error.value = '密码长度必须大于8'
      return
    }
    if (count.value < 1) {
      error.value = '生成数量必须大于1'
      return
    }

    error.value = ''
    passwords.value = generatePasswords({
      length: length.value,
      count: count.value,
      specialChars: specialChars.value || null,
      includeUpperCase: includeUpperCase.value,
      excludeChars: excludeChars.value || null
    })

    // 等待 DOM 更新后滚动到密码列表
    await nextTick()
    if (passwordListRef.value) {
      passwordListRef.value.scrollIntoView({ behavior: 'smooth' })
    }
  } catch (err) {
    error.value = err instanceof PasswordGeneratorError ? err.message : '生成密码时发生错误'
  }
}

const copyToClipboard = async (password: string, index: number) => {
  try {
    await navigator.clipboard.writeText(password)
    isCopied.value = index
    setTimeout(() => {
      if (isCopied.value === index) {
        isCopied.value = null
      }
    }, 2000)
  } catch (err) {
    error.value = '复制到剪贴板失败'
  }
}
</script>
