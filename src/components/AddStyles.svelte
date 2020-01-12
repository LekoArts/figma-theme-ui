<script>
  import { Button, Checkbox } from "figma-plugin-ds-svelte";

  export let disabled;
  export let colorsChecked;
  export let typographyChecked;

  /*   let options;

  $: {
    console.log(options);
  } */
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
  <Button on:click {disabled}>Add Styles</Button>
</div>
