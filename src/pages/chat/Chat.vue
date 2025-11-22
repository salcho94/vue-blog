<!-- src/components/chat/HideChat.vue -->
<template>
  <div
      class="flex flex-col min-h-screen sm:min-h-[500px] max-h-screen
           rounded-xl border border-slate-200 dark:border-slate-800
           bg-white dark:bg-slate-950 shadow-sm overflow-hidden"
  >
    <!-- Header -->
    <header class="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 border-b border-slate-200 dark:border-slate-800">
      <div class="flex items-center justify-between px-3 py-2">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-700 dark:text-slate-200">
            Σ
          </div>
          <div>
            <h1 class="text-sm font-semibold">
              데이터 분석 시트 - Sheet1.xlsx
            </h1>
            <p class="text-[10px] text-slate-500 dark:text-slate-400">
              Room #{{ ROOM_ID }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- 폰트 크기 -->
          <div class="hidden md:flex items-center text-[11px] bg-slate-100 dark:bg-slate-800 rounded-md px-1.5 py-0.5 border border-slate-200 dark:border-slate-700">
            <button
                @click="decreaseFontSize"
                type="button"
                class="px-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              A-
            </button>
            <span class="px-1 tabular-nums text-slate-700 dark:text-slate-200">
              {{ fontSize }}
            </span>
            <button
                @click="increaseFontSize"
                type="button"
                class="px-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              A+
            </button>
          </div>

          <!-- 연결 상태 / 닉네임 -->
          <div class="flex flex-col items-end text-[10px]">
            <div class="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <span
                  class="w-2 h-2 rounded-full"
                  :class="isConnected ? 'bg-emerald-500' : 'bg-red-400'"
              />
              <span>
                {{ isConnected ? '연결됨' : '연결 끊김' }}
              </span>
            </div>
            <div class="flex items-center gap-1 text-slate-500 dark:text-slate-300 mt-0.5">
              <span>닉네임</span>
              <span class="font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                {{ localNickName }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 탭 (PostsPage 느낌에 맞춘 심플 탭) -->
      <div
          class="bg-slate-100 dark:bg-slate-900 text-[11px] flex items-center px-2 py-1
               border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
      >
        <span class="mr-3 font-semibold text-slate-900 dark:text-slate-50">홈</span>
        <span class="mr-3">삽입</span>
        <span class="mr-3">페이지 레이아웃</span>
        <span class="mr-3">수식</span>
        <span>데이터</span>
      </div>
    </header>

    <!-- 메시지 영역 -->
    <div class="flex-1 bg-white dark:bg-slate-950">
      <!-- 컬럼 헤더 -->
      <div
          class="bg-slate-50 dark:bg-slate-900 grid grid-cols-6 text-slate-700 dark:text-slate-200 text-xs
               border-b border-slate-200 dark:border-slate-800"
      >
        <div class="px-2 py-1 font-medium border-r border-slate-200 dark:border-slate-800">시간</div>
        <div class="px-2 py-1 font-medium border-r border-slate-200 dark:border-slate-800">사용자</div>
        <div class="px-2 py-1 font-medium col-span-4">데이터</div>
      </div>

      <!-- 메시지 리스트 -->
      <div class="h-full overflow-y-auto">
        <div
            v-for="(msg, index) in messages"
            :key="`${msg.sender}-${msg.timestamp?.toString?.() || index}-${index}`"
            class="grid grid-cols-6 border-b border-slate-100 dark:border-slate-800 text-xs"
            :style="{ fontSize: fontSize + 'px' }"
        >
          <!-- 시간 -->
          <div class="px-2 py-1 border-r border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            {{ formatTime(msg.timestamp) }}
          </div>

          <!-- 사용자 -->
          <div
              class="px-2 py-1 border-r border-slate-100 dark:border-slate-800 font-semibold flex items-center gap-1"
          >
            <span v-if="msg.type === 'system'" class="text-blue-500">System</span>
            <span v-else class="text-slate-800 dark:text-slate-100">
              {{ msg.sender }}
            </span>
            <span
                v-if="msg.sender === localNickName && msg.type !== 'system'"
                class="text-[10px] text-emerald-600 dark:text-emerald-400"
            >
              (나)
            </span>
          </div>

          <!-- 본문 + 첨부 -->
          <div class="px-2 py-1 col-span-4 whitespace-pre-wrap break-words text-slate-800 dark:text-slate-100">
            <div v-if="msg.text">{{ msg.text }}</div>

            <div
                v-if="msg.attachments && msg.attachments.length"
                class="mt-1 flex flex-wrap gap-2"
            >
              <div
                  v-for="(att, i) in msg.attachments"
                  :key="i"
                  class="border border-slate-200 dark:border-slate-700 rounded-lg p-1 bg-slate-50 dark:bg-slate-900"
              >
                <img
                    v-if="att.type === 'image'"
                    :src="att.url || att.preview"
                    :alt="att.name"
                    class="w-20 h-20 object-cover rounded-md"
                />
                <a
                    v-else
                    :href="att.url"
                    target="_blank"
                    rel="noreferrer"
                    class="text-blue-500 underline text-[11px]"
                >
                  {{ att.name }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div ref="messagesEndRef" />
      </div>
    </div>

    <!-- 첨부 미리보기 -->
    <div
        v-if="attachments.length"
        class="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-2"
    >
      <div class="flex flex-wrap gap-2">
        <div
            v-for="(att, index) in attachments"
            :key="`${att.name}-${index}`"
            class="relative group"
        >
          <div v-if="att.type === 'image'" class="relative">
            <img
                :src="att.preview"
                :alt="att.name"
                class="w-16 h-16 object-cover rounded border border-slate-200 dark:border-slate-700"
            />
            <button
                @click="removeAttachment(index)"
                type="button"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1
                     opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
            >
              ✕
            </button>
          </div>
          <div
              v-else
              class="relative bg-white dark:bg-slate-950 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700
                   max-w-[140px] flex items-center gap-1"
          >
            <span class="text-xs">📎</span>
            <span class="text-[11px] truncate text-slate-800 dark:text-slate-100">{{ att.name }}</span>
            <button
                @click="removeAttachment(index)"
                type="button"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1
                     opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 타이핑 표시 -->
    <div
        v-if="typingLabel"
        class="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900
             px-2 py-1 border-t border-slate-200 dark:border-slate-800"
    >
      {{ typingLabel }}
    </div>

    <!-- 입력 영역 -->
    <div class="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2">
      <div class="flex items-end gap-2">
        <button
            class="text-xl"
            type="button"
            @click="handleEmojiSelect('😊')"
        >
          😊
        </button>

        <button
            class="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors text-xl"
            type="button"
            @click="fileInputRef?.click()"
        >
          📎
        </button>
        <input
            ref="fileInputRef"
            type="file"
            multiple
            class="hidden"
            @change="handleFileSelect"
        />
        <input
            ref="captureInputRef"
            type="file"
            accept="image/*"
            capture="user"
            class="hidden"
            @change="handleFileSelect"
        />

        <textarea
            ref="inputRef"
            v-model="input"
            class="flex-1 border rounded-lg px-2 py-1 text-sm leading-relaxed
                 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent
                 transition-all resize-none max-h-24
                 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100
                 border-slate-200 dark:border-slate-700"
            placeholder="메시지 입력... (Enter: 전송, Shift+Enter: 줄바꿈, Ctrl+V: 이미지 붙여넣기)"
            rows="1"
            @input="onInput"
            @keydown="handleKeyDown"
            @compositionstart="handleCompositionStart"
            @compositionend="handleCompositionEnd"
            @paste="handlePaste"
        />

        <button
            class="bg-slate-900 dark:bg-slate-100 hover:bg-black dark:hover:bg-white
                 text-white dark:text-slate-900 rounded-lg px-3 py-1 text-sm
                 transition-colors border border-slate-900 dark:border-slate-100"
            type="button"
            @click="sendMessage"
        >
          ➤
        </button>
      </div>

      <div class="mt-1 flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
        <span class="truncate">
          닉네임:
          <span class="font-semibold text-slate-800 dark:text-slate-100">{{ localNickName }}</span>
        </span>

        <span v-if="unreadCount > 0" class="ml-auto">
          안 읽은 메시지 {{ unreadCount }}개
        </span>

        <button
            type="button"
            class="ml-auto text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1"
            @click="$router.push('/chatList')"
        >
          <span>⬅️</span>
          <span>목록으로</span>
        </button>
      </div>
    </div>

    <!-- Alert -->
    <div
        v-if="alert.visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div class="bg-white dark:bg-slate-950 rounded-xl shadow-lg p-4 w-72 border border-slate-200 dark:border-slate-700">
        <h2 class="font-bold mb-2 text-sm text-slate-900 dark:text-slate-50">
          {{ alert.title }}
        </h2>
        <p class="text-xs mb-4 whitespace-pre-line text-slate-700 dark:text-slate-200">
          {{ alert.message }}
        </p>
        <button
            class="px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded w-full"
            type="button"
            @click="alert.visible = false"
        >
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
} from 'vue'
import axios from 'axios'

