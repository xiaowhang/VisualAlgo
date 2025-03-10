<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <el-button type="primary" @click="handleClick">
          Upload<el-icon class="el-icon--right"><EpUpload /></el-icon>
        </el-button>
      </el-header>

      <el-container>
        <el-aside width="200px">Aside</el-aside>
        <el-main>Main</el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
// import { ref } from 'vue'
defineOptions({
  name: 'eLayout',
})

const a = ref(1)

const handleClick = () => {
  ElMessage.success(`点击了${a.value}`)
  a.value++
}
</script>

<style scoped>
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
  text-align: center;
}

.el-aside {
  background-color: #d3dce6;
  color: #333;
  text-align: center;
  line-height: 200px;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: center;
  line-height: 160px;
}

.el-container {
  /* margin-bottom: 40px; */
  height: 100vh;
}
</style>
