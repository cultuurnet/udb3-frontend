<template>
  <pub-main>
    <sidebar />
    <div class="content">
      <nuxt />
    </div>
  </pub-main>
</template>

<script>
  import Sidebar from '../components/sidebar';
  import PubMain from '@/publiq-ui/pub-main';

  export default {
    name: 'Default',
    components: {
      Sidebar,
      PubMain,
    },
  };
</script>

<style lang="scss">
  .content {
    height: 100vh;
    overflow-x: hidden;
    overflow-y: auto;
  }
</style>
