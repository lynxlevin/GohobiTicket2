<template>
    <div class="section block pt-4">
        <div id="diaries">
          <div>
            <template
                v-for="(diary, index) in diaries"
            >
                <Diary
                    :diary="diary"
                    :index="index + 1"
                    :key="diary.id"
                ></Diary>
            </template>
          </div>
        </div>
    </div>
</template>

<script>
import Diary from './Diary'

export default {
  components: {
    Diary
  },
  name: 'Diaries',
  props: [
    'diaries'
  ]
}
</script>
