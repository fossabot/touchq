<template>

  <el-container ref="TalexLightChat" class="TalexLightChat-Page_container">

    <el-main class="ContainerHolder" ref="bubbleContainer" @scroll="userScroll">

      <div class="BubbleMessageContainer" @click="handleClickBubble" v-for="(msg, index) in msgs" :ref="'ref_' + index">

        <div :class="{ bubble_system: msg.type === 'system', bubble_left: msg.type === 'left', bubble_right: msg.type === 'right'}">

          <div class="bubble_container" v-if="msg.type !== 'system'">

            <div @click="clickAvatar(msg)"><el-avatar class="user_avatar" size="large" :src="msg.target.image"></el-avatar></div>

          </div>

          <div :id="'bubble_content_' + index" style="min-width: 100px;min-height: 25px" class="content">

            <div class="content_addon" v-if="msg.addon !== undefined" v-html="processContentAddon(msg, index)"></div>

            <span v-else v-html="processContent(msg, index)"></span>

            <div v-if="msg.type !== 'system'">

              <span class="bubble_title">{{ msg.target.name }}</span>

              <div class="content_timer">{{ timer(msg.time) }}</div>

            </div>

          </div>

        </div>

      </div>

    </el-main>

  </el-container>

</template>

<script>

import Global from '../cmd/Global'

