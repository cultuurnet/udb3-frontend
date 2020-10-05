<template>
  <pub-tags
    :tags="[
      'a tag',
      'and another one',
      'and another one',
      'and another one',
      'and another one',
    ]"
  />
</template>

<script>
  import PubTags from '@/components/event/index/pub-tags';

  export default {
    components: {
      PubTags,
    },
  };
</script>

<style lang="scss" scoped></style>
