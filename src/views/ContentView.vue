<script setup>
import { query, insert } from "@/api/content";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElPopover } from "element-plus";
const route = useRoute();
const router = useRouter();
defineOptions({
  name: "ContentIndex",
});
// 页面获取剪贴板数据
const id = ref(route.params.id);
const createTime = ref(null);
const viewTimes = ref(null);
const content = ref(null);
const expireDays = ref("1"); // 默认过期时间为1天
const burnAfterRead = ref(false); // 阅后即焚选项
const clipboardData = ref(null); // 存储剪贴板完整数据

onMounted(async () => {
  try {
    const res = await query(id.value);
    if (res.status === 200 && res.data) {
      clipboardData.value = res.data; // 保存完整响应数据
      createTime.value = res.data.created_at;
      content.value = res.data.content;
      viewTimes.value = res.data.count;
      expireDays.value = res.data.expire_days?.toString() || "1";
      burnAfterRead.value = res.data.burn_after_read === 1;
    } else {
      console.error("Failed to fetch clipboard data:", res.message);
    }
  } catch (error) {
    console.error("Error fetching clipboard data:", error);
  }
});

// 剪贴板插入数据
const updateContent = async () => {
  try {
    await insert({
      id: route.params.id,
      content: content.value,
      expireDays: expireDays.value,
      burnAfterRead: burnAfterRead.value ? 1 : 0,
    });
  } catch (error) {
    console.error("Error inserting content:", error);
  }
};

// 复制文本功能
const copyText = () => {
  if (!content.value) return;
  navigator.clipboard
    .writeText(content.value)
    .then(() => {
      alert("文本已复制到剪贴板");
    })
    .catch((err) => {
      console.error("复制失败:", err);
      alert("复制失败，请手动复制");
    });
};

// 下载文本功能
const downloadText = () => {
  if (!content.value) return;

  const blob = new Blob([content.value], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `clipboard-${id.value}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 删除剪贴板功能
const deleteClipboard = async () => {
  try {
    // 发送删除请求到后端
    const response = await fetch(`http://localhost:3002/deleteClipboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id.value }),
    });

    const result = await response.json();

    if (result.status === 200) {
      // 清空内容并返回首页
      content.value = null;
      router.push("/");
    }
  } catch (error) {
    console.error("删除剪贴板时出错:", error);
  }
};
</script>

<template>
  <div class="app">
    <header id="nav">
      <div class="nav-container">
        <div class="nav-left">
          <a href="#" @click="router.push({ name: 'home' })"
            >INTERNET CLIPBOARD
          </a>
        </div>

        <div class="nav-right">
          <div class="nav-center">
            <span>过期时间</span>
            <select v-model="expireDays">
              <option value="1">1天</option>
              <option value="3">3天</option>
              <option value="7">7天</option>
            </select>
            <label style="display: none">
              <input type="checkbox" v-model="burnAfterRead" /> 阅后即焚
            </label>
          </div>
          <span class="current">Current index:</span>
          <input type="text" class="index" :value="route.params.id" />
          <el-popover placement="bottom" trigger="hover" content="Save content">
            <template #reference>
              <button class="submit" @click="updateContent">
                <img src="../assets/正确.svg" alt="" />
              </button>
            </template>
          </el-popover>
        </div>
      </div>
    </header>

    <main id="mainBox">
      <div id="content">
        <textarea
          v-model="content"
          name=""
          id=""
          placeholder=" 
                可以随便记录点什么，单次支持28万字符。.
                剪贴板只要有效期内有查看或修改则永不过期，将自动延期所设置有效期时长
                使用后请主动删除剪贴板，避免数据长时间存储造成数据泄露。"
        ></textarea>
      </div>
      <div id="tools">
        <div class="tools-buttons">
          <div class="copy-box">
            <el-popover
              placement="left"
              trigger="hover"
              content="Copy to clipboard"
            >
              <template #reference>
                <button class="copy-button" @click="copyText">
                  <img src="../assets/复制文件.svg" alt="" />
                </button>
              </template>
            </el-popover>
          </div>
          <div class="download-box">
            <el-popover
              placement="left"
              trigger="hover"
              content="Download as text file"
            >
              <template #reference>
                <button class="download-button" @click="downloadText">
                  <img src="../assets/下载.svg" alt="" />
                </button>
              </template>
            </el-popover>
          </div>
          <div class="delete-box">
            <el-popover
              placement="left"
              trigger="hover"
              content="Delete clipboard"
            >
              <template #reference>
                <button class="delete-button" @click="deleteClipboard">
                  <img style="width: 40%" src="../assets/trash.png" alt="" />
                </button>
              </template>
            </el-popover>
          </div>
        </div>
        <div class="info-box">
          <ul class="time">
            <li>创建时间</li>
            <li>{{ createTime }}</li>
            <li>查看次数</li>
            <li>{{ viewTimes }}</li>
          </ul>
          <!-- 阅后即焚警告横幅 -->
          <div v-if="burnAfterRead" class="burn-warning">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="warning-icon"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
            <span
              >警告：此剪贴板为阅后即焚！请勿刷新页面，否则内容将被删除且无法再次查看！</span
            >
          </div>
          <!-- 阅后即焚已查看警告 -->
          <div
            v-if="burnAfterRead && clipboardData?.is_burn_after_read_viewed"
            class="burn-viewed-warning"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="#ff0000"
              class="warning-icon"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
            <span
              >重要提示：此内容已被查看过一次，离开或刷新页面后将被永久删除！</span
            >
          </div>
        </div>
      </div>
    </main>

    <footer id="bottom">
      <p>THE INTERNET CLIPBOARD FROM LUOZIHAO</p>
    </footer>
  </div>
