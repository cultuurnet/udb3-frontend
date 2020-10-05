<template>
  <pub-tags :spacing="4" :tags="['a tag', 'and another one']" />
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
