<script>
  import { Button, Checkbox } from "figma-plugin-ds-svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let disabled;
  export let colorsChecked;
  export let typographyChecked;
</script>

<style>
  .wrapper-styles {
    justify-content: center;
  }
</style>

<div class="flex wrapper-styles">
  <Checkbox bind:checked={colorsChecked} {disabled}>Colors</Checkbox>
  <Checkbox bind:checked={typographyChecked} {disabled}>Typography</Checkbox>
</div>
<div class="mt-xsmall flex wrapper-styles">
  <Button on:click={() => dispatch('addStyles')} {disabled}>Add Styles</Button>
</div>
