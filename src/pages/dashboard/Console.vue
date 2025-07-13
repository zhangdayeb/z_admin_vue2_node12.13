<template>
  <div class="task console">
    <div class="welcome-container">
      <h1 class="welcome-text">欢迎光临管理后台</h1>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StaticConsole',
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
.console {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

  &::-webkit-scrollbar {
    width: 0px !important;
  }

  .welcome-container {
    text-align: center;
    padding: 40px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border: 1px solid #e8e8e8;
  }

  .welcome-text {
    color: #1890FF;
    font-size: 28px;
    font-weight: 500;
    margin: 0;
    letter-spacing: 2px;
  }
}

@media only screen and (max-width: 768px) {
  .console {
    .welcome-container {
      padding: 30px 20px;
      margin: 20px;
    }

    .welcome-text {
      font-size: 24px;
    }
  }
}

@media only screen and (max-width: 480px) {
  .console {
    .welcome-text {
      font-size: 20px;
      letter-spacing: 1px;
    }
  }
}
</style>