const SOCKET_URL = 'wss://salchoserver.n-e.kr/ws/chat'
const UPLOAD_URL = 'https://salchoserver.n-e.kr/blog/upload'
const FILE_BASE_URL = 'https://salchoserver.n-e.kr'
const ROOM_ID = '99999'

const NICK_PREFIXES = ['사용자', '데이터', '분석', '시트', '유저']

interface AttachmentPreview {
  file: File
  type: 'image' | 'file'
  preview: string | null
  name: string
}

interface AttachmentFromServer {
  type: 'image' | 'file'
  name: string
  url: string
  preview?: string
}

interface ChatMessage {
  text: string
  sender: string
  timestamp: Date
  type?: 'system'
  roomId?: string
  attachments?: AttachmentFromServer[]
}

const props = defineProps<{
  theme?: 'dark' | 'light'
  userNickName?: string
}>()

// 랜덤 닉네임 생성
const createRandomNick = () => {
  const prefix = NICK_PREFIXES[Math.floor(Math.random() * NICK_PREFIXES.length)]
  const num = String(Math.floor(Math.random() * 999)).padStart(3, '0')
  return `${prefix}-${num}`
}

const localNickName = ref<string>('')

const messages = ref<ChatMessage[]>([])
const input = ref('')
const attachments = ref<AttachmentPreview[]>([])
const typingUsers = ref<string[]>([])
const fontSize = ref(12)
const unreadCount = ref(0)
const isWindowFocused = ref(true)
const defaultTitle = '데이터 분석 시트'

