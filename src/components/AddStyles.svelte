<script>
  import { Button } from "figma-plugin-ds-svelte";
  export let disabled = true;
</script>

<div class="mt-xsmall">
  <Button on:click {disabled}>Add Styles</Button>
</div>
