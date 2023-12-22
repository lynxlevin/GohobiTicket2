<template>
    <div class="section block pt-4">
        <template
            v-for="(diary, index) in diaries"
        >
            <Diary
                :diary = "diary"
                :tagMaster = "tagMaster"
                :index = "index + 1"
                :key = "diary.id"
                :refreshDiaryList = "refreshDiaryList"
                :userRelationId = "userRelationId"
            ></Diary>
        </template>
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
    'diaries',
    'tagMaster',
    'refreshDiaryList',
    'userRelationId'
  ]
}
</script>
