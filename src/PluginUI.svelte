<script>
  import { GlobalCSS } from "figma-plugin-ds-svelte";
  import { Button, Type, Icon, IconTheme } from "figma-plugin-ds-svelte";

  import AddStyles from "./components/AddStyles.svelte";
  import FileInput from "./components/FileInput.svelte";

  let config = null;
  let disabled = true;

  $: disabled = config === null;

  function createStyles() {
    parent.postMessage(
      {
        pluginMessage: {
          type: "CREATE_STYLES",
          payload: {
            options: {
              colors: true,
              typography: false,
              shadows: false
            },
            config
          }
        }
      },
      "*"
    );
  }
</script>

<style>
  /* Add additional global or scoped styles here */
</style>

<div class="wrapper p-xsmall">
  <FileInput bind:config />
  <AddStyles on:click={createStyles} bind:disabled />
</div>
