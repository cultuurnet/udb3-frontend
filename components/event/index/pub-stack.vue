<template>
  <pub-box class="element" v-bind="propsToPassDown">
    <slot />
  </pub-box>
</template>

<script>
  import PubBox from './pub-box';
  import { marginProps, paddingProps } from './pub-box.vue';

  export const spacingProps = {
    spacing: {
      type: [Number, Object],
      default: 0,
    },
  };

  export default {
    components: {
      PubBox,
    },
    provide() {
      return {
        injectedProps: { marginBottom: this.spacing },
      };
    },
    props: {
      as: {
        type: [String, Object],
        default: 'section',
      },
      ...marginProps,
      ...paddingProps,
      ...spacingProps,
    },
    computed: {
      propsToPassDown() {
        const { spacing, ...rest } = this.$props;
        return rest;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .element {
    display: flex;
    flex-direction: column;
  }
  .element /deep/ {
    > *:last-child {
      margin-bottom: 0;
    }
  }
</style>
