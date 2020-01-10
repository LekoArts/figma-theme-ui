<script>
  import { Button } from "figma-plugin-ds-svelte";
  export let disabled = true;
</script>

<style>
  .wrapper-styles {
    justify-content: center;
  }
</style>

<div class="mt-xsmall flex wrapper-styles">
  <Button on:click {disabled}>Add Styles</Button>
</div>
