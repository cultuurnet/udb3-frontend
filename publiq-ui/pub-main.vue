<template>
  <section class="main">
    <slot />
  </section>
</template>

<script>
  export default {};
</script>

<style lang="scss" scoped>
  .main {
    display: flex;
    flex-direction: row;
    position: relative;
    z-index: 0;
  }
</style>
