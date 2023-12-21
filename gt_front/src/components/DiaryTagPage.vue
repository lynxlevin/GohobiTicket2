<template>
  <div class="pt-6" id="tickettop" v-bind:style="{backgroundColor: backgroundColor}">
    <div v-if="apiAccessed">
      <header-nav
        :isGivingRelation = "isGivingRelation"
        :otherReceivingRelations = "otherReceivingRelations"
        :correspondingRelationId = "correspondingRelationId"
        :isDiaryPage = true
      ></header-nav>
      <div
        class="container is-max-desktop has-text-centered"
      >
        <h1 class="title is-2 section pt-4 pb-4">
          <span class="subtitle is-4">
            {{relatedUserNickname}}との日記のタグ
          </span>
        </h1>
        <div class="diary-tags">
          <div class="section block pt-0 pb-4">
            <form>
              <div class="field">
                <label class="label">名前</label>
                <div class="control">
                  <input
                    type="text"
                    v-model="text"
                    class="input"
                  />
                </div>
              </div>

              <div class="is-relative">
                <div class="field">
                  <div class="control">
                    <button
                      v-on:click.stop.prevent="submit"
                      class="button is-link"
                    >
                      保存
                    </button>
                  </div>
                </div>
              </div>
            </form>
            <div>
              <template v-for="(tag, index) in tags">
                <div :key="index">
                  <p>
                    {{tag.text}}
                    <!-- <span>表示順: {{tag.sort_no}}</span> -->
                  </p>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderNav from './HeaderNav'
import axios from 'axios'

export default {
  components: {
    HeaderNav
  },
  name: 'DiaryTagPage',
  data: function () {
    return {
      userRelationId: 0,
      apiAccessed: false,
      otherReceivingRelations: [],
      isGivingRelation: false,
      backgroundColor: '#FFFFFF',
      relatedUserNickname: '',
      correspondingRelationId: '',
      tags: [],
      text: ''
    }
  },
  created: function () {
    this.$watch(
      () => this.$route.params,
      (toParams, _prev) => {
        this.userRelationId = toParams.relationId
        this.getInitialData()
        window.scroll({top: 0})
      },
      { immediate: true }
    )
  },
  methods: {
    getInitialData () {
      axios.get(`/api/user_relations/${this.userRelationId}/`).then(res => {
        this.otherReceivingRelations = res.data.other_receiving_relations
        this.apiAccessed = true

        this.isGivingRelation = res.data.user_relation_info.is_giving_relation
        this.backgroundColor = res.data.user_relation_info.background_color
        this.relatedUserNickname = res.data.user_relation_info.related_user_nickname
        this.correspondingRelationId = res.data.user_relation_info.corresponding_relation_id
      }).catch(err => {
        if (err.response.status === 403) {
          this.$router.push('/login')
        }
      })
      axios.get(`/api/diary_tags/?user_relation_id=${this.userRelationId}`).then(res => {
        this.tags = res.data.diary_tags
      }).catch(err => {
        if (err.response.status === 403) this.$router.push('/login')
      })
    },
    refreshDiaryTagList () {
      axios.get(`/api/diary_tags/?user_relation_id=${this.userRelationId}`).then(res => {
        this.tags = res.data.diary_tags
      }).catch(err => {
        if (err.response.status === 403) this.$router.push('/login')
      })
    }
  }
}
</script>

<style>
.diary-tags {
    max-width: 760px;
    margin: 0 auto;
}
</style>
