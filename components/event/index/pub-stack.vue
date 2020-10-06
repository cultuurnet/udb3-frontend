<template>
  <pub-container class="element" v-bind="$props">
    <slot class="test" />
  </pub-container>
</template>

<script>
  import PubContainer, { props as containerProps } from './pub-container';
  import { props as boxProps } from './pub-box';

  export default {
    components: {
      PubContainer,
    },
    provide() {
      return {
        injectedProps: { marginBottom: this.spacing },
      };
    },
    props: {
      ...boxProps(),
      ...containerProps(),
    },
  };
</script>

<style lang="scss" scoped>
  .element {
    flex-direction: column;
  }
  .element /deep/ {
    > *:last-child {
      margin-bottom: 0;
    }
  }
</style>