export default {
  name: "TalexLightChat",

  props: {

    messages: {

      type: [Array],
      default() {

        return []

      }

    },
    darkMode: {

      type: Boolean,
      default: false,

    },

  },

  data() {

    return {

      lastScrollTime: -1,
      msgs: [],

    }

  },

  mounted() {

    this.messages.forEach((message, index) => {

      this.msgs.push(message)

    })

  },

  watch: {

    darkMode: {

      immediate: true,

      handler(latest, old) {

        this.setTheme(latest);

      }

    },

    msgs: {

      handler (latest, old) {

        if(Date.now() - this.lastScrollTime > 2600) {

          const el = this.$refs.bubbleContainer.$el;

          setTimeout(() => {

            el.scrollTop = el.scrollHeight

            // setTimeout(() => {
            //
            //   const elContainer = this.$refs['ref_' + (this.msgs.length - 1)][0]
            //
            //   elContainer.style.background = "var(--containerBg)"
            //
            //   setTimeout(() => {
            //
            //     elContainer.style.background = ""
            //
            //   }, 500)
            //
            // }, 300)

          }, 20)

        }

      },

      deep: true

    },

    messages: {

      deep: true,
      handler(latest, old) {

        this.msgs = latest

      }

    }

  },

  methods: {

    handleClickBubble(e) {

      const type = e.target.tagName

      if(type === 'IMG') {

        return this.$emit("onViewImg", e.target)

      }

      this.$emit("onClickBubble", e)

    },

    clear() {

      this.msgs = []

    },

    timer(val) {

      if(typeof val !== 'number') return val

      val = parseInt(val) * 1000

      const date = new Date(val)
      const now = new Date()

      const year = date.getFullYear();

      if(now.getFullYear() > year) {

        const month = (date.getMonth() + 1 + '').padStart(2, '0');
        const d = (date.getDate() + 1 + '').padStart(2, '0');

        return year + '-' + month + '-' + d

      }

      let period = now.getTime() - val

      period += '0'

      period += 0

      if(period >= 7 * 24 * 3600000) {

        const month = (date.getMonth() + 1 + '').padStart(2, '0');
        const d = (date.getDate() + 1 + '').padStart(2, '0');

        return month + '-' + d

      }

      if(period >= 24 * 3600000) {

        period /= 24 * 3600000

        const dayPrefix = (period === 1) ? '昨天' : period + '天前'

        const hh = (date.getHours() + '').padStart(2, '0');
        const mm = (date.getMinutes() + '').padStart(2, '0');

        return dayPrefix + ' ' + hh + ':' + mm

      }

      const hh = (date.getHours() + '').padStart(2, '0');
      const mm = (date.getMinutes() + '').padStart(2, '0');
      const ss = (date.getSeconds() + '').padStart(2, '0');

      return hh + ":" + mm + ":" + ss;

    },

    spawnTarget(name, image) {

      return {

        name,
        image

      }

    },

    addTargetAlbum(target, content, time, length) {

      this.addCustomBubble({ type: 'left', target, content, time,

        addon: {

          album: true,
          length,

        }

      })

    },

    addSelfAlbum(target, content, time, length) {

      this.addCustomBubble({ type: 'right', target, content, time,

        addon: {

          album: true,
          length,

        }

      })

    },

    addTargetBubble(target, content, time) {

      this.addCustomBubble({ type: 'left', target, content, time })

    },

    addSelfBubble(target, content, time) {

      this.addCustomBubble({ type: 'right', target, content, time })

    },

    addCustomBubble(obj) {

      this.msgs.push(obj)

    },

    addSystemBubble(content) {

      this.msgs.push({

        type: "system",
        content,

      })

    },

    userScroll(event) {

      this.lastScrollTime = Date.now();

    },

    processContentAddon(msg, i) {

      if(msg.addon.album) {

        const length = msg.addon.length

        let width = length * 1.75 * (msg.type === 'right' ? 1.25 : 1);

        const divClass = (msg.type === 'right' ? "bubble_album_self" : "bubble_album")
        const divStyle = (msg.type === 'right' ? "margin-left" : "margin-right")

        return "<div class=\"" + divClass + "\" style='" + divStyle + ": " + width + "px !important' ><div class='wifi-symbol'>" +
            "<div class='wifi-circle first'></div><div class='wifi-circle second'></div><div class='wifi-circle third'></div></div><span class='album_length'>" + length + "''</span></div>"

      }

    },

    processContent(msg, i) {

      if(msg === null || !msg.content) {

        if(msg.addon) {

          if(msg.addon.album) return "[语音消息]"

        }

        console.log(msg)

        return "Unknown message for index " + i

      }

      let content = msg.content;

      let ind = content.indexOf("<");

      while( ind !== -1 ) {

        let ind2 = content.indexOf(">", ind);

        let str = content.substring(ind, ind2 + 1);

        content = content.replace(str, str.replace("<", "&lt;").replace(">", "&gt;"));

        ind2 = content.indexOf(">", ind2);

        ind = content.indexOf("<", ind2 + 10);

      }

      let index = content.indexOf("[CQ:");

      while( index !== -1 ) {

        let index2 = content.indexOf("]", index);

        const str = content.substring(index, index2 + 1);

        content = content.replace(str, this.getSpecialCodeHtml(str, i));

        index = content.indexOf("[CQ:", index2);

      }

      return content;

    },

    getSpecialCodeHtml(code, i) {

      code = code.replace("[CQ:", "");

      const index1 = code.indexOf(",");

      const type = code.substring(0, index1);

      if( type.toLowerCase() === 'at') {

        const index2 = code.indexOf(";", index1);

        const content = code.substring(index1 + 1, index2);

        return "<span style='color: #6f86fb;opacity: 0.95;margin: 0 5px 0 3px'>@" + content + " </span>";

      }

      if( type.toLowerCase() === 'image') {

        const index2 = code.indexOf('url=')
        const index3 = code.indexOf('subType', index2)

        const url = code.substring(index2 + 4, index3 - 1)

        return "<img class='chat_img' referrerPolicy='no-referrer' alt='无法加载图片' src='" + url + "'/>"

      }

      if( type.toLowerCase() === 'reply') {

        const index2 = code.indexOf("]", index1)

        const order = code.substring(index1 + 1, index2)

        if(order == i) {

          return "<div class='chat_reply'><div class='reply_user'>Error</div><div class='contenter'><span style='color: #fff176'>错误: 回复消息异常</span></div></div>"

        }

        if(this.msgs.length + 1 < order) {

          return "<div class='chat_reply'><div class='reply_user'>Unknown</div><div class='contenter'><span style='color: red'>无法定位到回复消息</span></div></div>"

        }

        const obj = this.msgs[order]

        return "<div class='chat_reply'><div class='reply_user'>" + obj.target.name + "</div><div class='contenter'>" + this.processContent(obj, i) + "</div></div>"

      }

      return code;

    },

    clickAvatar(msg) {

      this.$emit("clickAvatar", msg);

    },

    setTheme(mode) {

      setTimeout(() => {

        let el = this.$refs.TalexLightChat;

        if(!el) return

        el = el.$el

        // 开启了暗黑模式
        if(mode) {

          el.style.setProperty('--containerBg', '#1C1C1C');
          el.style.setProperty('--textColor', '#fff');
          el.style.setProperty('--bubble_system', '#0b0a09');
          el.style.setProperty('--bubble_left', '#262626');
          el.style.setProperty('--bubble_right', '#2b5278');

          //--containerBg: #1C1C1C;
          //--textColor: #fff;
          //--bubble_left: #262626;
          //--bubble_right: #2b5278;
          //--bubble_system: #0b0a09;

          this.setScrollColor(el, "rgba(255, 255, 255, 0.3)")

        } else {

          el.style.setProperty('--containerBg', '#f5f6f7');
          el.style.setProperty('--textColor', 'black');
          el.style.setProperty('--bubble_system', 'grey');
          el.style.setProperty('--bubble_left', '#ffffff');
          el.style.setProperty('--bubble_right', '#e8e7ba');

          this.setScrollColor(el, "rgba(0, 0, 0, 0.3)")

        }

      }, 10)

    },

    setScrollColor(el, color) {

      el.style.setProperty('--scrollColor', color)

    }

  }

}
</script>

