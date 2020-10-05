<template>
  <pub-box class="element" v-bind="$props">
    <slot />
  </pub-box>
</template>

<script>
  import PubBox from './pub-box';
  import { marginProps, paddingProps } from './pub-box.vue';

  export default {
    components: {
      PubBox,
    },
    props: {
      as: {
        type: [String, Object],
        default: 'li',
      },
      ...marginProps,
      ...paddingProps,
      paddingHorizontal: {
        type: [String, Number],
        default: 3,
      },
      paddingVertical: {
        type: [String, Number],
        default: 2,
      },
    },
  };
</script>

<style lang="scss" scoped>
  .element {
    border: 1px solid black;
  }
</style>
