<template>
  <pub-stack v-bind="$props">
    <pub-tag>a tag</pub-tag>
    <pub-tag>another one</pub-tag>
    <pub-tag>and one more</pub-tag>
  </pub-stack>
</template>

<script>
  import PubStack from './pub-stack';
  import PubTag from './pub-tag';

  import { marginProps, paddingProps } from './pub-box.vue';
  import { spacingProps } from './pub-inline.vue';

  export default {
    components: {
      PubStack,
      PubTag,
    },
    props: {
      as: {
        type: [String, Object],
        default: 'ul',
      },
      ...marginProps,
      ...paddingProps,
      ...spacingProps,
    },
  };
</script>
