<template>
  <pub-container class="element" v-bind="$props">
    <slot class="test" />
  </pub-container>
</template>

<script>
  import merge from 'lodash.merge';
  import PubContainer, { props as containerProps } from './pub-container';
  import { props as boxProps } from './pub-box';

  export const props = (override = {}) =>
    merge(
      {
        ...boxProps(),
        ...containerProps(),
      },
      override,
    );

  export default {
    components: {
      PubContainer,
    },
    provide() {
      return {
        injectedProps: { marginRight: this.spacing },
      };
    },
    props: props(),
  };
</script>

<style lang="scss" scoped>
  .element /deep/ {
    > *:last-child {
      margin-right: 0;
    }
  }
</style>
