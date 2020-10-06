<template>
  <pub-inline v-bind="propsToPassDown" class="pub-tags">
    <pub-tag v-for="tag in tags" :key="tag">{{ tag }}</pub-tag>
  </pub-inline>
</template>

<script>
  import merge from 'lodash.merge';
  import omit from 'lodash.omit';

  import PubInline, { props as inlineProps } from './pub-inline';
  import PubTag from './pub-tag';

  export const props = (override = {}) =>
    merge(
      {
        tags: {
          type: Array,
          default: () => [],
        },
        ...inlineProps(),
      },
      override,
    );

  export default {
    components: {
      PubInline,
      PubTag,
    },
    props: props({ as: { default: 'ul' }, spacing: { default: 4 } }),
    computed: {
      propsToPassDown() {
        return omit(this.$props, ['tags']);
      },
    },
  };
</script>