<!--聊天大致布局样式-->
<style lang="scss" scoped>

.BubbleMessageContainer {

  position: relative;

  top: 0;
  left: 0;

  min-width: 100%;
  height: auto;

  box-sizing: border-box;

  padding: 0 10px 0 10px;
  margin-bottom: -15px;

  z-index: 1000;

}

.bubble_right {

  position: relative;
  float: right;
  max-width: 70%;

  .bubble_container {

    position: relative;
    float: right;

    .el-avatar {

      position: relative;

      right: 5px;
      top: 0;

      overflow: unset;

      animation: right_bubble_avatar_load .25s;

    }

  }

  .content {

    position: relative;

    top: -35px;
    right: 60px;

    background-color: var(--bubble_right);
    padding: 14px 11px 30px 11px;

    border-radius: 9px 0 5px 9px;

    filter: drop-shadow(0 0 2px var(--bubble_right));

    animation: right_bubble_load .5s;

    .bubble_title {

      position: absolute;

      right: 9px;
      bottom: 5px;

      font-size: 12px;

    }

    .content_timer {

      position: absolute;

      left: 9px;
      bottom: 5px;

      font-size: 12px;

    }

    * {

      font-size: 15px;

      animation: bubble_content_load .85s ;

    }

  }

  .content::after {

    position: absolute;

    content: "";

    right: -4px;
    top: 0;

    border-top: 10px solid var(--bubble_right);
    border-right: 10px solid rgba(0,0,0,0);

    z-index: -1;

    animation: right_bubble_pointer_load 1.35s 1;

  }

}

