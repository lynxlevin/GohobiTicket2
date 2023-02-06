<template>
    <div style="background-color: rgb(250, 255, 255); height: 100vh;" class="container is-max-desktop has-text-centered">
        <form class="section block" accept-charset="UTF-8">
            <!-- <div class="field">
                <label for="user_email">Email</label><br>
                <input autofocus="autofocus" autocomplete="email" type="email" value=""id="user_email">
            </div> -->
            <div class="field">
                <label class="label" for="email">Username</label>
                <div class="control">
                  <input class="input" v-model="email" autofocus="autofocus" autocomplete="email" type="text" value="" id="email">
                </div>
            </div>

            <div class="field">
                <label class="label" for="password">Password</label>
                <div class="control">
                  <input class="input" v-model="password" autocomplete="current-password" type="password" id="password">
                </div>
            </div>

            <div class="box has-text-danger" v-if="errorMessage !== ''">
              {{ errorMessage }}
            </div>

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
      email: '',
      password: '',
      errorMessage: ''
    }
  },
  mounted: function () {
    axios.get('/user/csrf/')
    axios.get('/user/session/').then(response => {
      if (response.data.is_authenticated) {
        this.$router.push(response.data.default_page)
      }
    })
  },
  methods: {
    login () {
      const data = {
        email: this.email,
        password: this.password
      }
      axios
        .post('/user/login/', data, utils.getCsrfHeader())
        .then(response => {
          this.$router.push(response.data.default_page)
        })
        .catch(error => {
          this.errorMessage = error.response.data.detail
        })
    }
  }
}
</script>
