<template>
    <div
        :id="'diary' + diary.id"
        class="columns box is-relative diary-wrapper"
        style="margin-bottom: 25px"
    >
        <div style="width: 100%">
          <div class="is-flex w-170">
              <div class="column is-narrow has-text-weight-bold">
                  {{ diary.date }} {{ dayOfWeekDate }}
              </div>
          </div>
          <div class="column has-text-justified" ref="textBlock">
              <p v-for="(line, index) in entryLines" :key='index'>
                  {{ line }}
              </p>
          </div>
        </div>
    </div>
</template>

<script>
import utils from '../utils'

export default {
  name: 'Diary',
  props: [
    'diary',
    'index'
  ],
  computed: {
    dayOfWeekDate () {
      return utils.getDayOfWeek(this.diary.date)
    },
    entryLines () {
      return this.diary.entry.split('\n')
    }
  }
}
</script>

<style scoped>
.diary-wrapper {
    box-sizing: border-box;
    transition: 0.6s;
}

.w-170 {
    width: 170px;
}
</style>