.bubble_left {

  position: relative;
  max-width: 60%;

  .bubble_container {

    position: relative;

    .el-avatar {

      position: relative;

      left: 5px;
      top: 12px;

      overflow: unset;

      animation: left_bubble_avatar_load .25s;

    }

  }

  .content {

    position: relative;

    top: -25px;
    left: 60px;

    background-color: var(--bubble_left);
    padding: 14px 11px 30px 11px;

    border-radius: 0 9px 9px 5px;

    filter: drop-shadow(0 0 2px var(--bubble_left));

    animation: left_bubble_load .5s;

    .bubble_title {

      position: absolute;

      width: fit-content;
      width: -moz-fit-content;
      max-width: 60%;

      left: 9px;
      bottom: 5px;

      font-size: 12px;

    }

    .content_timer {

      position: absolute;

      width: fit-content;
      width: -moz-fit-content;

      right: 9px;
      bottom: 5px;

      font-size: 12px;

    }

    * {

      font-size: 14px;

      animation: bubble_content_load .85s;

    }

  }

  .content::before {

    position: absolute;

    left: -5px;
    top: 0;

    content: "";

    border-top: 10px solid var(--bubble_left);
    border-left: 10px solid rgba(0,0,0,0);

    z-index: -1;

    animation: left_bubble_pointer_load 1.35s 1;

  }

}

.bubble_system {

  position: relative;

  left: 50%;

  height: 35px;
  width: auto !important;
  max-width: 80%;

  transform: translateX(-50%);
  padding: 2px 5px 0 5px;

  .content {

    position: relative;

    top: 50%;
    left: 50%;
    transform: translate(-50%);

    span {

      position: relative;

      padding: 5px 10px 5px 10px;

      height: 5px;
      width: fit-content;

      border-radius: 10px;

      text-align: center;
      opacity: 0.95;

      color: var(--textColor);
      //background-color: var(--bubble_system);

    }

  }

  animation: bubble_system_load .35s 1 ease;

}

.TalexLightChat-Page_container {

  background-color: var(--containerBg);

  .el-main {

    position: relative;

    overflow-y: auto;
    overflow-x: hidden;

    max-height: 100%;

    z-index: 1000;

    div {

      width: fit-content;
      width: -moz-fit-content;

      height: auto !important;
      clear: both !important;

    }

  }

  position: relative;

  width: 100%;
  height: 100%;

  overflow: hidden;

  * {

    color: var(--textColor);

  }

}

</style>

<style lang="scss">

.ContainerHolder {

  padding: 0;

}

.TalexLightChat-Page_container {

  --containerBg: #e0dddd;
  --textColor: black;
  --bubble_left: #ffffff;
  --bubble_right: #74be96;
  --bubble_system: grey;
  --scrollColor: black;

  * {

    transition: all .15s;

  }

}

// 聊天图片定义

.chat_img:hover {

  margin: 2px;

  padding: -10px;
  opacity: 1;
  box-sizing: content-box;

  border-bottom: 2px solid #1b7cb9;

}

.chat_img {

  position: relative;
  display: inline-block;

  margin: 2px;
  padding: -10px;

  max-width: 512px;
  height: auto;
  opacity: 0.95;

  border-bottom: 2px solid rgba(0, 0, 0, 0);

  transition: all .35s;

}

@keyframes fadeInOut {

  0% {

    opacity: 0; /*初始状态 透明度为0*/

  }

  100% {

    opacity: 1; /*结尾状态 透明度为1*/

  }

}

// 回复

.chat_reply {

  .reply_user {

    position: relative;

    font-size: 16px;

    margin-bottom: 5px;

  }

  position: relative;

  left: 50%;
  top: 50%;

  width: auto;
  height: auto;

  padding: 10px 15px 10px 15px;
  margin-bottom: 15px;

  transform: translate(-50%);

  border-radius: 7px;
  //border-left: 2px solid #1b7cb9;

  background-color: rgba(0, 0, 0, 0.15);

}

// 用户头像

.user_avatar {

  img {

    border-radius: 50%;

    filter: drop-shadow(0 0 3px var(--textColor))

  }

  img:hover {

    border-radius: 50%;

    filter: drop-shadow(0 0 5px var(--textColor))

  }

}

// 语音 气泡定义

