<template>
  <pub-box class="element" v-bind="$props">
    <slot />
  </pub-box>
</template>

<script>
  import PubBox, { props as boxProps } from './pub-box';

  export default {
    components: {
      PubBox,
    },
    props: {
      ...boxProps({
        as: { default: 'li' },
        paddingVertical: { default: 2 },
        paddingHorizontal: { default: 3 },
      }),
    },
  };
</script>

<style lang="scss" scoped>
  .element {
    border: 1px solid black;
  }
</style>
