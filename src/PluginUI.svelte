<script>
  import { GlobalCSS, Type } from "figma-plugin-ds-svelte";

  import AddStyles from "./components/AddStyles.svelte";
  import FileInput from "./components/FileInput.svelte";

  let config = null;
  let disabled = true;
  let colorsChecked = true;
  let typographyChecked = true;

  $: disabled = config === null;

  function createStyles() {
    parent.postMessage(
      {
        pluginMessage: {
          type: "CREATE_STYLES",
          payload: {
            options: {
              colors: colorsChecked,
              typography: typographyChecked,
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
  .wrapper {
    text-align: center;
  }
  .footer {
    padding-top: var(--size-xxsmall);
    border-top: 1px solid var(--hover-fill);
  }
</style>

<div class="wrapper p-xsmall">
  <FileInput bind:config />
  <AddStyles
    on:addStyles={createStyles}
    bind:disabled
    bind:colorsChecked
    bind:typographyChecked />
  <div class="mt-medium footer">
    <Type>
      Upload a file with a valid theme
      <a
        href="https://theme-ui.com/theme-spec"
        target="_blank"
        rel="noreferrer noopener">
        specification
      </a>
    </Type>
    <Type>
      <a
        href="https://github.com/LekoArts/figma-theme-ui"
        target="_blank"
        rel="noreferrer noopener">
        GitHub
      </a>
    </Type>
  </div>
</div>
