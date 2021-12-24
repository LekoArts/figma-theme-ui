---
"figma-theme-ui": major
---

In order to make future improvements easier the plugin is changing one behavior (but unfortunetaly in a breaking way). With v2 the plugin now expects a **JSON** file instead of a **JavaScript** file containing an object.

The shape of the `.json` file still has to follow the Theme UI specification.

See the [Migration guide](https://github.com/LekoArts/figma-theme-ui/blob/main/MIGRATING.md) for an example.

Other than that, not much has changed under the hood. The functionality stayed the same, but some complex and brittle logic to support JavaScript object notation is now gone which will allow new features to be more easily written (since one now can rely on `JSON.stringify()` and `JSON.parse()`).
