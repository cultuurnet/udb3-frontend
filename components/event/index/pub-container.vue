<template>
  <pub-box class="pub-container" v-bind="propsToPassDown">
    <slot class="test" />
  </pub-box>
</template>

<script>
  import merge from 'lodash.merge';
  import omit from 'lodash.omit';

  import PubBox from './pub-box';
  import { props as boxProps } from './pub-box.vue';

  export const props = (override = {}) =>
    merge(
      {
        ...boxProps(),
        spacing: {
          type: [Number, Object],
          default: 0,
        },
      },
      override,
    );

  export default {
    components: {
      PubBox,
    },
    props: props({ as: { default: 'section' } }),
    computed: {
      propsToPassDown() {
        return omit(this.$props, ['spacing']);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .pub-container {
    display: flex;
  }
</style>