const inputRef = ref<HTMLTextAreaElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const captureInputRef = ref<HTMLInputElement | null>(null)
const messagesEndRef = ref<HTMLElement | null>(null)
const ws = ref<WebSocket | null>(null)
const typingTimeoutRef = ref<number | null>(null)
const componentMounted = ref(true)
const isComposing = ref(false)
const isConnected = ref(false)

const alert = reactive({
  visible: false,
  title: '',
  message: '',
})

// Alert
const showAlert = (title: string, message: string) => {
  alert.title = title
  alert.message = message
  alert.visible = true
}

// 시간 포맷
const formatTime = (date?: Date) => {
  if (!date || Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 타이핑 표시
const typingLabel = computed(() => {
  if (!typingUsers.value.length) return ''
  return `${typingUsers.value.join(', ')} 님이 입력 중...`
})

// 폰트 크기
const increaseFontSize = () => {
  if (fontSize.value < 18) fontSize.value += 1
}
const decreaseFontSize = () => {
  if (fontSize.value > 8) fontSize.value -= 1
}

// 포커스
const handleFocus = () => {
  isWindowFocused.value = true
  unreadCount.value = 0
  document.title = defaultTitle
}
const handleBlur = () => {
  isWindowFocused.value = false
}

// 타이핑 종료
const handleNoTyping = () => {
  if (ws.value && ws.value.readyState === WebSocket.OPEN) {
    ws.value.send(
        JSON.stringify({
          type: 'endTyping',
          roomId: ROOM_ID,
          user: localNickName.value,
        }),
    )
  }
}

// 타이핑
const handleTyping = () => {
  if (typingTimeoutRef.value) {
    window.clearTimeout(typingTimeoutRef.value)
  }

  if (ws.value && ws.value.readyState === WebSocket.OPEN) {
    ws.value.send(
        JSON.stringify({
          type: 'typing',
          roomId: ROOM_ID,
          user: localNickName.value,
        }),
    )

    typingTimeoutRef.value = window.setTimeout(() => {
      handleNoTyping()
    }, 1000)
  }
}

// WebSocket 메시지 핸들러
const handleMessage = (event: MessageEvent) => {
  const data = JSON.parse(event.data)

  // 서버 userList는 무시
  if (data.type === 'userList') {
    return
  }

  if (data.type === 'system') {
    messages.value.push({
      text: data.text,
      sender: 'System',
      timestamp: new Date(),
      type: 'system',
    })
    return
  }

  if (data.type === 'typing') {
    if (Array.isArray(data.typingUsers) && data.roomId === ROOM_ID) {
      typingUsers.value = data.typingUsers
    }
    return
  }

  if (data.type === 'endTyping') {
    const u = data.user
    if (u) {
      typingUsers.value = typingUsers.value.filter((x) => x !== u)
    }
    return
  }

  // 🔹 첨부 파싱
  let atts: AttachmentFromServer[] | undefined
  if (data.attachments) {
    if (typeof data.attachments === 'string') {
      try {
        const parsed = JSON.parse(data.attachments)
        if (Array.isArray(parsed)) {
          atts = parsed
        }
      } catch {
        atts = undefined
      }
    } else if (Array.isArray(data.attachments)) {
      atts = data.attachments
    }
  }

  // 🔹 sender 추출 우선순위: data.sender → data.user.nickName
  const rawSender =
      (typeof data.sender === 'string' && data.sender) ||
      (data.user && typeof data.user.nickName === 'string' && data.user.nickName) ||
      ''

  let text = data.text || ''

  // 🔹 여기 핵심: 접속(type === 'connect')이고 내용/첨부가 없으면 문구 채우기
  if (data.type === 'connect' && !text && (!atts || !atts.length)) {
    text = '입장하셨습니다.'
  }


  // 🔹 sender도 없고 텍스트도 없고 첨부도 없으면 화면에 안 뿌림
  if (!rawSender && !text && (!atts || !atts.length)) {
    return
  }

  const msg: ChatMessage = {
    text,
    sender: rawSender || 'System', // 그래도 없으면 System 처리
    timestamp: new Date(data.timestamp || Date.now()),
    type: data.type === 'system' ? 'system' : undefined,
    roomId: data.roomId,
    attachments: atts,
  }

  messages.value.push(msg)

  if (msg.text && msg.sender !== localNickName.value) {
    const newCount = unreadCount.value + 1
    unreadCount.value = newCount
    if (!isWindowFocused.value) {
      document.title = `(${newCount}) ${defaultTitle}`
    }
  }
}


// WebSocket 연결
const connectSocket = () => {
  let nick =
      (props.userNickName && props.userNickName.trim()) || localNickName.value
  if (!nick) {
    nick = createRandomNick()
  }
  localNickName.value = nick

  const socket = new WebSocket(SOCKET_URL)
  ws.value = socket

  socket.onopen = () => {
    isConnected.value = true
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(
          JSON.stringify({
            type: 'connect',
            roomId: ROOM_ID,
            user: { nickName: nick },
          }),
      )

    }
  }

  socket.onmessage = handleMessage

  const reconnect = () => {
    console.log('❌ 연결 종료됨, 3초 후 재연결 시도')
    isConnected.value = false
    setTimeout(() => {
      if (!componentMounted.value) return
      connectSocket()
    }, 3000)
  }

  socket.onclose = reconnect
  socket.onerror = (err) => {
    console.error('⚠️ 소켓 오류 발생:', err)
    isConnected.value = false
    socket.close()
  }
}

// 첨부 제거
const removeAttachment = (index: number) => {
  const target = attachments.value[index]
  if (target?.preview) {
    URL.revokeObjectURL(target.preview)
  }
  attachments.value.splice(index, 1)
}

// 파일 선택
const handleFileSelect = (e: Event) => {
  const inputEl = e.target as HTMLInputElement
  if (!inputEl.files) return

  const MAX_FILE_SIZE = 50 * 1024 * 1024
  const files = Array.from(inputEl.files)

  const valid = files.filter((file) => {
    if (file.size > MAX_FILE_SIZE) {
      showAlert('알림', `${file.name}은(는) 50MB를 초과하여 업로드할 수 없습니다.`)
      return false
    }
    return true
  })

  attachments.value.push(
      ...valid.map((file) => ({
        file,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        preview: file.type.startsWith('image/')
            ? URL.createObjectURL(file)
            : null,
        name: file.name,
      })),
  )

  inputEl.value = ''
}

// Ctrl+V 이미지
const handlePaste = (e: ClipboardEvent) => {
  const items = e.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.indexOf('image') !== -1) {
      e.preventDefault()
      const file = item.getAsFile()
      if (!file) return
      const preview = URL.createObjectURL(file)

      attachments.value.push({
        file,
        type: 'image',
        preview,
        name: '캡처 이미지.png',
      })
      break
    }
  }
}