.bubble_album_self {

  position: relative;
  float: right;

  height: 25px;

  .album_length {

    position: absolute;

    width: 40px;
    height: 40px;
    top: 4px;

    right: 10px;

    z-index: 1000;

    color: var(--textColor);
    filter: invert(30%);

  }

  .wifi-symbol {

    transform: translateX(-5px) rotate(180deg) rotate(135deg) scale(0.6);

  }

}

.bubble_album {

  height: 30px;

  margin-bottom: -10px;

  .album_length {

    position: absolute;

    width: 40px;
    height: 40px;
    top: 13px;

    left: 40px;

    z-index: 1000;

    color: var(--textColor);
    filter: invert(30%);

  }

}

// 语音 wifi 样式定义

.wifi-symbol {

  position: relative;

  top: -10px;
  left: 5px;

  width: 50px;
  height: 50px;

  overflow: hidden;
  transform: rotate(135deg) scale(0.6);

}

.first {

  width: 3px;
  height: 3px;
  background: #cccccc;
  top: 45px;
  left: 45px;

  transform: scale(1.2);

}

.second {

  width: 25px;
  height: 25px;
  top: 35px;
  left: 35px;

}

.third {

  width: 40px;
  height: 40px;
  top: 25px;
  left: 25px;

}

.wifi-play {

  .second {

    animation: fadeInOut 1s infinite 0.2s;

  }

  .third {

    animation: fadeInOut 1s infinite 0.4s;

  }

}

.wifi-circle {

  position: absolute;

  border: 5px solid var(--textColor);
  border-radius: 50%;

  filter: invert(30%);

}

</style>

<!--相关杂项和动画-->
<style lang="scss">

.content_timer {

  transition: all .35s;

}

@keyframes left_red_packet_bubble_load {

  from {

    opacity: 0;

    transform: translate(-40px) translate(-20px, -5px) scale(0.65, 1);

  }

  to {

    transform: translate(0) translate(-20px, -5px) scale(1);

  }

}
@keyframes right_red_packet_bubble_load {

  from {

    opacity: 0;

    transform: translate(40px) translate(20px, -5px) scale(0.65, 1);

  }

  to {

    transform: translate(0) translate(20px, -5px) scale(1);

  }

}

@keyframes left_bubble_pointer_load {

  0% {

    opacity: 0;
    left: 13px;

  }

  60% {

    opacity: 1;

  }

  80% {

    left: -8px;

  }

  100% {

    left: -5px;

  }

}
@keyframes right_bubble_pointer_load {

  0% {

    opacity: 0;
    transform: translateX(-20px);

  }

  60% {

    opacity: 1;

  }

  80% {

    transform: translateX(3px);

  }

  100% {

    transform: translateX(0);

  }

}

@keyframes left_bubble_load {

  from {

    opacity: 0;

    transform: translate(-40px) scale(0.65, 1);

  }

  to {

    transform: translate(0) scale(1);

  }

}
@keyframes right_bubble_load {

  from {

    opacity: 0;

    transform: translate(40px) scale(0.65, 1);

  }

  to {

    transform: translate(0) scale(1);

  }

}

@keyframes right_bubble_avatar_load {

  from {

    transform: translateX(100px);

  }

  to {

    transform: translateX(0);

  }

}
@keyframes left_bubble_avatar_load {

  from {

    transform: translateX(-100px);

  }

  to {

    transform: translateX(0);

  }

}

@keyframes bubble_system_load {

  from {

    opacity: 0;
    transform: translate(-50%, -30px);

  }

  to {

    opacity: 1;
    transform: translate(-50%, 0);

  }

}
@keyframes bubble_content_load {

  from {

    opacity: 0;

  }

  to {

    opacity: 1;

  }

}

::-webkit-scrollbar-thumb {

  background-color: var(--scrollColor) !important;
  border-radius: 3px;

  transition: all .25s;

}
::-webkit-scrollbar-track {

  border-radius: 1px;
  width: 10px !important;
  background-color: var(--containerBg) !important;

  transition: all .25s;

}

</style>
