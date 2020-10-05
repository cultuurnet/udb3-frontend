<template>
  <pub-inline v-bind="propsToPassDown">
    <pub-tag v-for="tag in tags" :key="tag">{{ tag }}</pub-tag>
  </pub-inline>
</template>

<script>
  import PubInline, { spacingProps } from './pub-inline';
  import PubTag from './pub-tag';

  import { marginProps, paddingProps } from './pub-box.vue';

  export default {
    components: {
      PubInline,
      PubTag,
    },
    props: {
      tags: {
        type: Array,
        default: () => [],
      },
      as: {
        type: [String, Object],
        default: 'ul',
      },
      ...marginProps,
      ...paddingProps,
      ...spacingProps,
    },
    computed: {
      propsToPassDown() {
        const { tags, ...rest } = this.$props;
        return rest;
      },
    },
  };
</script>