</template>

<style scoped>
/* 重置默认的边距、内边距、盒模型、字体 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "MyCustomFont", sans-serif;
}

div,
span,
p {
  caret-color: transparent;
}

@font-face {
  font-family: "MyCustomFont";
  src: url("../assets/font/UNSII-2.ttf") format("truetype");
}

/* 去除默认列表样式 */
li {
  list-style: none;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 头部导航栏 */
#nav {
  width: 100%;
  height: 50px;
  box-shadow: 0.1px 0.1px 5px 1px #666666;
  background: url(../assets/清单.svg) no-repeat 20px center;
  padding: 0 20px 0 58px;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.nav-left a {
  display: flex;
  align-items: center;
  gap: 50px;
  font-size: 18px;
  color: #3f72af;
  text-decoration: none;
  width: 500px;
}

.nav-center {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  color: #3f72af;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  color: #3f72af;
}

.index {
  border: #3f72af 3px solid;
  border-radius: 50px;
  text-align: center;
  outline: none;
  padding: 5px 10px;
}

select {
  border-radius: 30px;
  border: #3f72af 3px solid;
  text-align: center;
  color: #3f72af;
  font-family: "微软雅黑";
  outline: none;
  padding: 5px;
}

.submit {
  width: 60px;
  height: 40px;
  border: 3px #3f72af solid;
  border-radius: 30px;
  background: none;
  color: #3f72af;
  transition: 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 主内容区域 */
#mainBox {
  display: flex;
  width: 1260px;
  margin: 5px auto;
  flex: 1;
}

#content {
  flex: 1;
  border: #3f72af solid 2px;
  display: flex;
}

#content textarea {
  width: 100%;
  height: 100%;
  border: none;
  resize: none;
  outline: none;
  font-size: 16px;
  font-family: "微软雅黑";
  caret-color: black;
  padding: 50px;
}

#tools {
  width: 300px;
  border: #3f72af 2px solid;
  border-left: none;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.tools-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 50px;
  margin-bottom: 50px;
}

.copy-box,
.download-box,
.delete-box {
  width: 100px;
}

.copy-button,
.download-button,
.delete-button {
  width: 100px;
  height: 50px;
  border: 3px solid #3f72af;
  background: none;
  border-radius: 50px;
  transition: 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.current {
  margin-left: 50px;
}
.download-button:hover,
.copy-button:hover,
.delete-button:hover,
.submit:hover {
  border: 5px #3f72af solid;
}

.info-box {
  margin-top: auto;
}

.time {
  border: #3f72af solid 1px;
  padding: 10px;
  border-radius: 10px;
  color: #3f72af;
}

.time li {
  padding: 10px 0;
  font-size: 18px;
}

/* 阅后即焚警告样式 */
.burn-warning {
  display: flex;
  align-items: center;
  background-color: #ffebee;
  border: 1px solid #f44336;
  border-radius: 10px;
  padding: 10px;
  margin-top: 15px;
  color: #d32f2f;
}

.burn-viewed-warning {
  display: flex;
  align-items: center;
  background-color: #ffdede;
  border: 2px solid #ff0000;
  border-radius: 10px;
  padding: 10px;
  margin-top: 15px;
  color: #ff0000;
  font-weight: bold;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

.warning-icon {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

/* 底部导航栏 */
#bottom {
  width: 100%;
  height: 50px;
  box-shadow: 0.1px 0.1px 5px 1px #666666;
  text-align: center;
  color: #3f72af;
  line-height: 50px;
  background-color: rgba(255, 255, 255, 0.9);
  margin-top: auto;
}
</style>
