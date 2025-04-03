<script setup>
// 要在组合式api中使用 vue-router 需要导入模块
import { useRouter } from 'vue-router'
// 然后需要使用这个模块
const router = useRouter()

defineOptions({
  name: 'HomeIndex'
})
// 导入请求模块
import { create } from '@/api/home'
import { ref } from 'vue';
// 创建一个剪贴板
const createClipboard = async () => {
  // 生成随机id
  const num = generateRandomNumber(10)
  await create(num)
  router.push(`/${num}`)
}
// 索引输入查询输入按钮
const inpIndex = ref(null)
const search = ()=>{
  router.push(`/${inpIndex.value}`)
}
// 生成随机数 用来配置剪贴板的索引
function generateRandomNumber(length) {
  let result = '';
  const characters = '0123456789';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}
// // 顶部时间 提示函数
// function getD1() {
//   var date = new Date();
//   var d1 = date.toLocaleString();
//   document.getElementById("datetime").innerHTML = "Now time：" + d1;
// }
// setInterval(getD1, 1000);

// function getD2() {
//   var txt = document.querySelector(".center")
//   if (txt.innerHTML == "Click search into the clipboard") {
//     txt.innerHTML = "Click reset set clipboard"
//   }
//   else {
//     txt.innerHTML = "Click search into the clipboard"
//   }
// }
// setInterval(getD2, 2000);

</script>

<template>
  <div class="app">
    <div id="nav">
      <ul>
        <li class="left">
          <a href="">INTERNET CLIPBOARD</a>
        </li>
        <li class="center">
        </li>
        <li class="right">
          <div id="datetime"></div>
        </li>
      </ul>
    </div>

    <!-- 按钮区域 -->
    <div class="button">
      <div class="search-box">
        <input type="text" class="search-txt" placeholder="paste index" v-model="inpIndex">
        <a href="#" class="search-btn" @click="search">
          <img src="../assets/搜索.svg" alt="">
        </a>
      </div>
      <a href="#" class="search-btn2" @click="createClipboard">
        <img src="../assets/重置.svg" alt="">
      </a>
    </div>
    <!-- 底部区域 -->
    <div class="bottom">
      <p>
        THE INTERNET CLIPBOARD FROM LUOZIHAO
      </p>
    </div>
  </div>
</template>
<style>
/* 重置默认的边距、内边距、盒模型、字体 */
* {
  margin: 0;
  /* 边距为0 */
  padding: 0;
  /* 内边距为0 */
  box-sizing: border-box;
  /* 使用边框盒模型 */
  font-family: "MyCustomFont", sans-serif;
  /* 使用微软雅黑字体 */
}

div,
span,
p {
  caret-color: transparent;
}

.search-txt {
  caret-color: white;
}
@font-face {
  font-family: 'MyCustomFont';
  src: url('../assets/font/UNSII-2.ttf') format('truetype');
  /* 替换为正确的路径 */
  /* 可以添加更多的格式和变体（如果有的话） */
}

/* 去除默认列表样式 */
li {
  list-style: none;
  /* 不显示列表样式 */
}

/* 头部 */
#nav {
  width: 100%;
  /* 宽度100% */
  height: 50px;
  /* 高度50像素 */
  padding: 5px;
  /* 内边距为13像素 */
  padding-left: 58px;
  /* 左侧内边距为58像素 */
  padding-right: 20px;
  box-shadow: 0.1px 0.1px 5px 1px #666666;
  /* 设置阴影 */
  background: url(../assets/清单.svg) no-repeat 20px center;
  /* 设置背景图片 */

}

/* 垂直居中导航项 */
ul {
  align-items: center;
  /* 垂直居中 */
  align-self: center;
  /* 子元素垂直居中 */
}

/* 左对齐导航链接样式 */
#nav .left a {
  font-size: 18px;
  /* 字体大小18像素 */
  color: #3f72af;
  /* 文本颜色 */
  text-decoration: none;
  /* 去除下划线 */
  float: left;
  /* 左浮动 */
}

/* 右对齐导航链接样式 */
#nav .right {
  font-size: 18px;
  /* 字体大小18像素 */
  color: #3f72af;
  /* 文本颜色 */
  text-decoration: none;
  /* 去除下划线 */
  float: right;
  /* 右浮动 */
}

.center {
  width: 500px;
  float: left;
  font-size: 18px;
  text-align: center;
  transition: 0.4s;
  color: #3f72af;
}

/* 底部导航栏区域 */
.bottom {
  width: 100%;
  height: 50px;
  position: absolute;
  top: 94%;
  box-shadow: 0.1px 0.1px 5px 1px #666666;
  /* 设置阴影 */
  text-align: center;
  color: #3f72af;
  line-height: 50px;
}

.button {
  height: 100px;
  position: absolute;
  top: 50%;
  left: 47%;


}

a {
  text-decoration: none;
}

/* 居中搜索框 */
.search-box {
  transform: translate(-50%, -50%);
  /* 居中偏移 */
  background: #2f3640;
  /* 背景颜色 */
  height: 80px;
  /* 高度50像素 */
  border-radius: 40px;
  /* 边框圆角 */
  padding: 5px;
  /* 内边距为5像素 */
  float: left;
  padding-left: 7px;
}

/* 搜索按钮样式 */
.search-btn {
  color: #2f3640;
  /* 文本颜色 */
  float: right;
  /* 右浮动 */
  width: 70px;
  /* 宽度40像素 */
  height: 70px;
  /* 高度40像素 */
  border-radius: 50%;
  /* 圆形边框 */
  background-color: #2f3640;
  /* 背景颜色 */
  display: flex;
  /* 使用弹性盒子布局 */
  justify-content: center;
  /* 水平居中 */
  align-items: center;
  /* 垂直居中 */
  transition: 0.4s;
  /* 过渡效果时间 */
}

/* 鼠标悬停时展开搜索框 */
.search-box:hover>.search-txt {
  width: 240px;
  /* 宽度240像素 */
  padding: 0 0px;
  /* 内边距 */
}

/* 鼠标悬停时按钮背景变化 */
.search-box:hover>.search-btn {
  background: white;
  /* 白色背景 */
  color: white;
}

/* 搜索输入框样式 */
.search-txt {
  border: none;
  /* 无边框 */
  background: none;
  /* 透明背景 */
  outline: none;
  /* 外边框样式 */
  float: left;
  /* 左浮动 */
  padding: 0;
  /* 内边距为0 */
  color: white;
  /* 文本颜色 */
  font-size: 20px;
  /* 字体大小16像素 */
  transition: 0.4s;
  /* 过渡效果时间 */
  line-height: 70px;
  /*input行高*/
  transition: 0.4s;
  /*过度时间*/
  width: 0px;
  /*默认宽度*/
  text-align: center;

}

/* 第二个按钮 */

.search-btn2 {
  color: #2f3640;
  /* 文本颜色 */
  float: right;
  /* 右浮动 */
  width: 80px;
  /* 宽度40像素 */
  height: 80px;
  /* 高度40像素 */
  border-radius: 50%;
  /* 圆形边框 */
  background-color: #008F40;
  /* 背景颜色 */
  display: flex;
  /* 使用弹性盒子布局 */
  justify-content: center;
  /* 水平居中 */
  align-items: center;
  /* 垂直居中 */
  transition: 0.4s;
  /* 过渡效果时间 */
  transform: translate(-50%, -50%);
  margin-left: 20px;
}

.search-btn2:hover {
  background: #2f3640;
  /* 白色背景 */
  color: white;
}
</style>
