<template>
    <div style="background-color: rgb(250, 255, 255); height: 100vh;" class="container is-max-desktop has-text-centered">
        <form class="section block" action="/user/login/" accept-charset="UTF-8" method="post">
            <!-- <div class="field">
                <label for="user_email">Email</label><br>
                <input autofocus="autofocus" autocomplete="email" type="email" value=""id="user_email">
            </div> -->
            <div class="field">
                <label class="label" for="username">Username</label>
                <div class="control">
                  <input class="input" v-model="username" autofocus="autofocus" autocomplete="username" type="text" value="" id="username">
                </div>
            </div>

            <div class="field">
                <label class="label" for="password">Password</label>
                <div class="control">
                  <input class="input" v-model="password" autocomplete="current-password" type="password" id="password">
                </div>
            </div>

            <!-- <div class="field">
                <input type="hidden" value="0" autocomplete="off"><input type="checkbox" value="1" id="user_remember_me">
                <label for="user_remember_me">Remember me</label>
            </div> -->

            <div class="actions">
                <button type="button" @click="login" class="button">
                    Log in
                </button>
            </div>
        </form>
    </div>
</template>

<script>
import axios from 'axios'
import utils from '../utils'
export default {
  name: 'Login',
  data: function () {
    return {
      username: '',
      password: ''
    }
  },
  mounted: function () {
    axios.get('/user/csrf/')
  },
  methods: {
    login () {
      const data = {
        username: this.username,
        password: this.password
      }
      console.log(data)
      console.log(utils.getCsrfHeader())
      axios
        .post('/user/login/', data, utils.getCsrfHeader())
        .then((response) => {

        })
    }
  }
}
</script>