// 메시지 전송
const sendMessage = async () => {
  const text = input.value.trim()
  if (!text && attachments.value.length === 0) return

  if (!ws.value || ws.value.readyState !== WebSocket.OPEN || !isConnected.value) {
    showAlert('오류', '서버와의 연결이 끊어졌습니다. (소켓 연결 실패)')
    return
  }

  try {
    const uploadedAttachments: AttachmentFromServer[] = []

    for (const att of attachments.value) {
      const formData = new FormData()
      formData.append('file', att.file)

      const res = await axios.post(UPLOAD_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const data = res.data as {
        url: string
        originalName: string
        size: number
      }

      const fileUrl = FILE_BASE_URL + data.url

      uploadedAttachments.push({
        type: att.type,
        name: data.originalName || att.name,
        url: fileUrl,
        preview: fileUrl,
      })
    }

    const payload = {
      type: 'chat',
      text,
      sender: localNickName.value || '게스트',
      roomId: ROOM_ID,
      timestamp: new Date().toISOString(),
      attachments: uploadedAttachments,
    }

    ws.value.send(JSON.stringify(payload))

    input.value = ''
    attachments.value.forEach((att) => {
      if (att.preview) URL.revokeObjectURL(att.preview)
    })
    attachments.value = []
  } catch (e) {
    console.error(e)
    showAlert('오류', '파일 업로드 또는 전송 중 오류가 발생했습니다.')
  }
}

// 이모지
const handleEmojiSelect = (emoji: string) => {
  const el = inputRef.value
  if (!el) {
    input.value += emoji
    return
  }
  const start = el.selectionStart ?? input.value.length
  const end = el.selectionEnd ?? input.value.length

  const text = input.value
  input.value = text.slice(0, start) + emoji + text.slice(end)

  requestAnimationFrame(() => {
    el.focus()
    const pos = start + emoji.length
    el.setSelectionRange(pos, pos)
  })
}

// 입력 시 타이핑
const onInput = () => {
  if (input.value === '') {
    handleNoTyping()
  } else {
    handleTyping()
  }
}

// 키다운
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    if (isComposing.value) return
    e.preventDefault()
    sendMessage()
  }
}

// IME
const handleCompositionStart = () => {
  isComposing.value = true
}
const handleCompositionEnd = () => {
  isComposing.value = false
}

// 스크롤
watch(
    () => messages.value.length,
    () => {
      setTimeout(() => {
        messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    },
)

// 닉네임 / 소켓 연결
watch(
    () => props.userNickName,
    (val) => {
      localNickName.value =
          (val && val.trim().length > 0) ? val.trim() : createRandomNick()

      if (ws.value) {
        ws.value.close()
        ws.value = null
      }
      connectSocket()
    },
    { immediate: true },
)

onMounted(() => {
  componentMounted.value = true
  window.addEventListener('focus', handleFocus)
  window.addEventListener('blur', handleBlur)

  if (!localNickName.value) {
    localNickName.value =
        (props.userNickName && props.userNickName.trim()) || createRandomNick()
  }
})

onBeforeUnmount(() => {
  componentMounted.value = false
  window.removeEventListener('focus', handleFocus)
  window.removeEventListener('blur', handleBlur)
  if (ws.value) ws.value.close()
  attachments.value.forEach((att) => {
    if (att.preview) URL.revokeObjectURL(att.preview)
  })
})
</script>
