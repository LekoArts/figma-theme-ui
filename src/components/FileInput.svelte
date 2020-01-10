<script>
  import { Button, Type, Icon, IconTheme } from "figma-plugin-ds-svelte";

  let files = null;
  export let config = null;

  function onUpload(event) {
    files = event.target.files;
    const reader = new FileReader();

    reader.onabort = () => console.log("file reading was aborted");
    reader.onerror = () => console.log("file reading has failed");
    reader.onload = () => {
      const binaryStr = reader.result;
      config = binaryStr;
    };
    [...files].forEach(file => reader.readAsBinaryString(file));
  }
</script>

<style>
  [type="file"] {
    border: 0;
    clip: rect(0, 0, 0, 0);
    height: 1px;
    overflow: hidden;
    padding: 0;
    position: absolute !important;
    white-space: nowrap;
    width: 1px;
  }

  [type="file"] + label {
    background-color: var(--black);
    border-radius: var(--border-radius-small);
    color: var(--white);
    cursor: pointer;
    display: inline-flex;
    font-size: var(--font-size-small);
    height: var(--size-medium);
    line-height: var(--size-medium);
    padding-left: var(--size-xsmall);
    padding-right: var(--size-xsmall);
    transition: background-color 0.3s;
  }

  label {
    overflow: hidden;
    max-width: 250px;
  }

  label span {
    margin-right: var(--size-xxsmall);
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  [type="file"]:focus + label,
  [type="file"] + label:hover {
    background-color: var(--purple);
  }

  [type="file"]:focus + label {
    outline: 1px dotted #000;
    outline: -webkit-focus-ring-color auto 5px;
  }
</style>

<input type="file" id="theme-file" on:change={onUpload} />
<label for="theme-file">
  <Icon iconName={IconTheme} color="white" />
  {#if files && files[0]}
    <span>{files[0].name}</span>
  {:else}
    <span>Upload config</span>
  {/if}
</label>
