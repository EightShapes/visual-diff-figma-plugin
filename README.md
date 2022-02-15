# Mendelsohn

This is a Figma plugin that creates visual diffs from nodes in a Figma file. It's used to see what's changed over time.

## Local development
1. `git clone` the repo.
2. `npm install`
3. `npm start`

Then, in the Figma Desktop App.

1. Go to Plugins > Development > Import Plugin from Manifest...
2. Choose the `./manifest.json` file in the root of the cloned repo.
3. Go to Plugins > Development > Mendelsohn to launch the plugin

Once the build is running, changes will be automatically watched and recompiled. You must use the shortcut `Cmd + Opt + P` to reload the plugin in Figma after it recompiles.

## Contributions
Contributions are welcome. Please submit a pull request to this repo. That will notify the maintainers and we'll take a look.

## Diff settings
The default threshold for the plugin to detect a difference is currently `0.1`. Subtle changes may not be flagged, but this threshold prevents false diffs caused by text antialiasing.