<template>
  <div class="login">
    <div class="right-wrap">
      <div class="login-language"></div>
      <header class="header" style="margin-top: 4rem;">
        <div class="login-text">
          <div>管理专用</div>
        </div>
      </header>
      <section class="login-panel" v-if="maintainState != '1'">
        <div class="login-row">
          <div class="login-in login-account">
            <input type="text" class="login-input" v-model.trim="account" @keyup.enter="login" placeholder="请输入账号"/>
          </div>
        </div>
        <div class="login-row">
          <div class="login-in login-password ">
            <input type="password" class="login-input" v-model.trim="password" @keyup.enter="login" placeholder="请输入密码"/>
          </div>
        </div>
        <div class="login-row">
          <div class="login-in">
            <img class="login-code" src="~@/assets/img/login/code.svg" alt="" srcset="" >
            <input type="text" v-model.trim="captcha" class="login-input" @keyup.enter="login" placeholder="请输入验证码"/>
          </div>
        </div>
        <div class="login-row login-buttons">
          <el-button class="login-btn" style="width: 96%;" :loading="loading" @click="login" >登&nbsp;&nbsp;&nbsp;&nbsp;录</el-button>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
  import { loginApi } from '@/api/loginApi'
  import { setToken, getToken } from "@/utils/auth"

  export default {
    data () {
      return {
        account: '',
        password: '',
        captcha:'',
        loading: false,
        //维护状态 0 正常  1维护
        maintainState: '-1',
      }
    },
    created() {
    },
    mounted() {
      let path = '/dashboard/console'
      let router = this.$router
      this.$store.dispatch('worktab/worktabRemoveAll', { path, router})
      this.tokenLogin()
    },
    methods: {
      login() {
        let { account, password, captcha } = this
        if(!account) {
          this.$message.error('请输入账号')
          return
        }
        if(!captcha) {
          this.$message.error('请输入验证码')
          return
        }
        if(!password) {
          this.$message.error('请输入密码')
          return
        }

        this.adminLogin()
      },

      adminLogin() {
        let { account, password, captcha } = this
        loginApi({
          user_name: account,
          pwd: password,
          captcha:captcha
        }).then(res => {
          if(res.code === 1) {
            this.loading = true
            this.$store.dispatch('user/setUserInfo', res.data)
            this.$store.dispatch('user/setLoginStatus', true)
            setToken(res.data.token)
            localStorage.setItem('user_name', account)
            setTimeout(() => {
              this.$router.push('/dashboard/console')
            }, 1000)
          }
        })
      },

      //跳转到客服
      tokenLogin() {
        getToken()
        localStorage.getItem('admin_type')
        if(localStorage.getItem('admin_type') == 1) {
        } else {
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .login::before{
    content: " ";
    width: 100%;
    height: 100%;
    content: " ";
    top: 0;
    position: absolute;
    background: url('~@/assets/img/login/background.jpg') no-repeat center center fixed;
    background-size: 100% 100%;
    opacity: 0.2;
    z-index: 0;
  }
  .login {
    width: 100%;
    height: 100vh;
    box-sizing: border-box;
    display: flex;
    background: black;
    .icon {
      width: 32px;
      height: 32px;
    }
    .login-language{
      height: 8vw;
    }
    .login-log{
      text-align: center;
    }
    .login-maintain-panel{
			border: 1px solid #72654d;
			border-radius: 10px;
			width: 60%;
			min-height: 80px;
			margin: 0 auto;
			background-color: rgba(0,0,0,1);
			text-align: center;
			font-size: 14px;
			padding: 5px;
      color: #bcaf95;
			word-break: break-all
		}
    .login-maintain-honorific{
			text-align: start;
		}
    .login-maintain-txt{
			text-align: start;
			text-indent:2em;
			margin: 10px;
		}
    .login-maintain-department{
			text-align: end;
			text-indent:4em;
		}
    .login-text{
      overflow: hidden;
      text-align: center;
      font-size: 16px;
      font-weight: 600;
      color: #bcaf95;
    }
    .login-log-text{
      font-size: 37px;
      font-family: KaiTi;
    }
    .login-panel{
      width: 273px;
      margin: 0 auto;
      z-index: 99;
      left: 50%;
      -webkit-transform: translateX(-50%);
      transform: translateX(-50%);
      position: absolute;
    }
    .login-row{
      margin-top: 7px;
    }
    .login-in{
      height: 49px;
      background: url('~@/assets/img/login/mark.png') no-repeat;
      position: relative;
      background-size: 860px;
    }
    .login-account{
      background-position: 0px 0px;
    }
    .login-password{
      background-position: 0px -51px;
    }
    .login-buttons{
      display: flex;
    }
    .login-input{
      height: 100%;
      background: none;
      border: none;
      outline: none;
      position: absolute;
      left: 47px;
      padding-left: 10px;
      width: 217px;
      color: white;
    }
    .login-code{
      width: 33px;
      margin-left: 12px;
      margin: 0 auto;
      margin-left: 7px;
      margin-top: 9px;
    }
    .login-btn{
      display: block;
      width: 48%;
      cursor: pointer;
      background-color: #244FAE;
      border: none;
      color: white;
      font-size: 17px;
    }
    .login-service{
      width: 100%;
      height: 35px;
      margin: 0 auto;
      border-radius: 3px;
      // background-color: rgba(0, 63, 134, 0.7);
      background-color: #244FAE;
      display: flex;
      justify-content: space-around;
      align-items: center;
    }
    /deep/ .el-input__inner {
      &:focus {
        border: 1px solid #4E83FD;
      }
    }

    /deep/ .el-input--medium .el-input__inner {
      height: 40px;
      line-height: 40px;
    }

    .left-wrap {
      width: 520px;
      height: 100%;
      background: #fff;
      background-size: cover;
      padding: 20px;
      box-sizing: border-box;

      .left-img {
        display: block;
        margin: auto;
        margin-top: 300px;
      }
    }

    .right-wrap {
      width: 100%;
      height: 100%;
      position: relative;

      .header {
        // display: none;
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
      }

      .login-wrap{
        width: 440px;
        height: 550px;
        border-radius: 5px;
        overflow: hidden;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
        background-size: cover;
        box-shadow: 0 0 10px rgba(28,76,186,.1);

        .form {
          widows: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 40px 30px;
          background: #fff;

          h3 {
            color: #555;
            font-size: 23px;
            text-align: center;
            font-weight: 500;
          }

          .input-label {
            color: #333;
            font-size: 14px;
            padding: 8px 0;
            display: block;
          }

          .code {
            display: flex;
            justify-content: space-between;

            .el-input {
              flex: 1;
              margin-right: 20px;
            }

            img {
              width: 115px;
              height: 40px;
              cursor: pointer;
              border-radius: 5px;
              background: #f8f8f8 !important;
            }
          }

          .login-btn {
            width: 100%;
            height: 40px;
            border: 0;
            color: #fff;
            background: #4E83FD;
          }
        }
      }
    }
  }

  @media only screen and (max-width: $device-ipad-pro) {
    .login {
      width: 100%;
      height: 100vh;

      .left-wrap {
        display: none;
      }

      .right-wrap {
        width: 100%;

        .header {
          display: flex;
          align-items: center;
          justify-content: center;

          h1 {
            font-weight: 500;
            margin-left: 15px;
          }
        }

        .login-wrap{
          width: 100%;
          height: auto;
          border-radius: 0;
          position: relative;
          box-shadow: none;

          .form {
            padding: 0px 30px;

            h3 {
              display: none;
            }
          }
        }
      }
    }
  }
</style>
